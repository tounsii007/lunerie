package com.lunerie.api.application.recentsearch;

import com.lunerie.api.domain.recentsearch.RecentSearch;
import com.lunerie.api.domain.recentsearch.RecentSearchRepository;
import com.lunerie.api.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RecentSearchService {

    private static final int RECENT_SEARCH_HARD_CAP = 32;

    private final RecentSearchRepository repository;

    public Page<RecentSearch> list(User user, Pageable pageable) {
        return repository.findByUserOrderBySearchedAtDesc(user, pageable);
    }

    public List<RecentSearch> top(User user) {
        return repository.findTop8ByUserOrderBySearchedAtDesc(user);
    }

    public long count(User user) {
        return repository.countByUser(user);
    }

    private static final int MIN_DISTINCT_USERS_FOR_TRENDING = 5;

    public List<TrendingTerm> trending(int limit) {
        return repository.findTrending(limit, MIN_DISTINCT_USERS_FOR_TRENDING).stream()
                .map(row -> new TrendingTerm((String) row[0], ((Number) row[1]).longValue()))
                .toList();
    }

    @Transactional
    public RecentSearch record(User user, String rawQuery, Integer resultCount) {
        String normalized = normalize(rawQuery);
        if (normalized.isEmpty()) {
            throw new com.lunerie.api.common.BadRequestException("Search query cannot be empty");
        }
        return repository.findByUserAndNormalized(user, normalized)
                .map(existing -> {
                    existing.setQuery(rawQuery.trim());
                    existing.setSearchedAt(Instant.now());
                    if (resultCount != null) existing.setResultCount(resultCount);
                    return existing;
                })
                .orElseGet(() -> {
                    long current = repository.countByUser(user);
                    if (current >= RECENT_SEARCH_HARD_CAP) {
                        repository.findByUserOrderBySearchedAtDesc(user, Pageable.unpaged())
                                .stream()
                                .skip(RECENT_SEARCH_HARD_CAP - 1L)
                                .forEach(repository::delete);
                    }
                    return repository.save(RecentSearch.builder()
                            .user(user)
                            .query(rawQuery.trim())
                            .normalized(normalized)
                            .searchedAt(Instant.now())
                            .resultCount(resultCount)
                            .build());
                });
    }

    @Transactional
    public boolean remove(User user, UUID id) {
        return repository.deleteForUser(user, id) > 0;
    }

    @Transactional
    public int clear(User user) {
        return repository.deleteAllForUser(user);
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    public record TrendingTerm(String term, long count) {}
}
