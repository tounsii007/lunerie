package com.lunerie.api.application.favorite;

import com.lunerie.api.application.place.PlaceService;
import com.lunerie.api.common.NotFoundException;
import com.lunerie.api.domain.favorite.Favorite;
import com.lunerie.api.domain.favorite.FavoriteRepository;
import com.lunerie.api.domain.place.Place;
import com.lunerie.api.domain.place.PlaceRepository;
import com.lunerie.api.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class FavoriteService {

    private static final int FAVORITES_HARD_CAP = 500;

    private final FavoriteRepository favoriteRepository;
    private final PlaceRepository placeRepository;

    public Page<Favorite> list(User user, Pageable pageable) {
        Page<Favorite> page = favoriteRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        page.getContent().forEach(this::primePlace);
        return page;
    }

    public List<Favorite> listAll(User user) {
        List<Favorite> all = favoriteRepository.findByUserOrderByCreatedAtDesc(user);
        all.forEach(this::primePlace);
        return all;
    }

    private void primePlace(Favorite f) {
        // Favorite.place is LAZY; prime so the controller can map to PlaceSummary
        // after the @Transactional boundary closes (open-in-view is off).
        PlaceService.primeSummary(f.getPlace());
    }

    public boolean isFavorite(User user, UUID placeId) {
        return favoriteRepository.existsByUserAndPlace_Id(user, placeId);
    }

    public long count(User user) {
        return favoriteRepository.countByUser(user);
    }

    @Transactional
    public Favorite add(User user, UUID placeId) {
        long current = favoriteRepository.countByUser(user);
        if (current >= FAVORITES_HARD_CAP) {
            throw new com.lunerie.api.common.BadRequestException("Favorite limit reached (" + FAVORITES_HARD_CAP + ")");
        }

        Favorite favorite = favoriteRepository.findByUserAndPlace_Id(user, placeId)
                .orElseGet(() -> {
                    Place place = placeRepository.findById(placeId)
                            .orElseThrow(() -> NotFoundException.of("Place", placeId));
                    Favorite f = Favorite.builder().user(user).place(place).build();
                    return favoriteRepository.save(f);
                });
        primePlace(favorite);
        return favorite;
    }

    @Transactional
    public boolean remove(User user, UUID placeId) {
        return favoriteRepository.deleteByUserAndPlaceId(user, placeId) > 0;
    }

    @Transactional
    public int clear(User user) {
        return favoriteRepository.deleteAllForUser(user);
    }
}
