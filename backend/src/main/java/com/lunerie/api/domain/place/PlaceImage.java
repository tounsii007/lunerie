package com.lunerie.api.domain.place;

import com.lunerie.api.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "place_images", indexes = {
        @Index(name = "idx_place_images_place", columnList = "place_id"),
        @Index(name = "idx_place_images_place_sort", columnList = "place_id, sort_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceImage extends BaseEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @NotBlank
    @Size(max = 1024)
    @Column(nullable = false, length = 1024)
    private String url;

    @Size(max = 256)
    @Column(length = 256)
    private String alt;

    @Size(max = 200)
    @Column(length = 200)
    private String photographer;

    @Size(max = 32)
    @Column(length = 32)
    private String source;

    @PositiveOrZero
    @Column
    private Integer width;

    @PositiveOrZero
    @Column
    private Integer height;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Builder.Default
    @Column(name = "is_hero", nullable = false)
    private boolean hero = false;
}
