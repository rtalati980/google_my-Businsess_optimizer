package com.gmb.manager.repository;

import com.gmb.manager.entity.GoogleQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoogleQuestionRepository extends MongoRepository<GoogleQuestion, String> {
    List<GoogleQuestion> findByLocationId(String locationId);
    Page<GoogleQuestion> findByLocationId(String locationId, Pageable pageable);
    List<GoogleQuestion> findByLocationIdAndIsAnsweredIsFalse(String locationId);
    List<GoogleQuestion> findByLocationIdAndStatus(String locationId, String status);
    Page<GoogleQuestion> findByLocationIdAndIsAnsweredIsFalse(String locationId, Pageable pageable);
    long countByLocationIdAndIsAnsweredIsFalse(String locationId);
}
