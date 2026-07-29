package com.gmb.manager.repository;

import com.gmb.manager.entity.LocationMetrics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationMetricsRepository extends MongoRepository<LocationMetrics, String> {
    Optional<LocationMetrics> findByLocationIdAndDate(String locationId, LocalDate date);
    List<LocationMetrics> findByLocationIdAndDateBetween(String locationId, LocalDate startDate, LocalDate endDate);
    List<LocationMetrics> findByLocationIdOrderByDateDesc(String locationId);
    List<LocationMetrics> findByLocationIdOrderByDateDesc(String locationId, org.springframework.data.domain.Pageable pageable);

    @Query("{ 'locationId': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<LocationMetrics> findMetricsInDateRange(String locationId, LocalDate startDate, LocalDate endDate);
}
