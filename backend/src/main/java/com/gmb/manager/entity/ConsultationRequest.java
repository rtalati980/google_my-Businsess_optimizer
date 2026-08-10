package com.gmb.manager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stores a consultation or quote request from a user.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String businessCategory;

    @Column(length = 2048)
    private String currentWebsite;

    @Column(length = 2048)
    private String message;

    @Column(nullable = false)
    private String requestedService; // service name or id reference

    @Column(nullable = false)
    private String status = "NEW"; // NEW, IN_PROGRESS, COMPLETED
}
