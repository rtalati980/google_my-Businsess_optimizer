package com.gmb.manager.repository;

import com.gmb.manager.entity.ConsultationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for persisting ConsultationRequest entities.
 */
@Repository
public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, Long> {
    // Additional query methods can be defined here if needed.
}
