package com.gmb.manager.repository;

import com.gmb.manager.entity.Lead;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends MongoRepository<Lead, String> {
    List<Lead> findByCity(String city);
    List<Lead> findByType(String type);
    List<Lead> findByProduct(String product);
    List<Lead> findByStatus(String status);
    List<Lead> findByHasWebsite(Boolean hasWebsite);

    @Query("{ '$or': [ " +
           "{ 'name': { '$regex': ?0, '$options': 'i' } }, " +
           "{ 'contact': { '$regex': ?0, '$options': 'i' } }, " +
           "{ 'area': { '$regex': ?0, '$options': 'i' } }, " +
           "{ 'type': { '$regex': ?0, '$options': 'i' } }, " +
           "{ 'phone': { '$regex': ?0, '$options': 'i' } } " +
           "] }")
    List<Lead> searchLeads(String search);

    List<Lead> findByCityAndProductOrderByCreatedAtDesc(String city, String product);

    List<Lead> findByCityOrderByCreatedAtDesc(String city);
}
