package com.lunerie.api.application.tag;

import com.lunerie.api.domain.place.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TagService {

    private final PlaceRepository placeRepository;

    @Cacheable("tags-all")
    public List<String> all() {
        return placeRepository.findAllTags();
    }

    public List<TrendingTag> trending(int limit) {
        return placeRepository.findTrendingTags(limit).stream()
                .map(row -> new TrendingTag((String) row[0], ((Number) row[1]).longValue()))
                .toList();
    }

    public record TrendingTag(String tag, long count) {}
}
