package com.chapterandco.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "orderId", nullable = false)
    private String orderId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderId", insertable = false, updatable = false)
    private Order order;

    @Column(name = "bookId", nullable = false)
    private String bookId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bookId", insertable = false, updatable = false)
    private Book book;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unitPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "totalPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
}
