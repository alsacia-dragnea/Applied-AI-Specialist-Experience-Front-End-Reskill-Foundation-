package com.chapterandco.controller;

import com.chapterandco.config.SecurityConfig;
import com.chapterandco.entity.Book;
import com.chapterandco.entity.Author;
import com.chapterandco.exception.ResourceNotFoundException;
import com.chapterandco.repository.UserRepository;
import com.chapterandco.security.JwtAuthenticationFilter;
import com.chapterandco.security.JwtTokenProvider;
import com.chapterandco.service.BookService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@DisplayName("BookController API tests")
class BookControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean BookService bookService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean UserRepository userRepository;

    private Book makeBook(String id, String title) {
        Author author = Author.builder().id("a-1").name("Test Author").build();
        return Book.builder()
                .id(id).title(title).slug(title.toLowerCase().replace(" ", "-"))
                .price(new BigDecimal("12.99")).stock(5).featured(true).bestseller(false)
                .author(author).build();
    }

    @Test
    @DisplayName("GET /api/v1/books — 200 with paginated books list")
    void listBooks_returns200() throws Exception {
        List<Book> books = List.of(makeBook("b-1", "Clean Code"), makeBook("b-2", "Pragmatic Programmer"));
        when(bookService.findBooks(any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(books, PageRequest.of(0, 12), 2));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray())
                .andExpect(jsonPath("$.books.length()").value(2))
                .andExpect(jsonPath("$.pagination.total").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/books?search=clean — filters by search term")
    void listBooks_withSearch_returns200() throws Exception {
        List<Book> books = List.of(makeBook("b-1", "Clean Code"));
        when(bookService.findBooks(eq("clean"), any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(books, PageRequest.of(0, 12), 1));

        mockMvc.perform(get("/api/v1/books?search=clean"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books.length()").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/books/{slug} — 200 with book detail")
    void getBySlug_returns200() throws Exception {
        when(bookService.findBySlug("clean-code")).thenReturn(makeBook("b-1", "Clean Code"));

        mockMvc.perform(get("/api/v1/books/clean-code"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.book.title").value("Clean Code"));
    }

    @Test
    @DisplayName("GET /api/v1/books/{slug} — 404 for unknown slug")
    void getBySlug_notFound_returns404() throws Exception {
        when(bookService.findBySlug("unknown"))
                .thenThrow(new ResourceNotFoundException("Book not found: unknown"));

        mockMvc.perform(get("/api/v1/books/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("GET /api/v1/books/featured — 200 with featured list")
    void featured_returns200() throws Exception {
        when(bookService.getFeatured()).thenReturn(List.of(makeBook("b-1", "Featured Book")));

        mockMvc.perform(get("/api/v1/books/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books.length()").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/books/bestsellers — 200 with bestsellers list")
    void bestsellers_returns200() throws Exception {
        when(bookService.getBestsellers()).thenReturn(List.of(makeBook("b-1", "Bestseller")));

        mockMvc.perform(get("/api/v1/books/bestsellers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books.length()").value(1));
    }
}
