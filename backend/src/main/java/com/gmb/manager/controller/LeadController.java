package com.gmb.manager.controller;

import com.gmb.manager.entity.Lead;
import com.gmb.manager.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<List<Lead>> getAllLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable String id) {
        Lead lead = leadService.getLeadById(id);
        if (lead != null) return ResponseEntity.ok(lead);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Lead>> getLeadsByCity(@PathVariable String city) {
        return ResponseEntity.ok(leadService.getLeadsByCity(city));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Lead>> getLeadsByType(@PathVariable String type) {
        return ResponseEntity.ok(leadService.getLeadsByType(type));
    }

    @GetMapping("/product/{product}")
    public ResponseEntity<List<Lead>> getLeadsByProduct(@PathVariable String product) {
        return ResponseEntity.ok(leadService.getLeadsByProduct(product));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Lead>> getLeadsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(leadService.getLeadsByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Lead>> searchLeads(@RequestParam String q) {
        return ResponseEntity.ok(leadService.searchLeads(q));
    }

    @GetMapping("/city/{city}/product/{product}")
    public ResponseEntity<List<Lead>> getLeadsByCityAndProduct(
            @PathVariable String city,
            @PathVariable String product) {
        return ResponseEntity.ok(leadService.getLeadsByCityAndProduct(city, product));
    }

    @GetMapping("/city/{city}/recent")
    public ResponseEntity<List<Lead>> getRecentLeadsByCity(
            @PathVariable String city,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(leadService.getRecentLeadsByCity(city, limit));
    }

    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody Lead lead) {
        Lead savedLead = leadService.createLead(lead);
        return ResponseEntity.ok(savedLead);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable String id, @RequestBody Lead lead) {
        Lead updatedLead = leadService.updateLead(id, lead);
        if (updatedLead != null) return ResponseEntity.ok(updatedLead);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable String id) {
        leadService.deleteLead(id);
        return ResponseEntity.ok().build();
    }
}
