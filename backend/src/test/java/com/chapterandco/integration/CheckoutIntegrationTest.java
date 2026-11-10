package com.chapterandco.integration;

import com.chapterandco.dto.CheckoutRequest;
import com.chapterandco.entity.*;
import com.chapterandco.repository.*;
import com.chapterandco.service.BookService;
import com.chapterandco.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end persistence tests against a real (H2) database with real entities and repositories.
 * Unit tests with mocked repositories cannot catch persistence-order or mapping bugs; these do.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Checkout / order lifecycle (real persistence)")
class CheckoutIntegrationTest {

    @Autowired OrderService orderService;
    @Autowired BookService bookService;
    @Autowired UserRepository userRepository;
    @Autowired AddressRepository addressRepository;
    @Autowired BookRepository bookRepository;
    @Autowired AuthorRepository authorRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired GiftPointsTransactionRepository giftPointsRepo;

    private String userId;
    private String addressId;

    @BeforeEach
    void seed() {
        User user = userRepository.save(User.builder()
                .id("u1").name("Test").email("t@example.com").password("x").build());
        userId = user.getId();
        addressId = addressRepository.save(Address.builder()
                .id("ad1").userId(userId).fullName("T U").line1("1 St").city("X")
                .postalCode("1").country("US").isDefault(true).build()).getId();

        authorRepository.save(Author.builder().id("a1").name("Author One").build());
        authorRepository.save(Author.builder().id("a2").name("Author Two").build());
        Category fiction = categoryRepository.save(
                Category.builder().id("c1").name("Fiction").slug("fiction").build());

        saveBook("b1", "Book One", "a1", fiction, 10);
        saveBook("b2", "Book Two", "a1", fiction, 5);
        saveBook("b3", "Book Three", "a2", fiction, 5);
    }

    private void saveBook(String id, String title, String authorId, Category cat, int stock) {
        bookRepository.save(Book.builder()
                .id(id).title(title).slug(title.toLowerCase().replace(' ', '-'))
                .authorId(authorId).description("d").price(new BigDecimal("10.00"))
                .stock(stock).featured(true).bestseller(false).language("English")
                .categories(List.of(cat)).build());
    }

    private CheckoutRequest request(String bookId, int qty, int redeem) {
        return new CheckoutRequest(addressId, "DEMO_CARD", "4242", redeem,
                List.of(new CheckoutRequest.CheckoutItem(bookId, qty)));
    }

    @Test
    @DisplayName("placeOrder persists order, items, payment, gift points and decrements stock")
    void placeOrder_persistsEverything() {
        Order placed = orderService.placeOrder(userId, request("b1", 2, 0));

        Order stored = orderRepository.findByIdAndUserId(placed.getId(), userId).orElseThrow();
        assertThat(stored.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(stored.getOrderItems()).hasSize(1);
        assertThat(stored.getOrderItems().get(0).getTotalPrice()).isEqualByComparingTo("20.00");
        assertThat(stored.getPayment()).isNotNull();
        assertThat(stored.getPayment().getMethod()).isEqualTo(PaymentMethod.DEMO_CARD);
        assertThat(bookRepository.findById("b1").orElseThrow().getStock()).isEqualTo(8);
        assertThat(orderService.computeGiftPointsBalance(userId)).isEqualTo(stored.getTotal().intValue());
    }

    @Test
    @DisplayName("cancelOrder refunds redeemed points and restores stock")
    void cancel_restoresStockAndPoints() {
        orderService.placeOrder(userId, request("b1", 1, 0));            // earns 13 points
        Order second = orderService.placeOrder(userId, request("b2", 1, 5)); // redeems 5

        orderService.cancelOrder(second.getId(), userId);

        assertThat(orderRepository.findById(second.getId()).orElseThrow().getStatus())
                .isEqualTo(OrderStatus.CANCELLED);
        assertThat(bookRepository.findById("b2").orElseThrow().getStock()).isEqualTo(5);
        assertThat(giftPointsRepo.findByUserId(userId))
                .anyMatch(t -> t.getType() == GiftPointsType.REFUNDED && t.getPoints() == 5);
    }

    @Test
    @DisplayName("buy-again returns distinct purchased books and skips cancelled orders")
    void buyAgain_distinctAndSkipsCancelled() {
        orderService.placeOrder(userId, request("b1", 1, 0));
        orderService.placeOrder(userId, request("b1", 1, 0));
        Order cancelled = orderService.placeOrder(userId, request("b2", 1, 0));
        orderService.cancelOrder(cancelled.getId(), userId);

        List<Book> books = orderService.getBuyAgain(userId);

        assertThat(books).extracting(Book::getId).containsExactly("b1");
    }

    @Test
    @DisplayName("related books share the category and exclude the book itself")
    void related_excludesSelf() {
        assertThat(bookService.findRelated("book-one"))
                .extracting(Book::getId).containsExactlyInAnyOrder("b2", "b3");
    }

    @Test
    @DisplayName("author filter returns only that author's books")
    void filterByAuthor() {
        var page = bookService.findBooks(null, null, "a2", null, 1, 12);
        assertThat(page.getContent()).extracting(Book::getId).containsExactly("b3");
    }
}
