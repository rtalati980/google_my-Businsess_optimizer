package com.gmb.manager.repository;

import com.gmb.manager.entity.UsageTracker;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsageTrackerRepository extends MongoRepository<UsageTracker, String> {

    Optional<UsageTracker> findByUserIdAndLocationId(String userId, String locationId);

    Optional<UsageTracker> findByUserId(String userId);
}
