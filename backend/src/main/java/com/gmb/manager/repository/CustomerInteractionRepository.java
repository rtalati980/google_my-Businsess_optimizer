package com.gmb.manager.repository;

import com.gmb.manager.entity.CustomerInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerInteractionRepository extends MongoRepository<CustomerInteraction, String> {

    List<CustomerInteraction> findByLocationId(String locationId);

    List<CustomerInteraction> findByLocationIdAndContactPhone(String locationId, String contactPhone);

    List<CustomerInteraction> findByLocationIdAndInteractionType(String locationId, String interactionType);

    List<CustomerInteraction> findByLocationIdOrderByTimestampDesc(String locationId);

    List<CustomerInteraction> findByLocationIdAndOutcome(String locationId, String outcome);

    @Query(value = "{ 'location_id': ?0, 'outcome': { $in: ['BOOKING', 'PURCHASE'] } }")
    List<CustomerInteraction> findConversions(String locationId);

    @Query(value = "{ 'location_id': ?0 }", count = true)
    long countByLocationId(String locationId);
}
