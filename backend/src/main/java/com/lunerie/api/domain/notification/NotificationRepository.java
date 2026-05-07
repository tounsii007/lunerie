package com.lunerie.api.domain.notification;

import com.lunerie.api.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByUserAndReadAtIsNull(User user);

    @Modifying
    @Query("update Notification n set n.readAt = :now where n.user = :user and n.readAt is null")
    int markAllRead(@Param("user") User user, @Param("now") Instant now);

    @Modifying
    @Query("update Notification n set n.readAt = :now where n.user = :user and n.id = :id and n.readAt is null")
    int markRead(@Param("user") User user, @Param("id") UUID id, @Param("now") Instant now);

    @Modifying
    @Query("delete from Notification n where n.user = :user")
    int deleteAllForUser(@Param("user") User user);
}
