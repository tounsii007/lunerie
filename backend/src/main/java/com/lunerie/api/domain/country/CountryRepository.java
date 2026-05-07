package com.lunerie.api.domain.country;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, String> {

    Optional<Country> findByCodeIgnoreCase(String code);

    Optional<Country> findByCode3IgnoreCase(String code3);

    boolean existsByCodeIgnoreCase(String code);

    Page<Country> findByRegionIgnoreCase(String region, Pageable pageable);

    @Query("select distinct c.region from Country c order by c.region asc")
    List<String> findDistinctRegions();

    @Query("""
            select c from Country c
            where lower(c.name) like lower(concat('%', :query, '%'))
               or lower(c.code) = lower(:query)
               or lower(c.capital) like lower(concat('%', :query, '%'))
            """)
    Page<Country> search(@Param("query") String query, Pageable pageable);

    @Query("select count(c) from Country c where lower(c.region) = lower(:region)")
    long countByRegion(@Param("region") String region);

    @Query("""
            select c.region as region, count(c) as count, coalesce(sum(c.population), 0) as totalPopulation
            from Country c
            group by c.region
            order by c.region asc
            """)
    List<RegionAggregate> aggregateByRegion();

    /** Projection for {@link #aggregateByRegion()}. */
    interface RegionAggregate {
        String getRegion();
        long getCount();
        long getTotalPopulation();
    }
}
