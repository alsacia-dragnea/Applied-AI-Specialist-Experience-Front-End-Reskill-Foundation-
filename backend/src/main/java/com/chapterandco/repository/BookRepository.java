package com.chapterandco.repository;

import com.chapterandco.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, String> {

    Optional<Book> findBySlug(String slug);

    @Query("""
        SELECT DISTINCT b FROM Book b
        LEFT JOIN b.author a
        LEFT JOIN b.categories c
        WHERE (:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:categorySlug IS NULL OR c.slug = :categorySlug)
        """)
    Page<Book> findWithFilters(
        @Param("search") String search,
        @Param("categorySlug") String categorySlug,
        Pageable pageable
    );

    List<Book> findByFeaturedTrueOrderByCreatedAtDesc();

    List<Book> findByBestsellerTrueOrderByCreatedAtDesc();

    @Query("""
        SELECT DISTINCT b FROM Book b
        LEFT JOIN b.categories c
        WHERE c.id IN :categoryIds
          AND b.id NOT IN :excludeIds
        ORDER BY b.bestseller DESC
        """)
    List<Book> findRecommendations(
        @Param("categoryIds") List<String> categoryIds,
        @Param("excludeIds") List<String> excludeIds,
        Pageable pageable
    );
}
