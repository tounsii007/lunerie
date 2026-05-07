package com.lunerie.api.application.admin;

import com.lunerie.api.domain.place.PlaceCategory;

import java.util.Set;

/** Sparse patch — every field nullable means "do not change". Allows setting numerics to 0. */
public record PlacePatch(
        String name,
        String description,
        String region,
        String city,
        Double latitude,
        Double longitude,
        String heroImageUrl,
        String heroImageAlt,
        Set<PlaceCategory> categories,
        Set<String> tags,
        Integer popularity,
        Integer relevance
) {}
