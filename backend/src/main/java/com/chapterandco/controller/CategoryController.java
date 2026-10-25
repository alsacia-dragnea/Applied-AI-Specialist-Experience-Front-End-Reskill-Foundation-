package com.chapterandco.controller;

import com.chapterandco.entity.Category;
import com.chapterandco.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "Categories", description = "Book categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "List all categories")
    public ResponseEntity<Map<String, Object>> list() {
        return ResponseEntity.ok(Map.of("categories", categoryRepository.findAll()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<Map<String, Object>> getBySlug(@PathVariable String slug) {
        Category cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new com.chapterandco.exception.ResourceNotFoundException("Category not found: " + slug));
        return ResponseEntity.ok(Map.of("category", cat));
    }
}
