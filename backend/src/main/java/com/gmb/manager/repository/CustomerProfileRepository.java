package com.gmb.manager.repository;

import com.gmb.manager.entity.CustomerProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends MongoRepository<CustomerProfile, String> {

    List<CustomerProfile> findByLocationId(String locationId);

    Optional<CustomerProfile> findByLocationIdAndContactPhone(String locationId, String contactPhone);

    List<CustomerProfile> findByLocationIdOrderByEstimatedLifetimeValueDesc(String locationId);

    List<CustomerProfile> findByLocationIdAndChurnRisk(String locationId, String churnRisk);

    List<CustomerProfile> findByLocationIdAndStatus(String locationId, String status);

    @Query(value = "{ 'location_id': ?0, 'engagement_score': { $gte: ?1 } }")
    List<CustomerProfile> findHighEngagementCustomers(String locationId, Integer minScore);

    @Query(value = "{ 'location_id': ?0 }", count = true)
    long countByLocationId(String locationId);
}
