package com.gmb.manager.repository;

import com.gmb.manager.entity.BusinessInfoOptimization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BusinessInfoOptimizationRepository extends MongoRepository<BusinessInfoOptimization, String> {
    Optional<BusinessInfoOptimization> findByLocationId(String locationId);
}
