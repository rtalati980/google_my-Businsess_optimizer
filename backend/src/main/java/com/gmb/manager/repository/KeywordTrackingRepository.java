package com.gmb.manager.repository;

import com.gmb.manager.entity.KeywordTracking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KeywordTrackingRepository extends MongoRepository<KeywordTracking, String> {
    List<KeywordTracking> findByLocationId(String locationId);
    Page<KeywordTracking> findByLocationId(String locationId, Pageable pageable);
    KeywordTracking findByLocationIdAndKeyword(String locationId, String keyword);
    List<KeywordTracking> findByLocationIdAndKeywordType(String locationId, String keywordType);
    List<KeywordTracking> findByLocationIdAndRankLessThan(String locationId, Integer rank);
}
