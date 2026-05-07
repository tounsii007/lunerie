package com.lunerie.api.domain.recentview;

import com.lunerie.api.common.BaseEntity;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recent_views", uniqueConstraints = @UniqueConstraint(name = "uq_recent_views_user_place", columnNames = {"user_id", "place_id"}),
        indexes = {
                @Index(name = "idx_recent_views_user", columnList = "user_id"),
                @Index(name = "idx_recent_views_place", columnList = "place_id"),
                @Index(name = "idx_recent_views_user_viewed_at", columnList = "user_id, viewed_at DESC")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentView extends BaseEntity implements com.lunerie.api.application.common.UserOwned {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "viewed_at", nullable = false)
    private Instant viewedAt;
}
