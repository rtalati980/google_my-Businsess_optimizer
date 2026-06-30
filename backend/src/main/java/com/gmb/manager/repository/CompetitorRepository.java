package com.gmb.manager.repository;

import com.gmb.manager.entity.Competitor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetitorRepository extends MongoRepository<Competitor, String> {
    List<Competitor> findByLocationId(String locationId);
}
