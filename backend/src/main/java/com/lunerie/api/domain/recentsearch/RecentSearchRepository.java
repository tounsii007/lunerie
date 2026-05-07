package com.lunerie.api.domain.recentsearch;

import com.lunerie.api.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecentSearchRepository extends JpaRepository<RecentSearch, UUID> {

    Optional<RecentSearch> findByUserAndNormalized(User user, String normalized);

    Page<RecentSearch> findByUserOrderBySearchedAtDesc(User user, Pageable pageable);

    List<RecentSearch> findTop8ByUserOrderBySearchedAtDesc(User user);

    long countByUser(User user);

    @Modifying
    @Query("delete from RecentSearch r where r.user = :user and r.id = :id")
    int deleteForUser(@Param("user") User user, @Param("id") UUID id);

    @Modifying
    @Query("delete from RecentSearch r where r.user = :user")
    int deleteAllForUser(@Param("user") User user);

    /**
     * Trending searches across all users (last 30 days, top N).
     * Privacy guard: only terms searched by ≥ {@code minDistinctUsers} different users
     * are surfaced — prevents one user's queries from appearing in a public endpoint.
     */
    @Query(value = """
            select normalized, count(*) as cnt
            from recent_searches
            where searched_at >= now() - interval '30 days'
              and length(normalized) between 2 and 60
            group by normalized
            having count(distinct user_id) >= :minDistinctUsers
            order by cnt desc
            limit :limit
            """, nativeQuery = true)
    List<Object[]> findTrending(@Param("limit") int limit, @Param("minDistinctUsers") int minDistinctUsers);
}
