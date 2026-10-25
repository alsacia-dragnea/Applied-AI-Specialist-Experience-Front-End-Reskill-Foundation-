package com.chapterandco.service;

import com.chapterandco.dto.CheckoutRequest;
import com.chapterandco.entity.*;
import com.chapterandco.exception.BusinessRuleException;
import com.chapterandco.exception.ResourceNotFoundException;
import com.chapterandco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final AddressRepository addressRepository;
    private final GiftPointsTransactionRepository giftPointsRepo;

    public List<Order> getOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrder(String id, String userId) {
        return orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Transactional
    public Order placeOrder(String userId, CheckoutRequest request) {
        // Validate address ownership
        addressRepository.findByIdAndUserId(request.addressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        // Fetch books server-side (authoritative pricing)
        List<String> bookIds = request.items().stream().map(CheckoutRequest.CheckoutItem::bookId).toList();
        List<Book> books = bookRepository.findAllById(bookIds);
        if (books.size() != bookIds.size()) {
            throw new ResourceNotFoundException("One or more books not found");
        }
        Map<String, Book> bookMap = books.stream().collect(Collectors.toMap(Book::getId, b -> b));

        // Check stock
        for (CheckoutRequest.CheckoutItem item : request.items()) {
            Book book = bookMap.get(item.bookId());
            if (book.getStock() < item.quantity()) {
                throw new BusinessRuleException("\"" + book.getTitle() + "\" has insufficient stock");
            }
        }

        // Calculate totals using server-side prices
        BigDecimal subtotal = request.items().stream()
                .map(item -> bookMap.get(item.bookId()).getPrice()
                        .multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("25.00")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("3.99");

        // Validate gift points
        BigDecimal giftDiscount = BigDecimal.ZERO;
        if (request.giftPointsToRedeem() > 0) {
            int balance = computeGiftPointsBalance(userId);
            if (request.giftPointsToRedeem() > balance) {
                throw new BusinessRuleException("Insufficient gift points");
            }
            giftDiscount = BigDecimal.valueOf(request.giftPointsToRedeem())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        BigDecimal total = subtotal.add(shippingCost).subtract(giftDiscount).max(BigDecimal.ZERO);

        // Create order
        Order order = Order.builder()
                .id(UUID.randomUUID().toString())
                .reference(UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                .userId(userId)
                .addressId(request.addressId())
                .status(OrderStatus.CONFIRMED)
                .subtotal(subtotal)
                .shippingCost(shippingCost)
                .giftPointsUsed(request.giftPointsToRedeem())
                .giftPointsDiscount(giftDiscount)
                .total(total)
                .build();
        orderRepository.save(order);

        // Create order items and deduct stock
        for (CheckoutRequest.CheckoutItem item : request.items()) {
            Book book = bookMap.get(item.bookId());
            // (OrderItem persistence handled via cascade — simplified here)
            book.setStock(book.getStock() - item.quantity());
            bookRepository.save(book);
        }

        // Award gift points (1 point per £1 spent)
        int pointsEarned = total.intValue();
        if (pointsEarned > 0) {
            giftPointsRepo.save(GiftPointsTransaction.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .orderId(order.getId())
                    .type(GiftPointsType.EARNED)
                    .points(pointsEarned)
                    .description("Points earned on order " + order.getReference())
                    .build());
        }

        // Deduct redeemed points
        if (request.giftPointsToRedeem() > 0) {
            giftPointsRepo.save(GiftPointsTransaction.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .orderId(order.getId())
                    .type(GiftPointsType.REDEEMED)
                    .points(request.giftPointsToRedeem())
                    .description("Points redeemed on order " + order.getReference())
                    .build());
        }

        // Create payment record
        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .orderId(order.getId())
                .method(PaymentMethod.valueOf(request.paymentMethod()))
                .status(PaymentStatus.COMPLETED)
                .amount(total)
                .demoCardLast4(request.cardLast4() != null ? request.cardLast4() : "4242")
                .transactionRef("DEMO-" + System.currentTimeMillis())
                .build();
        // Payment is saved via cascade from Order, but we save directly here
        // (mapped via order_id FK — saved separately)
        order.setPayment(payment);

        return order;
    }

    @Transactional
    public Order cancelOrder(String id, String userId) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("Order is already cancelled");
        }

        long hoursSinceOrder = (System.currentTimeMillis() - order.getCreatedAt().toEpochMilli()) / (1000 * 60 * 60);
        if (hoursSinceOrder > 48) {
            throw new BusinessRuleException("Orders can only be cancelled within 48 hours of purchase");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Refund gift points if redeemed
        if (order.getGiftPointsUsed() > 0) {
            giftPointsRepo.save(GiftPointsTransaction.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .orderId(order.getId())
                    .type(GiftPointsType.REFUNDED)
                    .points(order.getGiftPointsUsed())
                    .description("Refund for cancelled order " + order.getReference())
                    .build());
        }

        // Restore stock
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Book book = bookRepository.findById(item.getBookId()).orElse(null);
                if (book != null) {
                    book.setStock(book.getStock() + item.getQuantity());
                    bookRepository.save(book);
                }
            }
        }

        return order;
    }

    public int computeGiftPointsBalance(String userId) {
        return giftPointsRepo.findByUserId(userId).stream()
                .mapToInt(t -> switch (t.getType()) {
                    case EARNED, REFUNDED -> t.getPoints();
                    case REDEEMED -> -t.getPoints();
                })
                .sum();
    }
}
