package com.chapterandco.service;

import com.chapterandco.entity.Book;
import com.chapterandco.exception.ResourceNotFoundException;
import com.chapterandco.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public Page<Book> findBooks(String search, String categorySlug, String sort, int page, int limit) {
        Sort sorting = switch (sort == null ? "newest" : sort) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "title_asc"  -> Sort.by("title").ascending();
            case "bestseller" -> Sort.by("bestseller").descending();
            default           -> Sort.by("createdAt").descending();
        };
        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), Math.min(limit, 48), sorting);
        return bookRepository.findWithFilters(
                (search == null || search.isBlank()) ? null : search,
                (categorySlug == null || categorySlug.isBlank()) ? null : categorySlug,
                pageRequest);
    }

    public Book findBySlug(String slug) {
        return bookRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + slug));
    }

    public List<Book> getFeatured() {
        return bookRepository.findByFeaturedTrueOrderByCreatedAtDesc();
    }

    public List<Book> getBestsellers() {
        return bookRepository.findByBestsellerTrueOrderByCreatedAtDesc();
    }
}
