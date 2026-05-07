package com.lunerie.api.application.user;

import com.lunerie.api.domain.user.User;
import com.lunerie.api.domain.user.UserPreferences;
import com.lunerie.api.web.dto.UserDtos.PatchPreferencesRequest;
import com.lunerie.api.web.dto.UserDtos.UpdatePreferencesRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PreferencesService {

    @Transactional(readOnly = true)
    public UserPreferences forUser(User user) {
        if (user.getPreferences() == null) {
            user.setPreferences(UserPreferences.builder().user(user).build());
        }
        return user.getPreferences();
    }

    @Transactional
    public UserPreferences replace(User user, UpdatePreferencesRequest request) {
        UserPreferences prefs = ensurePreferences(user);
        if (request.locale() != null)              prefs.setLocale(request.locale());
        if (request.theme() != null)               prefs.setTheme(request.theme());
        if (request.accentColor() != null)         prefs.setAccentColor(request.accentColor());
        if (request.backgroundStyle() != null)     prefs.setBackgroundStyle(request.backgroundStyle());
        if (request.rtl() != null)                 prefs.setRtl(request.rtl());
        if (request.reducedMotion() != null)       prefs.setReducedMotion(request.reducedMotion());
        if (request.hapticFeedback() != null)      prefs.setHapticFeedback(request.hapticFeedback());
        if (request.onboardingCompleted() != null) prefs.setOnboardingCompleted(request.onboardingCompleted());
        if (request.filterRadiusKm() != null)      prefs.setFilterRadiusKm(request.filterRadiusKm());
        if (request.filterSortBy() != null)        prefs.setFilterSortBy(request.filterSortBy());
        if (request.filterWithImageOnly() != null) prefs.setFilterWithImageOnly(request.filterWithImageOnly());
        prefs.setFilterCountryCode(request.filterCountryCode());
        if (request.selectedCategories() != null)  prefs.setSelectedCategories(new java.util.LinkedHashSet<>(request.selectedCategories()));
        return prefs;
    }

    @Transactional
    public UserPreferences patch(User user, PatchPreferencesRequest p) {
        UserPreferences prefs = ensurePreferences(user);
        if (p.locale() != null)              prefs.setLocale(p.locale());
        if (p.theme() != null)               prefs.setTheme(p.theme());
        if (p.accentColor() != null)         prefs.setAccentColor(p.accentColor());
        if (p.backgroundStyle() != null)     prefs.setBackgroundStyle(p.backgroundStyle());
        if (p.rtl() != null)                 prefs.setRtl(p.rtl());
        if (p.reducedMotion() != null)       prefs.setReducedMotion(p.reducedMotion());
        if (p.hapticFeedback() != null)      prefs.setHapticFeedback(p.hapticFeedback());
        if (p.onboardingCompleted() != null) prefs.setOnboardingCompleted(p.onboardingCompleted());
        if (p.filterRadiusKm() != null)      prefs.setFilterRadiusKm(p.filterRadiusKm());
        if (p.filterSortBy() != null)        prefs.setFilterSortBy(p.filterSortBy());
        if (p.filterWithImageOnly() != null) prefs.setFilterWithImageOnly(p.filterWithImageOnly());
        if (p.filterCountryCode() != null)   prefs.setFilterCountryCode(p.filterCountryCode());
        if (p.selectedCategories() != null)  prefs.setSelectedCategories(new java.util.LinkedHashSet<>(p.selectedCategories()));
        return prefs;
    }

    private UserPreferences ensurePreferences(User user) {
        if (user.getPreferences() == null) {
            UserPreferences fresh = UserPreferences.builder().user(user).build();
            user.setPreferences(fresh);
        }
        return user.getPreferences();
    }
}
