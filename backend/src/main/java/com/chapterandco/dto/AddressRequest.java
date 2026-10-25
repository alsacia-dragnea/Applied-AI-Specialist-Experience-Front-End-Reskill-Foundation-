package com.chapterandco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
    @NotBlank String fullName,
    @NotBlank String line1,
    String line2,
    @NotBlank String city,
    String state,
    @NotBlank String postalCode,
    @NotBlank @Size(min = 2, max = 2) String country,
    boolean isDefault
) {}
