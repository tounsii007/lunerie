package com.lunerie.api.domain.place;

/**
 * Native SQL fragments used by {@link PlaceRepository}. Postgres-only:
 * relies on {@code random()}, {@code acos/radians}, {@code tsvector},
 * {@code websearch_to_tsquery}, and {@code interval} arithmetic.
 *
 * <p>Centralising the query strings keeps repository interfaces small and makes
 * SQL changes greppable. Do not inline these back into the repository.
 */
final class PlaceQueries {
    private PlaceQueries() {}

    static final String RANDOM = """
            select p.* from places p
            order by random()
            limit :limit
            """;

    /** Haversine in km against a {@code (:lat, :lon)} centre, capped at {@code :radiusKm}. */
    static final String NEARBY = """
            select p.*, (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(:lon)) +
                    sin(radians(:lat)) * sin(radians(p.latitude))
                )
            ) as distance_km
            from places p
            where (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(:lon)) +
                    sin(radians(:lat)) * sin(radians(p.latitude))
                )
            ) <= :radiusKm
            order by distance_km asc
            limit :limit
            """;

    static final String FIND_BY_TAG = """
            select p.* from places p
            join place_tags t on t.place_id = p.id
            where lower(t.tag) = lower(:tag)
            order by p.popularity desc
            """;

    static final String FIND_BY_TAG_COUNT = """
            select count(*) from place_tags t where lower(t.tag) = lower(:tag)
            """;

    static final String FIND_RELATED = """
            select p.* from places p
            where p.id <> :placeId
              and (
                p.country_code = :countryCode
                or exists (
                    select 1 from place_categories pc
                    where pc.place_id = p.id
                      and pc.category in (:categories)
                )
              )
            order by p.popularity desc
            limit :limit
            """;

    static final String SEARCH_FULLTEXT = """
            select p.* from places p
            where p.search_vector @@ websearch_to_tsquery('simple', :query)
            order by ts_rank(p.search_vector, websearch_to_tsquery('simple', :query)) desc,
                     p.popularity desc
            """;

    static final String SEARCH_FULLTEXT_COUNT = """
            select count(*) from places p
            where p.search_vector @@ websearch_to_tsquery('simple', :query)
            """;

    static final String FIND_TRENDING_TAGS = """
            select tag, count(*) as cnt
            from place_tags
            group by tag
            order by cnt desc
            limit :limit
            """;

    static final String FIND_ALL_TAGS = """
            select distinct tag from place_tags order by tag asc
            """;
}
