package com.gmb.manager.controller;

import com.gmb.manager.service.GoogleAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsMetricsController {

    private final GoogleAnalyticsService analyticsService;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_DATE;

    /**
     * Get traffic metrics for a date range
     * GET /api/analytics/traffic?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/traffic")
    public ResponseEntity<?> getTrafficMetrics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getTrafficMetrics(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get daily active users
     * GET /api/analytics/users?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/users")
    public ResponseEntity<?> getDailyActiveUsers(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getDailyActiveUsers(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get page views and engagement metrics
     * GET /api/analytics/pages?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/pages")
    public ResponseEntity<?> getPageMetrics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getPageMetrics(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get conversion metrics
     * GET /api/analytics/conversions?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/conversions")
    public ResponseEntity<?> getConversionMetrics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getConversionMetrics(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get device breakdown
     * GET /api/analytics/devices?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/devices")
    public ResponseEntity<?> getDeviceMetrics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getDeviceMetrics(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get location data
     * GET /api/analytics/locations?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/locations")
    public ResponseEntity<?> getLocationMetrics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getLocationMetrics(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user behavior metrics
     * GET /api/analytics/behavior?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/behavior")
    public ResponseEntity<?> getUserBehaviorMetrics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getUserBehaviorMetrics(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get traffic sources
     * GET /api/analytics/sources?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/sources")
    public ResponseEntity<?> getTrafficSources(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> metrics = analyticsService.getTrafficSources(start, end);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get real-time analytics data
     * GET /api/analytics/realtime
     */
    @GetMapping("/realtime")
    public ResponseEntity<?> getRealTimeData() {
        try {
            Map<String, Object> data = analyticsService.getRealTimeData();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get summary of all metrics
     * GET /api/analytics/summary?startDate=2026-07-20&endDate=2026-07-29
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getMetricsSummary(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);
            Map<String, Object> summary = analyticsService.getMetricsSummary(start, end);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get last N days metrics
     * GET /api/analytics/last-days?days=7
     */
    @GetMapping("/last-days")
    public ResponseEntity<?> getLastDaysMetrics(@RequestParam(defaultValue = "7") int days) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days);
            Map<String, Object> summary = analyticsService.getMetricsSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get today's metrics
     * GET /api/analytics/today
     */
    @GetMapping("/today")
    public ResponseEntity<?> getTodayMetrics() {
        try {
            LocalDate today = LocalDate.now();
            Map<String, Object> summary = analyticsService.getMetricsSummary(today, today);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
