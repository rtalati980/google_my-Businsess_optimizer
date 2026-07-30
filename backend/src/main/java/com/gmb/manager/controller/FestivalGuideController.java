package com.gmb.manager.controller;

import com.gmb.manager.entity.Festival;
import com.gmb.manager.service.FestivalGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalGuideController {

    private final FestivalGuideService festivalGuideService;

    @GetMapping("/upcoming")
    public List<Festival> getUpcomingFestivals() {
        return festivalGuideService.getUpcomingFestivals();
    }

    @GetMapping("/by-category")
    public List<Festival> getFestivalsByCategory(@RequestParam String category) {
        return festivalGuideService.getFestivalsForCategory(category);
    }

    @GetMapping("/{festivalId}")
    public Festival getFestivalDetails(@PathVariable String festivalId) {
        return festivalGuideService.getFestivalById(festivalId);
    }
}
