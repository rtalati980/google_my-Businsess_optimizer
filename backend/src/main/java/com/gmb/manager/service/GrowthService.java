package com.gmb.manager.service;

import com.gmb.manager.dto.GrowthOpportunityDto;
import com.gmb.manager.entity.GrowthOpportunity;
import com.gmb.manager.repository.GrowthOpportunityRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for fetching growth opportunity recommendations.
 * For now, it returns all persisted GrowthOpportunity records.
 * Future implementation can apply business logic based on SEO audit, reviews, etc.
 */
@Service
public class GrowthService {

    private final GrowthOpportunityRepository growthRepository;

    public GrowthService(GrowthOpportunityRepository growthRepository) {
        this.growthRepository = growthRepository;
    }

    public List<GrowthOpportunityDto> getAllOpportunities() {
        List<GrowthOpportunity> entities = growthRepository.findAll();
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    private GrowthOpportunityDto toDto(GrowthOpportunity entity) {
        return new GrowthOpportunityDto(
                entity.getId(),
                entity.getServiceName(),
                entity.getBusinessProblem(),
                entity.getDescription(),
                entity.getEstimatedImpact(),
                entity.getPriority(),
                entity.getEstimatedTime(),
                entity.getIcon()
        );
    }
}
