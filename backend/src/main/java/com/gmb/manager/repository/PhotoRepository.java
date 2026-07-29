package com.gmb.manager.repository;

import com.gmb.manager.entity.Photo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PhotoRepository extends MongoRepository<Photo, String> {
    List<Photo> findByLocationId(String locationId);
    Page<Photo> findByLocationId(String locationId, Pageable pageable);
    List<Photo> findByLocationIdAndStatus(String locationId, String status);
    List<Photo> findByLocationIdAndCategory(String locationId, String category);
    List<Photo> findByLocationIdAndSyncedToGoogleIsFalse(String locationId);
}
