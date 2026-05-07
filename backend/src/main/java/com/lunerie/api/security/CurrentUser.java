package com.lunerie.api.security;

import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    public Optional<AppUserDetails> details() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AppUserDetails details)) {
            return Optional.empty();
        }
        return Optional.of(details);
    }

    @Transactional(readOnly = true)
    public User require() {
        AppUserDetails details = details().orElseThrow(() -> new NotFoundException("Authenticated user not found"));
        return userRepository.findById(details.id())
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public User requireWithPreferences() {
        AppUserDetails details = details().orElseThrow(() -> new NotFoundException("Authenticated user not found"));
        return userRepository.findWithPreferencesById(details.id())
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
    }
}
