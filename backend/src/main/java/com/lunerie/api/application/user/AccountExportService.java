package com.lunerie.api.application.user;

import com.lunerie.api.application.user.AccountExport.AuditEntry;
import com.lunerie.api.application.user.AccountExport.FavoriteEntry;
import com.lunerie.api.application.user.AccountExport.FilterBlock;
import com.lunerie.api.application.user.AccountExport.PreferencesBlock;
import com.lunerie.api.application.user.AccountExport.RecentSearchEntry;
import com.lunerie.api.application.user.AccountExport.RecentViewEntry;
import com.lunerie.api.application.user.AccountExport.SessionEntry;
import com.lunerie.api.application.user.AccountExport.UserBlock;
import com.lunerie.api.domain.audit.AuditEventRepository;
import com.lunerie.api.domain.favorite.FavoriteRepository;
import com.lunerie.api.domain.recentsearch.RecentSearchRepository;
import com.lunerie.api.domain.recentview.RecentViewRepository;
import com.lunerie.api.domain.user.RefreshTokenRepository;
import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserPreferences;
import com.lunerie.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountExportService {

    private static final int LIST_CAP = 200;

    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final RecentViewRepository recentViewRepository;
    private final RecentSearchRepository recentSearchRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditEventRepository auditEventRepository;

    @Transactional(readOnly = true)
    public AccountExport export(User user) {
        return new AccountExport(
                Instant.now(),
                userBlock(user),
                preferencesBlock(user.getPreferences()),
                favorites(user),
                recentViews(user),
                recentSearches(user),
                sessions(user),
                audit(user)
        );
    }

    @Transactional
    public void hardDelete(User user) {
        userRepository.delete(user);
    }

    /* ----- Per-block builders (small, single-purpose) -------------------- */

    private static UserBlock userBlock(User user) {
        return new UserBlock(
                user.getId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.isActive(),
                user.getEmailVerifiedAt(),
                user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private static PreferencesBlock preferencesBlock(UserPreferences p) {
        if (p == null) return null;
        return new PreferencesBlock(
                p.getLocale(), p.getTheme(),
                p.getAccentColor(), p.getBackgroundStyle(),
                p.isRtl(), p.isReducedMotion(), p.isHapticFeedback(),
                p.isOnboardingCompleted(),
                new FilterBlock(
                        p.getFilterRadiusKm(), p.getFilterSortBy(),
                        p.isFilterWithImageOnly(),
                        p.getFilterCountryCode(), p.getSelectedCategories()
                )
        );
    }

    private List<FavoriteEntry> favorites(User user) {
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(f -> new FavoriteEntry(
                        f.getPlace().getId().toString(),
                        f.getPlace().getName(),
                        f.getCreatedAt()))
                .toList();
    }

    private List<RecentViewEntry> recentViews(User user) {
        return recentViewRepository.findByUserOrderByViewedAtDesc(user, PageRequest.of(0, LIST_CAP))
                .stream()
                .map(v -> new RecentViewEntry(
                        v.getPlace().getId().toString(),
                        v.getPlace().getName(),
                        v.getViewedAt()))
                .toList();
    }

    private List<RecentSearchEntry> recentSearches(User user) {
        return recentSearchRepository.findByUserOrderBySearchedAtDesc(user, PageRequest.of(0, LIST_CAP))
                .stream()
                .map(s -> new RecentSearchEntry(s.getQuery(), s.getSearchedAt(), s.getResultCount()))
                .toList();
    }

    private List<SessionEntry> sessions(User user) {
        return refreshTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(t -> new SessionEntry(
                        t.getCreatedAt(), t.getExpiresAt(),
                        t.isRevoked(), t.getRevokedAt(),
                        t.getUserAgent(), t.getIpAddress()))
                .toList();
    }

    private List<AuditEntry> audit(User user) {
        return auditEventRepository.findByActorIdOrderByCreatedAtAsc(user.getId()).stream()
                .map(e -> new AuditEntry(
                        e.getCreatedAt(), e.getEventType(),
                        e.getTargetType(), e.getTargetId(),
                        e.getIpAddress(), e.getUserAgent(),
                        e.getPayload() == null ? Map.of() : e.getPayload()))
                .toList();
    }
}
