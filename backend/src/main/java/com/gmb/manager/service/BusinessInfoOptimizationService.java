package com.gmb.manager.service;

import com.gmb.manager.entity.BusinessInfoOptimization;
import com.gmb.manager.entity.Location;
import com.gmb.manager.repository.BusinessInfoOptimizationRepository;
import com.gmb.manager.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BusinessInfoOptimizationService {

    private final BusinessInfoOptimizationRepository optimizationRepository;
    private final LocationRepository locationRepository;

    public BusinessInfoOptimization analyzeBusinessInfo(String locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        BusinessInfoOptimization optimization = optimizationRepository.findByLocationId(locationId)
                .orElse(new BusinessInfoOptimization());

        optimization.setLocationId(locationId);
        optimization.setLastAuditedAt(LocalDateTime.now());
        if (optimization.getMissingFields() == null) {
            optimization.setMissingFields(new ArrayList<>());
        } else {
            optimization.getMissingFields().clear();
        }
        if (optimization.getOptimizationSuggestions() == null) {
            optimization.setOptimizationSuggestions(new ArrayList<>());
        }

        // Check each field and calculate scores
        checkBusinessName(optimization, location);
        checkAddress(optimization, location);
        checkPhone(optimization, location);
        checkWebsite(optimization, location);
        checkBusinessHours(optimization, location);
        checkServiceArea(optimization, location);
        checkDescription(optimization, location);
        checkAttributes(optimization, location);
        checkCategories(optimization, location);

        // Calculate overall completeness score
        calculateCompletenessScore(optimization);
        generateOptimizationSuggestions(optimization);

        return optimizationRepository.save(optimization);
    }

    private void checkBusinessName(BusinessInfoOptimization opt, Location location) {
        if (location.getName() != null && !location.getName().isEmpty()) {
            opt.setHasBusinessName(true);
            opt.setBusinessNameScore(100);
        } else {
            opt.setHasBusinessName(false);
            opt.setBusinessNameScore(0);
            opt.getMissingFields().add("Business Name");
        }
    }

    private void checkAddress(BusinessInfoOptimization opt, Location location) {
        if (location.getAddress() != null && !location.getAddress().isEmpty()) {
            opt.setHasFullAddress(true);
            opt.setAddressScore(100);
        } else {
            opt.setHasFullAddress(false);
            opt.setAddressScore(0);
            opt.getMissingFields().add("Complete Address");
        }
    }

    private void checkPhone(BusinessInfoOptimization opt, Location location) {
        if (location.getPhone() != null && !location.getPhone().isEmpty()) {
            opt.setHasPhone(true);
            opt.setPhoneScore(100);
        } else {
            opt.setHasPhone(false);
            opt.setPhoneScore(0);
            opt.getMissingFields().add("Phone Number");
        }
    }

    private void checkWebsite(BusinessInfoOptimization opt, Location location) {
        if (location.getWebsite() != null && !location.getWebsite().isEmpty()) {
            opt.setHasWebsite(true);
            opt.setWebsiteScore(100);
        } else {
            opt.setHasWebsite(false);
            opt.setWebsiteScore(0);
            opt.getMissingFields().add("Website URL");
        }
    }

    private void checkBusinessHours(BusinessInfoOptimization opt, Location location) {
        // Check if description exists (business hours typically in description or separate field)
        if (location.getDescription() != null && !location.getDescription().isEmpty()) {
            opt.setHasBusinessHours(true);
            opt.setHoursScore(90);
        } else {
            opt.setHasBusinessHours(false);
            opt.setHoursScore(0);
            opt.getMissingFields().add("Business Hours");
        }
    }

    private void checkServiceArea(BusinessInfoOptimization opt, Location location) {
        if (opt.getServiceAreas() == null) {
            opt.setServiceAreas(new ArrayList<>());
        }

        if (opt.getServiceAreas() != null && !opt.getServiceAreas().isEmpty()) {
            opt.setHasServiceArea(true);
            opt.setServiceAreaScore(100);
        } else {
            opt.setHasServiceArea(false);
            opt.setServiceAreaScore(0);
            opt.getMissingFields().add("Service Area");
        }
    }

    private void checkDescription(BusinessInfoOptimization opt, Location location) {
        if (location.getDescription() != null && location.getDescription().length() > 100) {
            opt.setHasDescription(true);
            opt.setDescriptionScore(100);
        } else {
            opt.setHasDescription(false);
            opt.setDescriptionScore(location.getDescription() != null ? 50 : 0);
            opt.getMissingFields().add("Complete Business Description (min 100 chars)");
        }
    }

    private void checkAttributes(BusinessInfoOptimization opt, Location location) {
        if (opt.getAttributes() == null) {
            opt.setAttributes(new HashMap<>());
        }

        int attributeCount = (int) opt.getAttributes().values().stream().filter(v -> v).count();
        if (attributeCount >= 5) {
            opt.setHasAttributes(true);
            opt.setAttributesScore(100);
        } else {
            opt.setHasAttributes(false);
            opt.setAttributesScore(Math.min(100, attributeCount * 20));
            opt.getMissingFields().add("Add more attributes (wifi, parking, etc.)");
        }
    }

    private void checkCategories(BusinessInfoOptimization opt, Location location) {
        if (location.getCategory() != null && !location.getCategory().isEmpty()) {
            opt.setHasCategories(true);
            opt.setCategoryScore(100);
        } else {
            opt.setHasCategories(false);
            opt.setCategoryScore(0);
            opt.getMissingFields().add("Business Category");
        }
    }

    private void calculateCompletenessScore(BusinessInfoOptimization opt) {
        int totalScore = (opt.getBusinessNameScore() + opt.getAddressScore() + opt.getPhoneScore()
                + opt.getWebsiteScore() + opt.getHoursScore() + opt.getServiceAreaScore()
                + opt.getDescriptionScore() + opt.getAttributesScore() + opt.getCategoryScore()) / 9;
        opt.setCompletenessScore(totalScore);
    }

    private void generateOptimizationSuggestions(BusinessInfoOptimization opt) {
        if (opt.getOptimizationSuggestions() == null) {
            opt.setOptimizationSuggestions(new ArrayList<>());
        } else {
            opt.getOptimizationSuggestions().clear();
        }

        if (opt.getCompletenessScore() < 100) {
            opt.getOptimizationSuggestions().add("Complete all missing fields to improve visibility");
        }
        if (!opt.getHasWebsite()) {
            opt.getOptimizationSuggestions().add("Add website URL to drive more qualified traffic");
        }
        if (opt.getServiceAreaScore() < 100) {
            opt.getOptimizationSuggestions().add("Set up service area to reach local customers");
        }
        if (opt.getAttributesScore() < 100) {
            opt.getOptimizationSuggestions().add("Add more attributes (wheelchair access, parking, wifi)");
        }
        if (opt.getDescriptionScore() < 100) {
            opt.getOptimizationSuggestions().add("Write a detailed business description (200+ characters)");
        }
    }

    public BusinessInfoOptimization getOptimization(String locationId) {
        return optimizationRepository.findByLocationId(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Optimization data not found"));
    }

    public void updateServiceArea(String locationId, List<String> serviceAreas) {
        BusinessInfoOptimization opt = optimizationRepository.findByLocationId(locationId)
                .orElse(new BusinessInfoOptimization());
        opt.setLocationId(locationId);
        opt.setServiceAreas(serviceAreas);
        optimizationRepository.save(opt);
    }

    public void updateAttributes(String locationId, Map<String, Boolean> attributes) {
        BusinessInfoOptimization opt = optimizationRepository.findByLocationId(locationId)
                .orElse(new BusinessInfoOptimization());
        opt.setLocationId(locationId);
        opt.setAttributes(attributes);
        optimizationRepository.save(opt);
    }

    public Map<String, Object> getOptimizationStatus(String locationId) {
        BusinessInfoOptimization opt = getOptimization(locationId);
        return Map.of(
                "completenessScore", opt.getCompletenessScore(),
                "missingFields", opt.getMissingFields(),
                "suggestions", opt.getOptimizationSuggestions(),
                "scores", Map.of(
                        "name", opt.getBusinessNameScore(),
                        "address", opt.getAddressScore(),
                        "phone", opt.getPhoneScore(),
                        "website", opt.getWebsiteScore(),
                        "hours", opt.getHoursScore(),
                        "serviceArea", opt.getServiceAreaScore(),
                        "description", opt.getDescriptionScore(),
                        "attributes", opt.getAttributesScore(),
                        "category", opt.getCategoryScore()
                )
        );
    }
}
