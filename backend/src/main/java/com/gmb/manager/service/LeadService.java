package com.gmb.manager.service;

import com.gmb.manager.entity.Lead;
import com.gmb.manager.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    public Lead getLeadById(String id) {
        return leadRepository.findById(id).orElse(null);
    }

    public List<Lead> getLeadsByCity(String city) {
        return leadRepository.findByCity(city);
    }

    public List<Lead> getLeadsByType(String type) {
        return leadRepository.findByType(type);
    }

    public List<Lead> getLeadsByProduct(String product) {
        return leadRepository.findByProduct(product);
    }

    public List<Lead> getLeadsByStatus(String status) {
        return leadRepository.findByStatus(status);
    }

    public List<Lead> searchLeads(String searchTerm) {
        return leadRepository.searchLeads(searchTerm);
    }

    public List<Lead> getLeadsByCityAndProduct(String city, String product) {
        return leadRepository.findByCityAndProductOrderByCreatedAtDesc(city, product);
    }

    public List<Lead> getRecentLeadsByCity(String city, int limit) {
        List<Lead> all = leadRepository.findByCityOrderByCreatedAtDesc(city);
        return all.stream().limit(limit).toList();
    }

    public Lead createLead(Lead lead) {
        return leadRepository.save(lead);
    }

    public Lead updateLead(String id, Lead updatedLead) {
        Optional<Lead> existingLead = leadRepository.findById(id);
        if (existingLead.isPresent()) {
            Lead lead = existingLead.get();
            if (updatedLead.getName() != null) lead.setName(updatedLead.getName());
            if (updatedLead.getType() != null) lead.setType(updatedLead.getType());
            if (updatedLead.getCity() != null) lead.setCity(updatedLead.getCity());
            if (updatedLead.getArea() != null) lead.setArea(updatedLead.getArea());
            if (updatedLead.getContact() != null) lead.setContact(updatedLead.getContact());
            if (updatedLead.getPhone() != null) lead.setPhone(updatedLead.getPhone());
            if (updatedLead.getEmail() != null) lead.setEmail(updatedLead.getEmail());
            if (updatedLead.getProduct() != null) lead.setProduct(updatedLead.getProduct());
            if (updatedLead.getHasWebsite() != null) lead.setHasWebsite(updatedLead.getHasWebsite());
            if (updatedLead.getGbp() != null) lead.setGbp(updatedLead.getGbp());
            if (updatedLead.getSize() != null) lead.setSize(updatedLead.getSize());
            if (updatedLead.getStatus() != null) lead.setStatus(updatedLead.getStatus());
            if (updatedLead.getCallbackTime() != null) lead.setCallbackTime(updatedLead.getCallbackTime());
            if (updatedLead.getCallDuration() != null) lead.setCallDuration(updatedLead.getCallDuration());
            if (updatedLead.getNotes() != null) lead.setNotes(updatedLead.getNotes());
            lead.setUpdatedAt(LocalDateTime.now());
            return leadRepository.save(lead);
        }
        return null;
    }

    public void deleteLead(String id) {
        leadRepository.deleteById(id);
    }
}
