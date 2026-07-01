package com.gmb.manager.repository;

import com.gmb.manager.entity.PostSeoMetrics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostSeoMetricsRepository extends MongoRepository<PostSeoMetrics, String> {

    Optional<PostSeoMetrics> findByPostId(String postId);

    List<PostSeoMetrics> findByLocationId(String locationId);

    List<PostSeoMetrics> findByLocationIdOrderByCreatedAtDesc(String locationId);

    List<PostSeoMetrics> findByLocationIdAndSeoScoreGreaterThanEqualOrderBySeoScoreDesc(String locationId, Integer minScore);
}
