package com.lunerie.api.domain.recentview;

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
public interface RecentViewRepository extends JpaRepository<RecentView, UUID> {

    Page<RecentView> findByUserOrderByViewedAtDesc(User user, Pageable pageable);

    List<RecentView> findTop12ByUserOrderByViewedAtDesc(User user);

    Optional<RecentView> findByUserAndPlace_Id(User user, UUID placeId);

    long countByUser(User user);

    @Modifying
    @Query("delete from RecentView r where r.user = :user and r.place.id = :placeId")
    int deleteByUserAndPlaceId(@Param("user") User user, @Param("placeId") UUID placeId);

    @Modifying
    @Query("delete from RecentView r where r.user = :user")
    int deleteAllForUser(@Param("user") User user);
}
