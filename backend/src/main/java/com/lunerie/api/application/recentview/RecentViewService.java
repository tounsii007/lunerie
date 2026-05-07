package com.lunerie.api.application.recentview;

import com.lunerie.api.application.place.PlaceService;
import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.place.PlaceRepository;
import com.lunerie.api.domain.recentview.RecentView;
import com.lunerie.api.domain.recentview.RecentViewRepository;
import com.lunerie.api.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RecentViewService {

    private static final int RECENT_VIEW_HARD_CAP = 50;

    private final RecentViewRepository recentViewRepository;
    private final PlaceRepository placeRepository;

    public Page<RecentView> list(User user, Pageable pageable) {
        Page<RecentView> page = recentViewRepository.findByUserOrderByViewedAtDesc(user, pageable);
        page.getContent().forEach(this::primePlace);
        return page;
    }

    public List<RecentView> recent(User user) {
        List<RecentView> top = recentViewRepository.findTop12ByUserOrderByViewedAtDesc(user);
        top.forEach(this::primePlace);
        return top;
    }

    private void primePlace(RecentView v) {
        // RecentView.place is LAZY; prime for PlaceSummary mapping outside the
        // transaction (open-in-view is off).
        PlaceService.primeSummary(v.getPlace());
    }

    public long count(User user) {
        return recentViewRepository.countByUser(user);
    }

    @Transactional
    public RecentView push(User user, UUID placeId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> NotFoundException.of("Place", placeId));

        RecentView result = recentViewRepository.findByUserAndPlace_Id(user, placeId)
                .map(view -> {
                    view.setViewedAt(Instant.now());
                    return view;
                })
                .orElseGet(() -> {
                    long current = recentViewRepository.countByUser(user);
                    if (current >= RECENT_VIEW_HARD_CAP) {
                        // Trim oldest entry to keep list bounded.
                        recentViewRepository.findByUserOrderByViewedAtDesc(user, Pageable.unpaged())
                                .stream()
                                .skip(RECENT_VIEW_HARD_CAP - 1L)
                                .forEach(recentViewRepository::delete);
                    }
                    RecentView view = RecentView.builder()
                            .user(user).place(place).viewedAt(Instant.now())
                            .build();
                    return recentViewRepository.save(view);
                });
        primePlace(result);
        return result;
    }

    @Transactional
    public boolean remove(User user, UUID placeId) {
        return recentViewRepository.deleteByUserAndPlaceId(user, placeId) > 0;
    }

    @Transactional
    public int clear(User user) {
        return recentViewRepository.deleteAllForUser(user);
    }
}
