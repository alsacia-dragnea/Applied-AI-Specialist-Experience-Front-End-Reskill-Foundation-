package com.chapterandco.controller;

import com.chapterandco.dto.CheckoutRequest;
import com.chapterandco.entity.Order;
import com.chapterandco.entity.User;
import com.chapterandco.service.OrderService;
import com.chapterandco.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Orders", description = "Cart checkout and order management")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final RecommendationService recommendationService;

    @PostMapping("/checkout")
    @Operation(summary = "Place a new order")
    public ResponseEntity<Map<String, Object>> checkout(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CheckoutRequest request) {
        Order order = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("orderId", order.getId(), "reference", order.getReference()));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get order history")
    public ResponseEntity<Map<String, Object>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("orders", orderService.getOrders(user.getId())));
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get order detail")
    public ResponseEntity<Map<String, Object>> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return ResponseEntity.ok(Map.of("order", orderService.getOrder(id, user.getId())));
    }

    @PatchMapping("/orders/{id}")
    @Operation(summary = "Cancel an order (within 48 hours)")
    public ResponseEntity<Map<String, Object>> cancel(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        if (!"cancel".equals(body.get("action"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action"));
        }
        Order order = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(Map.of("order", order));
    }

    @GetMapping("/gift-points")
    @Operation(summary = "Get gift points balance")
    public ResponseEntity<Map<String, Object>> giftPoints(@AuthenticationPrincipal User user) {
        int balance = orderService.computeGiftPointsBalance(user.getId());
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get personalized book recommendations")
    public ResponseEntity<Map<String, Object>> recommendations(@AuthenticationPrincipal User user) {
        String userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(Map.of(
                "books", recommendationService.getRecommendations(userId),
                "reason", userId != null ? "personalized" : "featured"
        ));
    }
}
