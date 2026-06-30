package com.gmb.manager.controller;

import com.gmb.manager.entity.AIReport;
import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/reports")
    public ResponseEntity<?> getReports(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        List<AIReport> reports = reportService.getReports(locationId);
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/locations/{locationId}/reports/generate")
    public ResponseEntity<?> generateReport(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        try {
            AIReport report = reportService.generateWeeklyReport(locationId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/locations/{locationId}/reports/{reportId}")
    public ResponseEntity<?> getReportDetails(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String reportId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        AIReport report = reportService.getReportById(reportId).orElse(null);
        if (report == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(report);
    }
}
