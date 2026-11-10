package com.chapterandco.controller;

import com.chapterandco.repository.AuthorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/authors")
@Tag(name = "Authors", description = "Browse by author (brand)")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorRepository authorRepository;

    @GetMapping
    @Operation(summary = "List all authors, sorted by name")
    public ResponseEntity<Map<String, Object>> list() {
        return ResponseEntity.ok(Map.of("authors", authorRepository.findAllByOrderByNameAsc()));
    }
}
