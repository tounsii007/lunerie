package com.lunerie.api.domain.place;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaceRepository extends JpaRepository<Place, UUID>, JpaSpecificationExecutor<Place> {

    /* ----- Lookup ---------------------------------------------------------- */

    Optional<Place> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<Place> findByCountry_CodeIgnoreCase(String countryCode, Pageable pageable);

    long countByCountry_CodeIgnoreCase(String countryCode);

    /* ----- Categories ----------------------------------------------------- */

    @Query("select p from Place p join p.categories c where c = :category")
    Page<Place> findByCategory(@Param("category") PlaceCategory category, Pageable pageable);

    @Query("select count(p) from Place p join p.categories c where c = :category")
    long countByCategory(@Param("category") PlaceCategory category);

    /* ----- Discovery ------------------------------------------------------ */

    @Query("select p from Place p where p.popularity >= :minPopularity")
    Page<Place> findPopular(@Param("minPopularity") int minPopularity, Pageable pageable);

    @Query("select avg(p.popularity) from Place p")
    Double averagePopularity();

    @Query("select avg(p.relevance) from Place p")
    Double averageRelevance();

    long countByHasImageTrue();

    /**
     * Single-pass aggregate so {@code stats()} avoids issuing 4 separate scans.
     * Returns: [total, withImage, avgPopularity, avgRelevance].
     */
    @Query("""
            select count(p),
                   sum(case when p.hasImage = true then 1 else 0 end),
                   avg(p.popularity),
                   avg(p.relevance)
            from Place p
            """)
    Object[] aggregateStats();

    /**
     * One GROUP BY instead of one count-query per {@link PlaceCategory}.
     * Returns rows of {@code [category, count]}; categories with zero rows are absent.
     */
    @Query("select c, count(p) from Place p join p.categories c group by c")
    List<Object[]> countsByCategory();

    /* ----- Free-text JPQL search (simple LIKE) ---------------------------- */

    @Query("""
            select p from Place p
            where lower(p.name) like lower(concat('%', :q, '%'))
               or lower(p.description) like lower(concat('%', :q, '%'))
               or lower(p.city) like lower(concat('%', :q, '%'))
               or lower(p.region) like lower(concat('%', :q, '%'))
               or lower(p.country.name) like lower(concat('%', :q, '%'))
               or exists (select 1 from p.tags t where lower(t) like lower(concat('%', :q, '%')))
            """)
    Page<Place> search(@Param("q") String query, Pageable pageable);

    @Query("""
            select p from Place p
            where lower(p.name) like lower(concat(:prefix, '%'))
               or lower(p.city) like lower(concat(:prefix, '%'))
               or lower(p.country.name) like lower(concat(:prefix, '%'))
            order by p.popularity desc
            """)
    List<Place> suggest(@Param("prefix") String prefix, Pageable pageable);

    /* ----- Native SQL — see {@link PlaceQueries} for the SQL bodies ------ */

    @Query(value = PlaceQueries.RANDOM, nativeQuery = true)
    List<Place> findRandom(@Param("limit") int limit);

    @Query(value = PlaceQueries.NEARBY, nativeQuery = true)
    List<Place> findNearby(@Param("lat") double lat,
                           @Param("lon") double lon,
                           @Param("radiusKm") double radiusKm,
                           @Param("limit") int limit);

    @Query(value = PlaceQueries.FIND_BY_TAG,
           countQuery = PlaceQueries.FIND_BY_TAG_COUNT,
           nativeQuery = true)
    Page<Place> findByTag(@Param("tag") String tag, Pageable pageable);

    @Query(value = PlaceQueries.SEARCH_FULLTEXT,
           countQuery = PlaceQueries.SEARCH_FULLTEXT_COUNT,
           nativeQuery = true)
    Page<Place> searchFullText(@Param("query") String query, Pageable pageable);

    @Query(value = PlaceQueries.FIND_RELATED, nativeQuery = true)
    List<Place> findRelated(@Param("placeId") UUID placeId,
                            @Param("countryCode") String countryCode,
                            @Param("categories") Collection<String> categories,
                            @Param("limit") int limit);

    @Query(value = PlaceQueries.FIND_TRENDING_TAGS, nativeQuery = true)
    List<Object[]> findTrendingTags(@Param("limit") int limit);

    @Query(value = PlaceQueries.FIND_ALL_TAGS, nativeQuery = true)
    List<String> findAllTags();
}
