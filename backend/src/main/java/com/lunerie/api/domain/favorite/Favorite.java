package com.lunerie.api.domain.favorite;

import com.lunerie.api.common.BaseEntity;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "favorites", uniqueConstraints = @UniqueConstraint(name = "uq_favorites_user_place", columnNames = {"user_id", "place_id"}),
        indexes = {
                @Index(name = "idx_favorites_user", columnList = "user_id"),
                @Index(name = "idx_favorites_place", columnList = "place_id"),
                @Index(name = "idx_favorites_user_created", columnList = "user_id, created_at DESC")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite extends BaseEntity implements com.lunerie.api.application.common.UserOwned {

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
}
