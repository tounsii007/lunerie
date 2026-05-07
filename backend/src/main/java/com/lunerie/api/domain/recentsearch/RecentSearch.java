package com.lunerie.api.domain.recentsearch;

import com.lunerie.api.common.BaseEntity;
import com.lunerie.api.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recent_searches",
        uniqueConstraints = @UniqueConstraint(name = "uq_recent_searches_user_normalized", columnNames = {"user_id", "normalized"}),
        indexes = {
                @Index(name = "idx_recent_searches_user", columnList = "user_id"),
                @Index(name = "idx_recent_searches_user_searched_at", columnList = "user_id, searched_at DESC")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentSearch extends BaseEntity implements com.lunerie.api.application.common.UserOwned {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(min = 1, max = 200)
    @Column(nullable = false, length = 200)
    private String query;

    /** Lower-cased + trimmed copy used for de-duplication. */
    @NotBlank
    @Size(min = 1, max = 200)
    @Column(nullable = false, length = 200)
    private String normalized;

    @Column(name = "searched_at", nullable = false)
    private Instant searchedAt;

    @Column(name = "result_count")
    private Integer resultCount;
}
