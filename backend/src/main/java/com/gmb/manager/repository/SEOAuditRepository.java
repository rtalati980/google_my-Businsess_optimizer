package com.gmb.manager.repository;

import com.gmb.manager.entity.SEOAudit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SEOAuditRepository extends MongoRepository<SEOAudit, String> {
    List<SEOAudit> findByLocationIdOrderByCreatedAtDesc(String locationId);
}
