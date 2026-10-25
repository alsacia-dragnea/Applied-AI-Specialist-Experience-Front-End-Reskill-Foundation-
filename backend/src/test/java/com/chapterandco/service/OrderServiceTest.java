package com.chapterandco.service;

import com.chapterandco.dto.CheckoutRequest;
import com.chapterandco.entity.*;
import com.chapterandco.exception.BusinessRuleException;
import com.chapterandco.exception.ResourceNotFoundException;
import com.chapterandco.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService unit tests")
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock BookRepository bookRepository;
    @Mock AddressRepository addressRepository;
    @Mock GiftPointsTransactionRepository giftPointsRepo;
    @InjectMocks OrderService orderService;

    private Book book;
    private Address address;
    private Order order;

    @BeforeEach
    void setup() {
        book = Book.builder()
                .id("book-1")
                .title("Clean Code")
                .slug("clean-code")
                .price(new BigDecimal("19.99"))
                .stock(10)
                .build();

        address = Address.builder()
                .id("addr-1")
                .userId("user-1")
                .fullName("Alice Smith")
                .line1("1 Main St")
                .city("London")
                .postalCode("SW1A 1AA")
                .country("GB")
                .build();

        order = Order.builder()
                .id("order-1")
                .reference("REF001")
                .userId("user-1")
                .status(OrderStatus.CONFIRMED)
                .subtotal(new BigDecimal("19.99"))
                .shippingCost(new BigDecimal("3.99"))
                .giftPointsUsed(0)
                .giftPointsDiscount(BigDecimal.ZERO)
                .total(new BigDecimal("23.98"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    // ── GET ORDER ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getOrder — returns order when it belongs to user")
    void getOrder_success() {
        when(orderRepository.findByIdAndUserId("order-1", "user-1")).thenReturn(Optional.of(order));
        Order result = orderService.getOrder("order-1", "user-1");
        assertThat(result.getId()).isEqualTo("order-1");
    }

    @Test
    @DisplayName("getOrder — throws when order not found")
    void getOrder_notFound() {
        when(orderRepository.findByIdAndUserId("bad-id", "user-1")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> orderService.getOrder("bad-id", "user-1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getOrder — throws when order belongs to different user (IDOR prevention)")
    void getOrder_wrongUser() {
        when(orderRepository.findByIdAndUserId("order-1", "user-2")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> orderService.getOrder("order-1", "user-2"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── CANCELLATION ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelOrder — cancels order within 48 hours")
    void cancelOrder_within48Hours() {
        order.setCreatedAt(Instant.now().minusSeconds(3600)); // 1 hour ago
        when(orderRepository.findByIdAndUserId("order-1", "user-1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        Order cancelled = orderService.cancelOrder("order-1", "user-1");
        assertThat(cancelled.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    @DisplayName("cancelOrder — rejects cancellation after 48 hours")
    void cancelOrder_after48Hours() {
        order.setCreatedAt(Instant.now().minusSeconds(49 * 3600)); // 49 hours ago
        when(orderRepository.findByIdAndUserId("order-1", "user-1")).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder("order-1", "user-1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("48 hours");
    }

    @Test
    @DisplayName("cancelOrder — rejects if already cancelled")
    void cancelOrder_alreadyCancelled() {
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findByIdAndUserId("order-1", "user-1")).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder("order-1", "user-1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already cancelled");
    }

    // ── GIFT POINTS ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("computeGiftPointsBalance — calculates net balance correctly")
    void giftPointsBalance() {
        GiftPointsTransaction earned = GiftPointsTransaction.builder()
                .type(GiftPointsType.EARNED).points(500).build();
        GiftPointsTransaction redeemed = GiftPointsTransaction.builder()
                .type(GiftPointsType.REDEEMED).points(100).build();
        when(giftPointsRepo.findByUserId("user-1")).thenReturn(List.of(earned, redeemed));

        int balance = orderService.computeGiftPointsBalance("user-1");
        assertThat(balance).isEqualTo(400);
    }

    @Test
    @DisplayName("computeGiftPointsBalance — returns 0 for new user")
    void giftPointsBalance_empty() {
        when(giftPointsRepo.findByUserId("user-1")).thenReturn(List.of());
        assertThat(orderService.computeGiftPointsBalance("user-1")).isEqualTo(0);
    }

    // ── CHECKOUT VALIDATION ───────────────────────────────────────────────────

    @Test
    @DisplayName("placeOrder — throws when address not found")
    void placeOrder_addressNotFound() {
        when(addressRepository.findByIdAndUserId("addr-bad", "user-1")).thenReturn(Optional.empty());
        CheckoutRequest req = new CheckoutRequest("addr-bad", "DEMO_CARD", null, 0,
                List.of(new CheckoutRequest.CheckoutItem("book-1", 1)));
        assertThatThrownBy(() -> orderService.placeOrder("user-1", req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("placeOrder — throws when insufficient stock")
    void placeOrder_insufficientStock() {
        book.setStock(0);
        when(addressRepository.findByIdAndUserId("addr-1", "user-1")).thenReturn(Optional.of(address));
        when(bookRepository.findAllById(any())).thenReturn(List.of(book));

        CheckoutRequest req = new CheckoutRequest("addr-1", "DEMO_CARD", null, 0,
                List.of(new CheckoutRequest.CheckoutItem("book-1", 2)));
        assertThatThrownBy(() -> orderService.placeOrder("user-1", req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("insufficient stock");
    }

    @Test
    @DisplayName("placeOrder — throws when insufficient gift points")
    void placeOrder_insufficientGiftPoints() {
        when(addressRepository.findByIdAndUserId("addr-1", "user-1")).thenReturn(Optional.of(address));
        when(bookRepository.findAllById(any())).thenReturn(List.of(book));
        when(giftPointsRepo.findByUserId("user-1")).thenReturn(List.of()); // 0 balance

        CheckoutRequest req = new CheckoutRequest("addr-1", "DEMO_CARD", null, 500,
                List.of(new CheckoutRequest.CheckoutItem("book-1", 1)));
        assertThatThrownBy(() -> orderService.placeOrder("user-1", req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Insufficient gift points");
    }
}
