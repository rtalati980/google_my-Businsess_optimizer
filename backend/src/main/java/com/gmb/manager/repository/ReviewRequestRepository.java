package com.gmb.manager.repository;

import com.gmb.manager.entity.ReviewRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRequestRepository extends MongoRepository<ReviewRequest, String> {

    List<ReviewRequest> findByLocationId(String locationId);

    List<ReviewRequest> findByLocationIdAndStatus(String locationId, String status);

    List<ReviewRequest> findByLocationIdAndRequestType(String locationId, String requestType);

    Optional<ReviewRequest> findByCustomerPhoneAndLocationId(String customerPhone, String locationId);

    @Query(value = "{ 'location_id': ?0, 'status': 'SENT' }", count = true)
    long countSentRequests(String locationId);

    @Query(value = "{ 'location_id': ?0, 'status': 'COMPLETED' }", count = true)
    long countCompletedRequests(String locationId);

    List<ReviewRequest> findByLocationIdOrderByCreatedAtDesc(String locationId);
}
