package com.chapterandco.service;

import com.chapterandco.entity.Book;
import com.chapterandco.entity.Order;
import com.chapterandco.entity.OrderItem;
import com.chapterandco.repository.BookRepository;
import com.chapterandco.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;

    public List<Book> getRecommendations(String userId) {
        if (userId == null) {
            return bookRepository.findByFeaturedTrueOrderByCreatedAtDesc()
                    .stream().limit(8).collect(Collectors.toList());
        }

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (orders.isEmpty()) {
            return bookRepository.findByFeaturedTrueOrderByCreatedAtDesc()
                    .stream().limit(8).collect(Collectors.toList());
        }

        // Collect purchased book IDs and category IDs
        List<String> purchasedBookIds = orders.stream()
                .filter(o -> o.getOrderItems() != null)
                .flatMap(o -> o.getOrderItems().stream())
                .map(OrderItem::getBookId)
                .distinct()
                .collect(Collectors.toList());

        List<String> categoryIds = orders.stream()
                .filter(o -> o.getOrderItems() != null)
                .flatMap(o -> o.getOrderItems().stream())
                .map(item -> {
                    Book b = item.getBook();
                    if (b != null && b.getCategories() != null) {
                        return b.getCategories().stream().map(c -> c.getId()).collect(Collectors.toList());
                    }
                    return List.<String>of();
                })
                .flatMap(List::stream)
                .distinct()
                .collect(Collectors.toList());

        if (categoryIds.isEmpty()) {
            return bookRepository.findByFeaturedTrueOrderByCreatedAtDesc()
                    .stream().limit(8).collect(Collectors.toList());
        }

        List<String> excludeIds = purchasedBookIds.isEmpty() ? List.of("__none__") : purchasedBookIds;
        return bookRepository.findRecommendations(categoryIds, excludeIds, PageRequest.of(0, 8));
    }
}
