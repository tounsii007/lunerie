-- =========================================================================
-- Lunerie API · V2 · seed countries
-- =========================================================================

INSERT INTO countries (code, code3, name, native_name, region, subregion, capital, population, flag_emoji, hero_image_url, hero_image_alt) VALUES
('TN', 'TUN', 'Tunisia',     'تونس',         'Africa',   'Northern Africa',         'Tunis',           11935764, '🇹🇳', 'https://images.pexels.com/photos/2901210/pexels-photo-2901210.jpeg', 'Sidi Bou Said cliffs above the Mediterranean'),
('MA', 'MAR', 'Morocco',     'المغرب',       'Africa',   'Northern Africa',         'Rabat',           36910560, '🇲🇦', 'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg', 'Atlas Mountains landscape'),
('DZ', 'DZA', 'Algeria',     'الجزائر',      'Africa',   'Northern Africa',         'Algiers',         44903225, '🇩🇿', 'https://images.pexels.com/photos/4350767/pexels-photo-4350767.jpeg', 'Algerian Sahara dunes'),
('EG', 'EGY', 'Egypt',       'مصر',          'Africa',   'Northern Africa',         'Cairo',          104258327, '🇪🇬', 'https://images.pexels.com/photos/3290072/pexels-photo-3290072.jpeg', 'Egyptian desert temple at sunset'),
('FR', 'FRA', 'France',      'France',       'Europe',   'Western Europe',          'Paris',           67391582, '🇫🇷', 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg', 'Parisian rooftops at golden hour'),
('DE', 'DEU', 'Germany',     'Deutschland',  'Europe',   'Western Europe',          'Berlin',          83240525, '🇩🇪', 'https://images.pexels.com/photos/2570063/pexels-photo-2570063.jpeg', 'Bavarian Alps reflective lake'),
('GB', 'GBR', 'United Kingdom','United Kingdom','Europe', 'Northern Europe',         'London',          67215293, '🇬🇧', 'https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg', 'British coast cliffs'),
('IT', 'ITA', 'Italy',       'Italia',       'Europe',   'Southern Europe',         'Rome',            59554023, '🇮🇹', 'https://images.pexels.com/photos/1488213/pexels-photo-1488213.jpeg', 'Cinque Terre coastline'),
('ES', 'ESP', 'Spain',       'España',       'Europe',   'Southern Europe',         'Madrid',          47351567, '🇪🇸', 'https://images.pexels.com/photos/1797158/pexels-photo-1797158.jpeg', 'Andalusian whitewashed village'),
('PT', 'PRT', 'Portugal',    'Portugal',     'Europe',   'Southern Europe',         'Lisbon',          10305564, '🇵🇹', 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg', 'Lisbon trams and tile facades'),
('CA', 'CAN', 'Canada',      'Canada',       'Americas', 'Northern America',        'Ottawa',          38005238, '🇨🇦', 'https://images.pexels.com/photos/1414704/pexels-photo-1414704.jpeg', 'Canadian Rockies turquoise lake'),
('US', 'USA', 'United States','United States','Americas','Northern America',        'Washington, D.C.',329484123,'🇺🇸', 'https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg', 'American west desert mesas'),
('BR', 'BRA', 'Brazil',      'Brasil',       'Americas', 'South America',           'Brasília',       212559417, '🇧🇷', 'https://images.pexels.com/photos/97906/pexels-photo-97906.jpeg', 'Christ the Redeemer over Rio'),
('AR', 'ARG', 'Argentina',   'Argentina',    'Americas', 'South America',           'Buenos Aires',    45376763, '🇦🇷', 'https://images.pexels.com/photos/1011759/pexels-photo-1011759.jpeg', 'Patagonian glacier'),
('JP', 'JPN', 'Japan',       '日本',         'Asia',     'Eastern Asia',            'Tokyo',          126476461, '🇯🇵', 'https://images.pexels.com/photos/1325837/pexels-photo-1325837.jpeg', 'Mount Fuji over a lake'),
('IS', 'ISL', 'Iceland',     'Ísland',       'Europe',   'Northern Europe',         'Reykjavík',         366425, '🇮🇸', 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg', 'Icelandic glacial waterfall'),
('NO', 'NOR', 'Norway',      'Norge',        'Europe',   'Northern Europe',         'Oslo',             5421241, '🇳🇴', 'https://images.pexels.com/photos/2253916/pexels-photo-2253916.jpeg', 'Norwegian fjord cliffs'),
('CH', 'CHE', 'Switzerland', 'Schweiz',      'Europe',   'Western Europe',          'Bern',             8654622, '🇨🇭', 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg', 'Swiss alpine lake');

INSERT INTO country_languages (country_code, language) VALUES
('TN', 'Arabic'), ('TN', 'French'),
('MA', 'Arabic'), ('MA', 'Berber'), ('MA', 'French'),
('DZ', 'Arabic'), ('DZ', 'Berber'),
('EG', 'Arabic'),
('FR', 'French'),
('DE', 'German'),
('GB', 'English'),
('IT', 'Italian'),
('ES', 'Spanish'),
('PT', 'Portuguese'),
('CA', 'English'), ('CA', 'French'),
('US', 'English'),
('BR', 'Portuguese'),
('AR', 'Spanish'),
('JP', 'Japanese'),
('IS', 'Icelandic'),
('NO', 'Norwegian'),
('CH', 'German'), ('CH', 'French'), ('CH', 'Italian');

INSERT INTO country_currencies (country_code, currency) VALUES
('TN', 'TND'),
('MA', 'MAD'),
('DZ', 'DZD'),
('EG', 'EGP'),
('FR', 'EUR'),
('DE', 'EUR'),
('GB', 'GBP'),
('IT', 'EUR'),
('ES', 'EUR'),
('PT', 'EUR'),
('CA', 'CAD'),
('US', 'USD'),
('BR', 'BRL'),
('AR', 'ARS'),
('JP', 'JPY'),
('IS', 'ISK'),
('NO', 'NOK'),
('CH', 'CHF');
