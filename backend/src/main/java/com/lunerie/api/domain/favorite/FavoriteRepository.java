package com.lunerie.api.domain.favorite;

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
public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {

    Page<Favorite> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    Optional<Favorite> findByUserAndPlace_Id(User user, UUID placeId);

    boolean existsByUserAndPlace_Id(User user, UUID placeId);

    long countByUser(User user);

    @Modifying
    @Query("delete from Favorite f where f.user = :user and f.place.id = :placeId")
    int deleteByUserAndPlaceId(@Param("user") User user, @Param("placeId") UUID placeId);

    @Modifying
    @Query("delete from Favorite f where f.user = :user")
    int deleteAllForUser(@Param("user") User user);

    @Query("""
            select f.place.id as placeId, count(f) as cnt
            from Favorite f
            group by f.place.id
            order by cnt desc
            """)
    List<Object[]> findTopFavoritedPlaceIds(Pageable pageable);
}
