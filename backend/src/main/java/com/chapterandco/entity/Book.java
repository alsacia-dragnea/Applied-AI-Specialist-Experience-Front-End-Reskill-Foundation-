package com.chapterandco.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "books")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(name = "authorId", nullable = false)
    private String authorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorId", insertable = false, updatable = false)
    private Author author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "coverUrl")
    private String coverUrl;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "compareAtPrice", precision = 10, scale = 2)
    private BigDecimal compareAtPrice;

    @Column(unique = true)
    private String isbn;

    private String publisher;

    @Column(name = "publishedAt")
    private Instant publishedAt;

    private Integer pages;

    @Column(nullable = false)
    private String language = "English";

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false)
    private Boolean bestseller = false;

    @Column(name = "createdAt", nullable = false)
    private Instant createdAt;

    @Column(name = "updatedAt", nullable = false)
    private Instant updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "book_categories",
        joinColumns = @JoinColumn(name = "bookId"),
        inverseJoinColumns = @JoinColumn(name = "categoryId")
    )
    private List<Category> categories;

    @PrePersist
    void prePersist() { createdAt = Instant.now(); updatedAt = Instant.now(); }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }
}
