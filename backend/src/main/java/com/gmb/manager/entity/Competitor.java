package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "competitors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competitor {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    private String name;

    private Double rating;

    @Field("review_count")
    private Integer reviewCount;

    private String category;

    @Field("posting_activity")
    private String postingActivity; // e.g., "High", "Low", "None"

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
