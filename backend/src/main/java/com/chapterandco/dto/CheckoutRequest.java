package com.chapterandco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CheckoutRequest(
    @NotBlank String addressId,
    @NotBlank String paymentMethod,
    String cardLast4,
    @Min(0) int giftPointsToRedeem,
    @NotNull @Size(min = 1) List<CheckoutItem> items
) {
    public record CheckoutItem(
        @NotBlank String bookId,
        @Min(1) @Max(10) int quantity
    ) {}
}
