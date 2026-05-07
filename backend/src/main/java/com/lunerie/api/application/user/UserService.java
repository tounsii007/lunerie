package com.lunerie.api.application.user;

import com.lunerie.api.common.BadRequestException;
import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserRepository;
import com.lunerie.api.web.dto.UserDtos.ChangePasswordRequest;
import com.lunerie.api.web.dto.UserDtos.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User updateProfile(User user, UpdateProfileRequest request) {
        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName().trim());
        }
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deactivate(User user) {
        user.setActive(false);
        userRepository.save(user);
    }

    /** Throws BadRequestException if the supplied password does not match. */
    public void verifyPassword(User user, String password) {
        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
    }
}
