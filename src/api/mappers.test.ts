import { describe, expect, it } from 'vitest';
import { mapOverpassElementToPlace, mapRestCountryToDomain } from '@/api/mappers';

describe('api mappers', () => {
  it('maps overpass element into a safe domain place', () => {
    const place = mapOverpassElementToPlace({
      element: {
        id: 42,
        type: 'node',
        lat: 36.8,
        lon: 10.1,
        tags: { name: 'Test Viewpoint', tourism: 'viewpoint' },
      },
      countryCode: 'TN',
      countryName: 'Tunisia',
      region: 'Tunis',
      city: 'Tunis',
    });

    expect(place.name).toBe('Test Viewpoint');
    expect(place.countryCode).toBe('TN');
    expect(place.categories).toContain('viewpoint');
  });

  it('maps rest country payload into the domain model', () => {
    const country = mapRestCountryToDomain({
      cca2: 'BR',
      cca3: 'BRA',
      name: { common: 'Brazil', official: 'Brazil' },
      region: 'Americas',
      subregion: 'South America',
      capital: ['Brasilia'],
      population: 100,
      flags: { svg: 'https://flagcdn.com/br.svg' },
      languages: { por: 'Portuguese' },
      currencies: { BRL: { name: 'Real' } },
    });

    expect(country.code).toBe('BR');
    expect(country.languages).toEqual(['Portuguese']);
  });
});
