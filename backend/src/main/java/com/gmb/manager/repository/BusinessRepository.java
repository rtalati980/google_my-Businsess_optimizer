package com.gmb.manager.repository;

import com.gmb.manager.entity.Business;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRepository extends MongoRepository<Business, String> {
    List<Business> findByUserId(String userId);
}
