package com.lunerie.api.application.place;

import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.place.PlaceCategory;
import com.lunerie.api.domain.place.PlaceRepository;
import io.micrometer.observation.annotation.Observed;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.hibernate.Hibernate;

import java.util.*;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

    public Page<Place> list(SearchCriteria criteria, Pageable pageable) {
        Specification<Place> spec = buildSpec(criteria);
        return primeSummary(placeRepository.findAll(spec, pageable));
    }

    public Place get(UUID id) {
        return primeDetail(placeRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Place", id)));
    }

    public Place getBySlug(String slug) {
        return primeDetail(placeRepository.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("Place(slug)", slug)));
    }

    public Page<Place> explore(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "popularity")
                .and(Sort.by(Sort.Direction.DESC, "relevance")));
        return primeSummary(placeRepository.findAll(pageable));
    }

    @Observed(name = "lunerie.places.search", contextualName = "places.search",
            lowCardinalityKeyValues = {"flow", "search"})
    public Page<Place> search(String query, SearchCriteria criteria, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return list(criteria, pageable);
        }
        // When no filters are set, the repository's JPQL `search` is strictly
        // better: it uses `exists (... from p.tags t)` for the element-collection
        // and avoids the cartesian blow-up that a Specification join on `tags`
        // would cause. The previous Specification also called `cb.lower(tagsJoin)`
        // on the Join object itself, which is invalid.
        if (isEmpty(criteria)) {
            return primeSummary(placeRepository.search(query.trim(), pageable));
        }
        // With filters: combine criteria filter + free-text in a single SQL by
        // pushing the free-text predicate through an `exists` subquery for tags.
        Specification<Place> spec = buildSpec(criteria).and((root, q, cb) -> {
            String pattern = "%" + query.toLowerCase() + "%";
            var country = root.join("country", JoinType.LEFT);
            // Subquery for tag match — avoids joining the element-collection on
            // the outer query (which forces DISTINCT and inflates row count).
            var tagSub = q.subquery(Long.class);
            var tagRoot = tagSub.correlate(root);
            var tag = tagRoot.join("tags", JoinType.INNER);
            tagSub.select(cb.literal(1L)).where(cb.like(cb.lower(tag), pattern));
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern),
                    cb.like(cb.lower(root.get("region")), pattern),
                    cb.like(cb.lower(country.get("name")), pattern),
                    cb.exists(tagSub)
            );
        });
        return primeSummary(placeRepository.findAll(spec, pageable));
    }

    private static boolean isEmpty(SearchCriteria c) {
        return c == null
                || (c.countryCode() == null
                    && c.category() == null
                    && c.withImageOnly() == null
                    && c.minPopularity() == null
                    && c.minRelevance() == null);
    }

    public List<Place> nearby(double lat, double lon, double radiusKm, int limit) {
        return primeSummary(placeRepository.findNearby(lat, lon, radiusKm, limit));
    }

    public Page<Place> byCountry(String countryCode, Pageable pageable) {
        return primeSummary(placeRepository.findByCountry_CodeIgnoreCase(countryCode, pageable));
    }

    public long countByCountry(String countryCode) {
        return placeRepository.countByCountry_CodeIgnoreCase(countryCode);
    }

    public Page<Place> byCategory(PlaceCategory category, Pageable pageable) {
        return primeSummary(placeRepository.findByCategory(category, pageable));
    }

    public Page<Place> popular(int minPopularity, Pageable pageable) {
        return primeSummary(placeRepository.findPopular(minPopularity, pageable));
    }

    public Page<Place> recent(Pageable pageable) {
        return primeSummary(placeRepository.findAll(PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "updatedAt"))));
    }

    public List<Place> random(int limit) {
        return primeSummary(placeRepository.findRandom(limit));
    }

    public long count() {
        return placeRepository.count();
    }

    public List<Place> suggest(String prefix, int limit) {
        if (prefix == null || prefix.isBlank()) {
            return List.of();
        }
        return primeSummary(placeRepository.suggest(
                prefix.trim(), org.springframework.data.domain.PageRequest.of(0, limit)));
    }

    public List<Place> related(UUID placeId, int limit) {
        // `get` already primes the anchor; reading categories/country here is safe.
        Place anchor = get(placeId);
        var categoryNames = anchor.getCategories().stream().map(Enum::name).toList();
        return primeSummary(placeRepository.findRelated(
                placeId, anchor.getCountry().getCode(), categoryNames, limit));
    }

    public Page<Place> byTag(String tag, Pageable pageable) {
        return primeSummary(placeRepository.findByTag(tag, pageable));
    }

    public Page<Place> fullTextSearch(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return Page.empty(pageable);
        }
        return primeSummary(placeRepository.searchFullText(query, pageable));
    }

    @Cacheable("place-stats")
    public Stats stats() {
        // Single aggregate query: total, withImage, avgPopularity, avgRelevance.
        Object[] agg = placeRepository.aggregateStats();
        long total = ((Number) agg[0]).longValue();
        long withImage = agg[1] == null ? 0L : ((Number) agg[1]).longValue();
        double avgPopularity = agg[2] == null ? 0.0 : ((Number) agg[2]).doubleValue();
        double avgRelevance = agg[3] == null ? 0.0 : ((Number) agg[3]).doubleValue();

        // Single GROUP BY instead of one count-query per category. Categories
        // with zero rows are absent from the result, so we pre-fill with 0L.
        Map<PlaceCategory, Long> byCategory = new EnumMap<>(PlaceCategory.class);
        for (PlaceCategory c : PlaceCategory.values()) {
            byCategory.put(c, 0L);
        }
        for (Object[] row : placeRepository.countsByCategory()) {
            byCategory.put((PlaceCategory) row[0], ((Number) row[1]).longValue());
        }
        return new Stats(total, withImage, avgPopularity, avgRelevance, byCategory);
    }

    @Cacheable("place-categories")
    public List<PlaceCategory> categories() {
        return Arrays.asList(PlaceCategory.values());
    }

    /* -------------------------------------------------------------------- */

    public record Stats(
            long total,
            long withImage,
            double averagePopularity,
            double averageRelevance,
            Map<PlaceCategory, Long> byCategory
    ) {}

    public record SearchCriteria(
            String countryCode,
            PlaceCategory category,
            Boolean withImageOnly,
            Integer minPopularity,
            Integer minRelevance
    ) {
        public static SearchCriteria empty() {
            return new SearchCriteria(null, null, null, null, null);
        }
    }

    private Specification<Place> buildSpec(SearchCriteria criteria) {
        return (root, q, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (criteria.countryCode() != null) {
                // FK column is `country_code` on `places`; no join needed.
                predicates.add(cb.equal(
                        cb.lower(root.get("country").get("code")),
                        criteria.countryCode().toLowerCase()));
            }
            if (criteria.category() != null) {
                // Use an `exists` subquery instead of a join on the
                // @ElementCollection. This avoids row multiplication and
                // removes the need for DISTINCT on the outer query.
                var sub = q.subquery(Long.class);
                var subRoot = sub.correlate(root);
                var catJoin = subRoot.join("categories", JoinType.INNER);
                sub.select(cb.literal(1L)).where(cb.equal(catJoin, criteria.category()));
                predicates.add(cb.exists(sub));
            }
            if (Boolean.TRUE.equals(criteria.withImageOnly())) {
                predicates.add(cb.isTrue(root.get("hasImage")));
            }
            if (criteria.minPopularity() != null) {
                predicates.add(cb.ge(root.get("popularity"), criteria.minPopularity()));
            }
            if (criteria.minRelevance() != null) {
                predicates.add(cb.ge(root.get("relevance"), criteria.minRelevance()));
            }
            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private static double nullToZero(Double value) {
        return value == null ? 0.0 : value;
    }

    /* ----- Lazy-init priming -------------------------------------------------
     *
     * `categories`, `tags`, `country`, and `images` are LAZY. The controller
     * maps Place → DTO *outside* the @Transactional service method, and
     * `spring.jpa.open-in-view=false` means the persistence context is closed
     * by then. We therefore touch the LAZY associations here, while still
     * inside the transaction. Thanks to @BatchSize, all uninitialized
     * collections in the page are loaded with a single IN-query per type.
     *
     * `primeSummary` covers what {@code PlaceSummary.from} reads (country +
     * categories). `primeDetail` additionally pulls tags and images for
     * {@code PlaceDetail.from}. Splitting avoids paying for tag/image loads on
     * list endpoints that don't render them.
     * ---------------------------------------------------------------------- */

    /** Prime LAZY associations needed by {@code PlaceSummary.from}. Public so
     *  other services (favorites, recent views) can reuse it for embedded
     *  Place references they hand out for summary mapping. */
    public static Place primeSummary(Place p) {
        if (p == null) return null;
        Hibernate.initialize(p.getCountry());
        Hibernate.initialize(p.getCategories());
        return p;
    }

    private static List<Place> primeSummary(List<Place> places) {
        for (Place p : places) primeSummary(p);
        return places;
    }

    private static Page<Place> primeSummary(Page<Place> page) {
        primeSummary(page.getContent());
        return page;
    }

    /** Used by {@code AdminService} to prime entities returned to PlaceDetail. */
    public static Place primeDetail(Place p) {
        if (p == null) return null;
        Hibernate.initialize(p.getCountry());
        Hibernate.initialize(p.getCategories());
        Hibernate.initialize(p.getTags());
        Hibernate.initialize(p.getImages());
        return p;
    }
}
