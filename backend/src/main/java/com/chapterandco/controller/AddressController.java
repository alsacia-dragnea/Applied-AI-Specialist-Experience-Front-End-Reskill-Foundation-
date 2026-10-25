package com.chapterandco.controller;

import com.chapterandco.dto.AddressRequest;
import com.chapterandco.entity.Address;
import com.chapterandco.entity.User;
import com.chapterandco.service.AddressService;
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
@RequestMapping("/api/v1/addresses")
@Tag(name = "Addresses", description = "Manage delivery addresses")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "List user addresses")
    public ResponseEntity<Map<String, Object>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("addresses", addressService.getAddresses(user.getId())));
    }

    @PostMapping
    @Operation(summary = "Create a delivery address")
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressRequest request) {
        Address address = addressService.createAddress(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("address", address));
    }
}
