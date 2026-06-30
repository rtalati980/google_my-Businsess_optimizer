package com.gmb.manager.service;

import com.gmb.manager.entity.Competitor;
import com.gmb.manager.entity.Location;
import com.gmb.manager.repository.CompetitorRepository;
import com.gmb.manager.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompetitorService {

    private final CompetitorRepository competitorRepository;
    private final LocationRepository locationRepository;
    private final Random random = new Random();

    public List<Competitor> getCompetitorsByLocation(String locationId) {
        return competitorRepository.findByLocationId(locationId);
    }

    public Competitor addCompetitor(String locationId, String name) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));

        double rating = Math.round((3.8 + (1.2 * random.nextDouble())) * 10.0) / 10.0;
        int reviewCount = 50 + random.nextInt(450);

        String[] activities = {
            "High (4 posts/week)",
            "Medium (2 posts/week)",
            "Low (1 post/month)",
            "None"
        };
        String activity = activities[random.nextInt(activities.length)];

        Competitor competitor = Competitor.builder()
                .locationId(locationId)
                .name(name)
                .rating(rating)
                .reviewCount(reviewCount)
                .category(location.getCategory())
                .postingActivity(activity)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return competitorRepository.save(competitor);
    }

    public void removeCompetitor(String competitorId) {
        competitorRepository.deleteById(competitorId);
    }
}
