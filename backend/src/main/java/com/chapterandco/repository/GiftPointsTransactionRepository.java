package com.chapterandco.repository;

import com.chapterandco.entity.GiftPointsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GiftPointsTransactionRepository extends JpaRepository<GiftPointsTransaction, String> {
    List<GiftPointsTransaction> findByUserId(String userId);
}
