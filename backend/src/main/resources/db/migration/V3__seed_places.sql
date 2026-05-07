-- =========================================================================
-- Lunerie API · V3 · seed places
-- =========================================================================

-- Helper: deterministic UUIDs derived from slugs would be ideal, but we use
-- gen_random_uuid() and reference by slug downstream.

-- Tunisia
WITH ins AS (
    INSERT INTO places (slug, name, description, country_code, region, city, latitude, longitude,
                        hero_image_url, hero_image_alt, hero_image_source, source_attribution,
                        popularity, relevance, has_image)
    VALUES
    ('sidi-bou-said-belvedere', 'Sidi Bou Said Belvedere',
     'Mediterranean rooftops, blue-and-white lanes and a cinematic sea horizon above Tunis.',
     'TN', 'Tunis', 'Sidi Bou Said', 36.8716, 10.3417,
     'https://images.pexels.com/photos/2901210/pexels-photo-2901210.jpeg', 'Sidi Bou Said cliffs over the Mediterranean',
     'pexels', 'OpenStreetMap, Pexels', 94, 96, TRUE),

    ('douz-sahara-golden-dunes', 'Douz Sahara Golden Dunes',
     'Endless dune lines, camel tracks and glowing desert light at the gateway to the Grand Erg Oriental.',
     'TN', 'Kebili', 'Douz', 33.4658, 9.0203,
     'https://images.pexels.com/photos/4350767/pexels-photo-4350767.jpeg', 'Sahara dunes near Douz',
     'pexels', 'OpenStreetMap, Pexels', 92, 95, TRUE),

    ('tozeur-palm-oasis', 'Tozeur Palm Oasis',
     'Dense date palms, desert-edge architecture and warm oasis textures perfect for slow exploration.',
     'TN', 'Tozeur', 'Tozeur', 33.9197, 8.1335,
     'https://images.pexels.com/photos/1680247/pexels-photo-1680247.jpeg', 'Tozeur palm groves',
     'pexels', 'OpenStreetMap, Pexels', 89, 93, TRUE),

    ('chott-el-jerid-salt-pan', 'Chott el Jerid Salt Pan',
     'A vast surreal salt lake landscape with mirages, pastel skies and minimalist photo compositions.',
     'TN', 'Tozeur', 'Chott el Jerid', 33.7000, 8.4000,
     'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg', 'Chott el Jerid salt flats',
     'pexels', 'OpenStreetMap, Pexels', 91, 94, TRUE),

    ('matmata-troglodyte-village', 'Matmata Troglodyte Village',
     'Underground homes, lunar terrain and one of Tunisia''s most distinctive cultural landscapes.',
     'TN', 'Gabès', 'Matmata', 33.5444, 9.9700,
     'https://images.pexels.com/photos/3573351/pexels-photo-3573351.jpeg', 'Matmata troglodyte craters',
     'pexels', 'OpenStreetMap, Pexels', 88, 92, TRUE)
    RETURNING id, slug
)
INSERT INTO place_categories (place_id, category)
SELECT id, c.category FROM ins
JOIN (VALUES
    ('sidi-bou-said-belvedere', 'VIEWPOINT'),
    ('sidi-bou-said-belvedere', 'PHOTO_SPOT'),
    ('sidi-bou-said-belvedere', 'CULTURAL'),
    ('douz-sahara-golden-dunes', 'NATURE'),
    ('douz-sahara-golden-dunes', 'HIDDEN_GEM'),
    ('douz-sahara-golden-dunes', 'PHOTO_SPOT'),
    ('tozeur-palm-oasis', 'NATURE'),
    ('tozeur-palm-oasis', 'PARK'),
    ('tozeur-palm-oasis', 'HIDDEN_GEM'),
    ('chott-el-jerid-salt-pan', 'NATURE'),
    ('chott-el-jerid-salt-pan', 'PHOTO_SPOT'),
    ('chott-el-jerid-salt-pan', 'HIDDEN_GEM'),
    ('matmata-troglodyte-village', 'HISTORIC'),
    ('matmata-troglodyte-village', 'CULTURAL'),
    ('matmata-troglodyte-village', 'HIDDEN_GEM')
) AS c(slug, category) ON c.slug = ins.slug;

-- Morocco
WITH ins AS (
    INSERT INTO places (slug, name, description, country_code, region, city, latitude, longitude,
                        hero_image_url, hero_image_alt, hero_image_source, source_attribution,
                        popularity, relevance, has_image)
    VALUES
    ('chefchaouen-blue-streets', 'Chefchaouen Blue Streets',
     'Cascading indigo alleys in the Rif Mountains — a photographer''s daydream at dawn and dusk.',
     'MA', 'Tanger-Tetouan-Al Hoceima', 'Chefchaouen', 35.1689, -5.2636,
     'https://images.pexels.com/photos/2406731/pexels-photo-2406731.jpeg', 'Chefchaouen blue medina',
     'pexels', 'OpenStreetMap, Pexels', 95, 96, TRUE),

    ('aït-benhaddou-ksar', 'Aït Benhaddou Ksar',
     'A UNESCO-listed earthen ksar of stacked ochre kasbahs guarding the old caravan route.',
     'MA', 'Drâa-Tafilalet', 'Aït Benhaddou', 31.0470, -7.1300,
     'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg', 'Aït Benhaddou kasbah',
     'pexels', 'OpenStreetMap, Pexels', 90, 93, TRUE),

    ('merzouga-erg-chebbi', 'Merzouga Erg Chebbi',
     'Honey-coloured 150m dunes burning bright at sunrise — Morocco''s most iconic Saharan landscape.',
     'MA', 'Drâa-Tafilalet', 'Merzouga', 31.1000, -4.0167,
     'https://images.pexels.com/photos/2649110/pexels-photo-2649110.jpeg', 'Erg Chebbi dunes',
     'pexels', 'OpenStreetMap, Pexels', 93, 94, TRUE)
    RETURNING id, slug
)
INSERT INTO place_categories (place_id, category)
SELECT id, c.category FROM ins
JOIN (VALUES
    ('chefchaouen-blue-streets', 'CULTURAL'),
    ('chefchaouen-blue-streets', 'PHOTO_SPOT'),
    ('chefchaouen-blue-streets', 'HISTORIC'),
    ('aït-benhaddou-ksar', 'HISTORIC'),
    ('aït-benhaddou-ksar', 'CULTURAL'),
    ('aït-benhaddou-ksar', 'PHOTO_SPOT'),
    ('merzouga-erg-chebbi', 'NATURE'),
    ('merzouga-erg-chebbi', 'PHOTO_SPOT'),
    ('merzouga-erg-chebbi', 'HIDDEN_GEM')
) AS c(slug, category) ON c.slug = ins.slug;

-- Iceland & Norway (showcase nature places)
WITH ins AS (
    INSERT INTO places (slug, name, description, country_code, region, city, latitude, longitude,
                        hero_image_url, hero_image_alt, hero_image_source, source_attribution,
                        popularity, relevance, has_image)
    VALUES
    ('seljalandsfoss-waterfall', 'Seljalandsfoss Waterfall',
     'A 60m veil of glacial water you can walk behind — Iceland''s most cinematic single drop.',
     'IS', 'Suðurland', 'Seljaland', 63.6156, -19.9886,
     'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg', 'Seljalandsfoss waterfall',
     'pexels', 'OpenStreetMap, Pexels', 96, 97, TRUE),

    ('jokulsarlon-glacier-lagoon', 'Jökulsárlón Glacier Lagoon',
     'Drifting blue icebergs, black sand beaches and the constant low rumble of calving glaciers.',
     'IS', 'Austurland', 'Höfn', 64.0784, -16.2306,
     'https://images.pexels.com/photos/1421903/pexels-photo-1421903.jpeg', 'Jökulsárlón glacier lagoon',
     'pexels', 'OpenStreetMap, Pexels', 94, 95, TRUE),

    ('preikestolen-cliff', 'Preikestolen Cliff',
     '604m sheer plateau over Lysefjord — a viewpoint that defines Norwegian wilderness photography.',
     'NO', 'Rogaland', 'Forsand', 58.9864, 6.1903,
     'https://images.pexels.com/photos/2253916/pexels-photo-2253916.jpeg', 'Preikestolen cliff',
     'pexels', 'OpenStreetMap, Pexels', 95, 96, TRUE),

    ('lofoten-reine-village', 'Lofoten – Reine Village',
     'Red rorbu cabins under sharp granite peaks, mirrored in the still waters of the Norwegian Sea.',
     'NO', 'Nordland', 'Reine', 67.9329, 13.0876,
     'https://images.pexels.com/photos/9893767/pexels-photo-9893767.jpeg', 'Reine fishing village in Lofoten',
     'pexels', 'OpenStreetMap, Pexels', 93, 94, TRUE)
    RETURNING id, slug
)
INSERT INTO place_categories (place_id, category)
SELECT id, c.category FROM ins
JOIN (VALUES
    ('seljalandsfoss-waterfall', 'WATERFALL'),
    ('seljalandsfoss-waterfall', 'NATURE'),
    ('seljalandsfoss-waterfall', 'PHOTO_SPOT'),
    ('jokulsarlon-glacier-lagoon', 'LAKE'),
    ('jokulsarlon-glacier-lagoon', 'NATURE'),
    ('jokulsarlon-glacier-lagoon', 'PHOTO_SPOT'),
    ('preikestolen-cliff', 'VIEWPOINT'),
    ('preikestolen-cliff', 'MOUNTAIN'),
    ('preikestolen-cliff', 'NATURE'),
    ('lofoten-reine-village', 'PHOTO_SPOT'),
    ('lofoten-reine-village', 'CULTURAL'),
    ('lofoten-reine-village', 'HIDDEN_GEM')
) AS c(slug, category) ON c.slug = ins.slug;

-- Canada / Argentina / Japan / Switzerland — showcase one each
WITH ins AS (
    INSERT INTO places (slug, name, description, country_code, region, city, latitude, longitude,
                        hero_image_url, hero_image_alt, hero_image_source, source_attribution,
                        popularity, relevance, has_image)
    VALUES
    ('moraine-lake-banff', 'Moraine Lake',
     'Glacial flour turns this Banff lake an unreal turquoise framed by the Valley of Ten Peaks.',
     'CA', 'Alberta', 'Banff', 51.3217, -116.1860,
     'https://images.pexels.com/photos/1414704/pexels-photo-1414704.jpeg', 'Moraine Lake in Banff',
     'pexels', 'OpenStreetMap, Pexels', 97, 97, TRUE),

    ('perito-moreno-glacier', 'Perito Moreno Glacier',
     '5km of advancing blue ice in Los Glaciares National Park — front-row calving theatre.',
     'AR', 'Santa Cruz', 'El Calafate', -50.4967, -73.1377,
     'https://images.pexels.com/photos/1011759/pexels-photo-1011759.jpeg', 'Perito Moreno glacier',
     'pexels', 'OpenStreetMap, Pexels', 95, 96, TRUE),

    ('mount-fuji-kawaguchiko', 'Mount Fuji from Kawaguchiko',
     '3776m of perfect symmetry mirrored in the lake at sunrise — Japan''s defining viewpoint.',
     'JP', 'Yamanashi', 'Fujikawaguchiko', 35.5167, 138.7522,
     'https://images.pexels.com/photos/1325837/pexels-photo-1325837.jpeg', 'Mount Fuji over Lake Kawaguchi',
     'pexels', 'OpenStreetMap, Pexels', 98, 98, TRUE),

    ('lauterbrunnen-valley', 'Lauterbrunnen Valley',
     '72 waterfalls plunging from Bernese Oberland cliffs — the inspiration for Tolkien''s Rivendell.',
     'CH', 'Bern', 'Lauterbrunnen', 46.5942, 7.9089,
     'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg', 'Lauterbrunnen valley waterfalls',
     'pexels', 'OpenStreetMap, Pexels', 94, 95, TRUE)
    RETURNING id, slug
)
INSERT INTO place_categories (place_id, category)
SELECT id, c.category FROM ins
JOIN (VALUES
    ('moraine-lake-banff', 'LAKE'),
    ('moraine-lake-banff', 'MOUNTAIN'),
    ('moraine-lake-banff', 'PHOTO_SPOT'),
    ('perito-moreno-glacier', 'NATURE'),
    ('perito-moreno-glacier', 'VIEWPOINT'),
    ('perito-moreno-glacier', 'PHOTO_SPOT'),
    ('mount-fuji-kawaguchiko', 'MOUNTAIN'),
    ('mount-fuji-kawaguchiko', 'VIEWPOINT'),
    ('mount-fuji-kawaguchiko', 'PHOTO_SPOT'),
    ('lauterbrunnen-valley', 'WATERFALL'),
    ('lauterbrunnen-valley', 'NATURE'),
    ('lauterbrunnen-valley', 'VIEWPOINT')
) AS c(slug, category) ON c.slug = ins.slug;

-- Tags (a small representative set)
INSERT INTO place_tags (place_id, tag)
SELECT p.id, t.tag FROM places p
JOIN (VALUES
    ('sidi-bou-said-belvedere', 'mediterranean'),
    ('sidi-bou-said-belvedere', 'sunset'),
    ('douz-sahara-golden-dunes', 'desert'),
    ('douz-sahara-golden-dunes', 'sunset'),
    ('tozeur-palm-oasis', 'oasis'),
    ('chott-el-jerid-salt-pan', 'minimal'),
    ('matmata-troglodyte-village', 'unesco'),
    ('chefchaouen-blue-streets', 'medina'),
    ('chefchaouen-blue-streets', 'colorful'),
    ('aït-benhaddou-ksar', 'unesco'),
    ('merzouga-erg-chebbi', 'desert'),
    ('seljalandsfoss-waterfall', 'waterfall'),
    ('seljalandsfoss-waterfall', 'walkable'),
    ('jokulsarlon-glacier-lagoon', 'glacier'),
    ('preikestolen-cliff', 'hike'),
    ('preikestolen-cliff', 'cliff'),
    ('lofoten-reine-village', 'fishing'),
    ('moraine-lake-banff', 'turquoise'),
    ('perito-moreno-glacier', 'glacier'),
    ('mount-fuji-kawaguchiko', 'sunrise'),
    ('lauterbrunnen-valley', 'alpine')
) AS t(slug, tag) ON p.slug = t.slug;
