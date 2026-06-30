package com.gmb.manager.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;

    @Builder.Default
    private String role = "ROLE_CLIENT"; // "ROLE_ADMIN", "ROLE_CLIENT"

    @Indexed(unique = true, sparse = true)
    @Field("google_sub")
    private String googleSub;

    @Field("avatar_url")
    private String avatarUrl;

    @Field("google_access_token")
    private String googleAccessToken;

    @Field("google_refresh_token")
    private String googleRefreshToken;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
