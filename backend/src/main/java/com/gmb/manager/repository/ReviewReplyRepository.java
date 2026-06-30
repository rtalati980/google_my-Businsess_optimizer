package com.gmb.manager.repository;

import com.gmb.manager.entity.ReviewReply;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewReplyRepository extends MongoRepository<ReviewReply, String> {
    Optional<ReviewReply> findByReviewId(String reviewId);
}
