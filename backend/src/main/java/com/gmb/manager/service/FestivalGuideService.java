package com.gmb.manager.service;

import com.gmb.manager.entity.Festival;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FestivalGuideService {

    public List<Festival> getUpcomingFestivals() {
        return Arrays.asList(
            // DIWALI - October/November
            Festival.builder()
                .id("diwali")
                .name("Diwali")
                .month("October-November")
                .expectedDate(LocalDate.of(2026, 11, 8))
                .description("Festival of Lights - One of the biggest shopping and celebration festivals in India")
                .applicableBusinessCategories(Arrays.asList("Restaurant", "Retail", "Spa", "Jewelry", "Sweets", "Electronics", "Apparel"))
                .suggestedTheme("Celebration & Brightness")
                .seoKeywords(Arrays.asList("Diwali special", "Diwali offer", "Diwali discount", "Festival of Lights"))
                .suggestedOffers(Arrays.asList(
                    "Diwali Special Discount - Up to 50% off",
                    "Diwali Gift Packages",
                    "Diwali Celebration Offers",
                    "Festival Bundle Deals"
                ))
                .contentTemplates(Arrays.asList(
                    "🪔 Celebrate Diwali with us! Special offers on [YOUR SERVICE]. Light up your celebrations!",
                    "✨ This Diwali, shine brighter with [YOUR BUSINESS NAME]! Limited time offers available.",
                    "🎆 Diwali Special at [YOUR BUSINESS]! Avail [DISCOUNT]% off on all services."
                ))
                .seoRankingBoost(9)
                .build(),

            // RAKHI - August
            Festival.builder()
                .id("rakhi")
                .name("Rakhi (Raksha Bandhan)")
                .month("August")
                .expectedDate(LocalDate.of(2026, 8, 27))
                .description("Festival celebrating sibling bond - High emotional connect, gift-giving occasion")
                .applicableBusinessCategories(Arrays.asList("Jewelry", "Gifts", "Sweets", "Apparel", "Electronics", "Beauty"))
                .suggestedTheme("Gratitude & Bonding")
                .seoKeywords(Arrays.asList("Rakhi gifts", "Rakhi special offer", "Rakhi celebration", "Raksha Bandhan"))
                .suggestedOffers(Arrays.asList(
                    "Rakhi Gift Sets - Buy 1 Get 1",
                    "Rakhi Special Packages",
                    "Sibling Celebration Offers",
                    "Rakhi Exclusive Deals"
                ))
                .contentTemplates(Arrays.asList(
                    "🎀 Rakhi Special at [YOUR BUSINESS]! Find perfect gifts for your siblings. Shop now!",
                    "👭 Celebrate the bond this Rakhi! Exclusive offers on [YOUR SERVICE].",
                    "💝 Make this Rakhi special with [YOUR BUSINESS NAME]! Limited period offer."
                ))
                .seoRankingBoost(8)
                .build(),

            // HOLI - March
            Festival.builder()
                .id("holi")
                .name("Holi")
                .month("March")
                .expectedDate(LocalDate.of(2026, 3, 15))
                .description("Festival of Colors - Celebration of spring and new beginnings")
                .applicableBusinessCategories(Arrays.asList("Restaurant", "Retail", "Events", "Beauty", "Apparel", "Home"))
                .suggestedTheme("Colors & Joy")
                .seoKeywords(Arrays.asList("Holi special", "Holi offer", "Holi celebration", "Festival of Colors"))
                .suggestedOffers(Arrays.asList(
                    "Holi Color Festival - Special Discounts",
                    "Holi Celebration Offers",
                    "Spring Special Deals",
                    "Holi Exclusive Packages"
                ))
                .contentTemplates(Arrays.asList(
                    "🌈 Happy Holi! Celebrate with colors and special offers at [YOUR BUSINESS]!",
                    "🎨 This Holi, celebrate with [YOUR SERVICE]! Special discounts available.",
                    "💐 Spread joy this Holi! Avail exclusive offers at [YOUR BUSINESS NAME]."
                ))
                .seoRankingBoost(8)
                .build(),

            // NAVRATRI - September/October
            Festival.builder()
                .id("navratri")
                .name("Navratri/Durga Puja")
                .month("September-October")
                .expectedDate(LocalDate.of(2026, 10, 2))
                .description("Nine-day festival of divine feminine - Shopping, celebrations, and family gatherings")
                .applicableBusinessCategories(Arrays.asList("Apparel", "Jewelry", "Electronics", "Home", "Events", "Beauty"))
                .suggestedTheme("Divine & Celebration")
                .seoKeywords(Arrays.asList("Navratri special", "Durga Puja offer", "Navratri discount", "Festival offer"))
                .suggestedOffers(Arrays.asList(
                    "Navratri Special Sale",
                    "9 Days of Celebration Offers",
                    "Durga Puja Special Discounts",
                    "Festival Season Deals"
                ))
                .contentTemplates(Arrays.asList(
                    "🙏 Celebrate Navratri with blessed offers at [YOUR BUSINESS]! Avail special discounts.",
                    "✨ 9 Days of Joy - Navratri Special at [YOUR BUSINESS NAME]!",
                    "🎊 This Navratri, shop special at [YOUR SERVICE]. Limited time offers!"
                ))
                .seoRankingBoost(8)
                .build(),

            // NEW YEAR
            Festival.builder()
                .id("newyear")
                .name("New Year Celebration")
                .month("December-January")
                .expectedDate(LocalDate.of(2027, 1, 1))
                .description("Global celebration - Fresh start, resolutions, and special deals")
                .applicableBusinessCategories(Arrays.asList("Restaurant", "Gym", "Events", "Apparel", "Electronics", "Home"))
                .suggestedTheme("Fresh Start & Resolution")
                .seoKeywords(Arrays.asList("New Year offer", "New Year special", "Year-end sale", "New Year deals"))
                .suggestedOffers(Arrays.asList(
                    "New Year Resolution Packages",
                    "Year-End Clearance Sale",
                    "Fresh Start Offers",
                    "New Year Special Memberships"
                ))
                .contentTemplates(Arrays.asList(
                    "🎉 Welcome 2027 with [YOUR SERVICE]! New Year Special Offers!",
                    "🌟 Start your new year right at [YOUR BUSINESS NAME]. Limited time deals!",
                    "✨ New Year, New You! Avail special offers at [YOUR BUSINESS]."
                ))
                .seoRankingBoost(7)
                .build()
        );
    }

    public List<Festival> getFestivalsForCategory(String businessCategory) {
        return getUpcomingFestivals().stream()
            .filter(festival -> festival.getApplicableBusinessCategories().contains(businessCategory))
            .sorted(Comparator.comparingInt(Festival::getSeoRankingBoost).reversed())
            .toList();
    }

    public Festival getFestivalById(String festivalId) {
        return getUpcomingFestivals().stream()
            .filter(festival -> festival.getId().equals(festivalId))
            .findFirst()
            .orElse(null);
    }
}
