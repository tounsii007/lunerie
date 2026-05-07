package com.lunerie.api.domain.user;

import com.lunerie.api.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @NotBlank
    @Size(min = 60, max = 100)
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @NotBlank
    @Size(min = 1, max = 80)
    @Column(name = "display_name", nullable = false, length = 80)
    private String displayName;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "email_verified_at")
    private java.time.Instant emailVerifiedAt;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"),
            indexes = @Index(name = "idx_user_roles_user", columnList = "user_id"))
    @Column(name = "role", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private Set<UserRole> roles = new LinkedHashSet<>(Set.of(UserRole.USER));

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserPreferences preferences;
}
