package com.lunerie.api.domain.login;

import com.lunerie.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "login_attempts", indexes = {
        @Index(name = "idx_login_attempts_email_attempted", columnList = "email"),
        @Index(name = "idx_login_attempts_user_attempted", columnList = "user_id"),
        @Index(name = "idx_login_attempts_attempted_at", columnList = "attempted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAttempt {

    public enum FailureReason {
        WRONG_PASSWORD, USER_NOT_FOUND, USER_DISABLED, RATE_LIMITED, OTHER
    }

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(length = 254)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private boolean successful;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "failure_reason", length = 64)
    private FailureReason failureReason;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;
}
