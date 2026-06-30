package com.gmb.manager.repository;

import com.gmb.manager.entity.AIReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIReportRepository extends MongoRepository<AIReport, String> {
    List<AIReport> findByLocationIdOrderByCreatedAtDesc(String locationId);
}
