package com.gmb.manager.controller;

import com.gmb.manager.entity.SEOAudit;
import com.gmb.manager.entity.User;
import com.gmb.manager.service.SeoAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations/{locationId}/seo-audits")
@RequiredArgsConstructor
public class SeoAuditController {

    private final SeoAuditService seoAuditService;

    @GetMapping
    public ResponseEntity<List<SEOAudit>> getAudits(
            @PathVariable String locationId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(seoAuditService.getAudits(locationId));
    }

    @PostMapping("/analyze")
    public ResponseEntity<SEOAudit> analyze(
            @PathVariable String locationId,
            @AuthenticationPrincipal User user) {
        SEOAudit audit = seoAuditService.generateAudit(locationId);
        return ResponseEntity.ok(audit);
    }
}
