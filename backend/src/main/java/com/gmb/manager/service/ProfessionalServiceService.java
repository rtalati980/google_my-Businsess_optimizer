package com.gmb.manager.service;

import com.gmb.manager.dto.ProfessionalServiceDto;
import com.gmb.manager.dto.ServiceRatingRequestDto;
import com.gmb.manager.entity.ProfessionalService;
import com.gmb.manager.repository.ProfessionalServiceRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for professional services marketplace.
 */
@Service
public class ProfessionalServiceService {

    private final ProfessionalServiceRepository repository;

    public ProfessionalServiceService(ProfessionalServiceRepository repository) {
        this.repository = repository;
    }

    public List<ProfessionalServiceDto> getAllServices() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Update the rating of a service. For now we simply replace the rating value.
     */
    public ProfessionalServiceDto rateService(Long serviceId, ServiceRatingRequestDto ratingDto) {
        ProfessionalService service = repository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + serviceId));
        // Clamp rating between 0 and 5
        double clamped = Math.max(0.0, Math.min(5.0, ratingDto.getRating()));
        service.setRating(clamped);
        repository.save(service);
        return toDto(service);
    }

    private ProfessionalServiceDto toDto(ProfessionalService entity) {
        return new ProfessionalServiceDto(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getEstimatedTimeline(),
                entity.getStartingPrice(),
                entity.getExpectedImpact(),
                entity.getRating(),
                entity.getTags(),
                entity.getIcon()
        );
    }
}
