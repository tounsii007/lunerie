package com.lunerie.api.web.dto;

import com.lunerie.api.application.recentsearch.RecentSearchService.TrendingTerm;
import com.lunerie.api.domain.recentsearch.RecentSearch;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class RecentSearchDtos {
    private RecentSearchDtos() {}

    public record RecentSearchResponse(
            UUID id,
            String query,
            Instant searchedAt,
            Integer resultCount
    ) {
        public static RecentSearchResponse from(RecentSearch s) {
            return new RecentSearchResponse(s.getId(), s.getQuery(), s.getSearchedAt(), s.getResultCount());
        }
    }

    public record RecordSearchRequest(
            @NotBlank @Size(min = 1, max = 200) String query,
            @PositiveOrZero Integer resultCount
    ) {}

    public record TrendingTermResponse(String term, long count) {
        public static TrendingTermResponse from(TrendingTerm t) {
            return new TrendingTermResponse(t.term(), t.count());
        }
    }
}
