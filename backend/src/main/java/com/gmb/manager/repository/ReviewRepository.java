package com.gmb.manager.repository;

import com.gmb.manager.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByLocationId(String locationId);
    Page<Review> findByLocationId(String locationId, Pageable pageable);
    Page<Review> findByLocationIdAndRatingIn(String locationId, Collection<Integer> ratings, Pageable pageable);
    Optional<Review> findByGoogleReviewId(String googleReviewId);
    long countByLocationId(String locationId);
    long countByLocationIdAndRating(String locationId, Integer rating);
}
