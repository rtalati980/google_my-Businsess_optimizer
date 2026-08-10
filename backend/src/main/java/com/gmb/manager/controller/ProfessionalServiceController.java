package com.gmb.manager.controller;

import com.gmb.manager.dto.ProfessionalServiceDto;
import com.gmb.manager.dto.ServiceRatingRequestDto;
import com.gmb.manager.service.ProfessionalServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST API for the professional services marketplace.
 */
@RestController
@RequestMapping("/api/services")
public class ProfessionalServiceController {

    private final ProfessionalServiceService service;

    public ProfessionalServiceController(ProfessionalServiceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProfessionalServiceDto>> getAllServices() {
        return ResponseEntity.ok(service.getAllServices());
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<ProfessionalServiceDto> rateService(
            @PathVariable Long id,
            @RequestBody ServiceRatingRequestDto ratingDto) {
        ProfessionalServiceDto updated = service.rateService(id, ratingDto);
        return ResponseEntity.ok(updated);
    }
}
