package com.gmb.manager.repository;

import com.gmb.manager.entity.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends MongoRepository<Location, String> {
    List<Location> findByBusinessId(String businessId);
    Optional<Location> findByGoogleLocationId(String googleLocationId);
}
