package com.chapterandco.repository;

import com.chapterandco.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuthorRepository extends JpaRepository<Author, String> {
    List<Author> findAllByOrderByNameAsc();
}
