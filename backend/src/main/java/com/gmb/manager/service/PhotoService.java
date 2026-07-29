package com.gmb.manager.service;

import com.gmb.manager.entity.Photo;
import com.gmb.manager.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final AiService aiService;

    public Photo uploadPhoto(String locationId, String title, String description, String imageUrl, String category, String uploadedBy) {
        Photo photo = Photo.builder()
                .locationId(locationId)
                .title(title)
                .description(description)
                .imageUrl(imageUrl)
                .thumbnailUrl(imageUrl) // TODO: Generate thumbnail
                .category(category)
                .status("DRAFT")
                .uploadedBy(uploadedBy)
                .uploadedAt(LocalDateTime.now())
                .views(0)
                .clicks(0)
                .conversions(0)
                .isOptimized(false)
                .syncedToGoogle(false)
                .build();

        Photo saved = photoRepository.save(photo);
        analyzePhotoQuality(saved);
        generateAiSuggestions(saved);
        return saved;
    }

    public void analyzePhotoQuality(Photo photo) {
        // TODO: Integrate with AI to analyze photo quality
        // For now, set placeholder scores
        photo.setQualityScore(85);
        photo.setBrightnessFeedback("Good brightness level");
        photo.setCompositionFeedback("Well-composed image");
        photo.setClarityFeedback("Clear and sharp");
        photoRepository.save(photo);
    }

    public void generateAiSuggestions(Photo photo) {
        try {
            // Generate caption using AI
            String suggestedCaption = aiService.generatePhotoCaption(photo.getTitle(), photo.getCategory());
            photo.setSuggestedCaption(suggestedCaption);

            // Generate tags using AI
            String suggestedTags = aiService.generatePhotoTags(photo.getTitle(), photo.getDescription(), photo.getCategory());
            photo.setSuggestedTags(suggestedTags);

            photoRepository.save(photo);
        } catch (Exception e) {
            // Non-fatal: AI suggestions failed
        }
    }

    public Photo publishPhoto(String photoId) {
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new IllegalArgumentException("Photo not found"));
        photo.setStatus("PUBLISHED");
        photo.setPublishedAt(LocalDateTime.now());
        return photoRepository.save(photo);
    }

    public Photo updatePhoto(String photoId, String title, String description, String category) {
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new IllegalArgumentException("Photo not found"));
        photo.setTitle(title);
        photo.setDescription(description);
        photo.setCategory(category);
        photo.setUpdatedAt(LocalDateTime.now());
        return photoRepository.save(photo);
    }

    public void deletePhoto(String photoId) {
        photoRepository.deleteById(photoId);
    }

    public Photo getPhoto(String photoId) {
        return photoRepository.findById(photoId).orElseThrow(() -> new IllegalArgumentException("Photo not found"));
    }

    public List<Photo> getLocationPhotos(String locationId) {
        return photoRepository.findByLocationId(locationId);
    }

    public Page<Photo> getLocationPhotosPage(String locationId, Pageable pageable) {
        return photoRepository.findByLocationId(locationId, pageable);
    }

    public List<Photo> getPhotosByCategory(String locationId, String category) {
        return photoRepository.findByLocationIdAndCategory(locationId, category);
    }

    public List<Photo> getPublishedPhotos(String locationId) {
        return photoRepository.findByLocationIdAndStatus(locationId, "PUBLISHED");
    }

    public List<Photo> getUnsyncedPhotos(String locationId) {
        return photoRepository.findByLocationIdAndSyncedToGoogleIsFalse(locationId);
    }

    public Map<String, Object> getPhotoAnalytics(String photoId) {
        Photo photo = getPhoto(photoId);
        return Map.of(
                "views", photo.getViews(),
                "clicks", photo.getClicks(),
                "conversions", photo.getConversions(),
                "clickRate", photo.getViews() > 0 ? (photo.getClicks() * 100.0 / photo.getViews()) : 0,
                "conversionRate", photo.getClicks() > 0 ? (photo.getConversions() * 100.0 / photo.getClicks()) : 0
        );
    }

    public Map<String, Object> getLocationPhotoAnalytics(String locationId) {
        List<Photo> photos = getPublishedPhotos(locationId);
        int totalViews = photos.stream().mapToInt(Photo::getViews).sum();
        int totalClicks = photos.stream().mapToInt(Photo::getClicks).sum();
        int totalConversions = photos.stream().mapToInt(Photo::getConversions).sum();

        return Map.of(
                "totalPhotos", photos.size(),
                "totalViews", totalViews,
                "totalClicks", totalClicks,
                "totalConversions", totalConversions,
                "avgViewsPerPhoto", photos.size() > 0 ? (totalViews / photos.size()) : 0,
                "overallClickRate", totalViews > 0 ? (totalClicks * 100.0 / totalViews) : 0
        );
    }

    public void syncPhotoToGoogle(String photoId) {
        Photo photo = getPhoto(photoId);
        // TODO: Implement Google Business Profile API integration
        photo.setSyncedToGoogle(true);
        photo.setLastSyncedAt(LocalDateTime.now());
        photoRepository.save(photo);
    }
}
