package com.lunerie.api.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("select u from User u left join fetch u.preferences where lower(u.email) = lower(:email)")
    Optional<User> findWithPreferencesByEmail(@Param("email") String email);

    @Query("select u from User u left join fetch u.preferences where u.id = :id")
    Optional<User> findWithPreferencesById(@Param("id") UUID id);
}
