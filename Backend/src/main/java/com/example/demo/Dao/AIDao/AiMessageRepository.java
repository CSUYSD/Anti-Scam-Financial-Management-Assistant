package com.example.demo.Dao.AIDao;

import com.example.demo.model.AI.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {

    @Query("SELECT m FROM AiMessage m WHERE m.session.id = :sessionId ORDER BY m.createdTime DESC LIMIT :lastN")
    List<AiMessage> findBySessionId(Long sessionId, int lastN);

    void deleteBySessionId(Long sessionId);
}