package com.chapterandco.repository;

import com.chapterandco.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("UserRepository persistence tests")
class UserRepositoryTest {

    @Autowired UserRepository userRepository;

    private User buildUser(String email) {
        return User.builder()
                .id(UUID.randomUUID().toString())
                .name("Test User")
                .email(email)
                .password("$2a$12$hashedpassword")
                .build();
    }

    @Test
    @DisplayName("save and findByEmail — persists user and retrieves by email")
    void saveAndFindByEmail() {
        User user = buildUser("test@example.com");
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("test@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
    }

    @Test
    @DisplayName("existsByEmail — returns true for existing email")
    void existsByEmail_true() {
        userRepository.save(buildUser("exists@example.com"));
        assertThat(userRepository.existsByEmail("exists@example.com")).isTrue();
    }

    @Test
    @DisplayName("existsByEmail — returns false for unknown email")
    void existsByEmail_false() {
        assertThat(userRepository.existsByEmail("nobody@example.com")).isFalse();
    }

    @Test
    @DisplayName("findByEmail — returns empty for unknown email")
    void findByEmail_notFound() {
        assertThat(userRepository.findByEmail("nobody@example.com")).isEmpty();
    }

    @Test
    @DisplayName("save — sets createdAt and updatedAt automatically")
    void save_setsTimestamps() {
        User user = buildUser("ts@example.com");
        User saved = userRepository.save(user);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
