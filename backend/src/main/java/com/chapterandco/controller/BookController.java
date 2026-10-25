package com.chapterandco.controller;

import com.chapterandco.entity.Book;
import com.chapterandco.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Browse and search books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    @Operation(summary = "List books with optional filters")
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        Page<Book> result = bookService.findBooks(search, category, sort, page, limit);
        return ResponseEntity.ok(Map.of(
                "books", result.getContent(),
                "pagination", Map.of(
                        "page", result.getNumber() + 1,
                        "limit", result.getSize(),
                        "total", result.getTotalElements(),
                        "pages", result.getTotalPages()
                )
        ));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured books")
    public ResponseEntity<Map<String, Object>> featured() {
        return ResponseEntity.ok(Map.of("books", bookService.getFeatured()));
    }

    @GetMapping("/bestsellers")
    @Operation(summary = "Get bestselling books")
    public ResponseEntity<Map<String, Object>> bestsellers() {
        return ResponseEntity.ok(Map.of("books", bookService.getBestsellers()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get book by slug")
    public ResponseEntity<Map<String, Object>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(Map.of("book", bookService.findBySlug(slug)));
    }
}
