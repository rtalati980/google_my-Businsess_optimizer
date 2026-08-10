package com.gmb.manager.repository;

import com.gmb.manager.entity.GrowthOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA repository for GrowthOpportunity entities.
 */
@Repository
public interface GrowthOpportunityRepository extends JpaRepository<GrowthOpportunity, Long> {
    // Additional query methods can be added here if needed.
}
