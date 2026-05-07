import { OverlayFrame } from '@/components/AppShell';
import { PlacesMap } from '@/components/PlacesMap';
import type { Country } from '@/domain/models';
import { useCountryPlaces } from '@/hooks/useCountryPlaces';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';

export function CountryDetailsScreen({ country }: { country: Country }) {
  const { closeOverlay, openPlace } = useNavigation();
  const { data } = useCountryPlaces(country.code);
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <OverlayFrame title={country.name} onClose={closeOverlay}>
      {country.heroImage ? <img src={country.heroImage.url} alt={country.name} style={{ width: '100%', height: 260, objectFit: 'cover' }} /> : null}
      <div style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.6 }}>{country.region} · {country.subregion}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div style={{ padding: 14, borderRadius: 20, background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
            <strong>Capital</strong>
            <p style={{ color: 'var(--app-text-muted)' }}>{country.capital}</p>
          </div>
          <div style={{ padding: 14, borderRadius: 20, background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
            <strong>Population</strong>
            <p style={{ color: 'var(--app-text-muted)' }}>{country.population.toLocaleString()}</p>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 22, background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          <strong>Languages</strong>
          <p style={{ color: 'var(--app-text-muted)', marginTop: 8 }}>{country.languages.join(' · ')}</p>
        </div>
        {data?.items.length ? <PlacesMap places={data.items.slice(0, 8)} onSelectPlace={openPlace} /> : null}
        <div style={{ display: 'grid', gap: 12 }}>
          {data?.items.slice(0, 4).map((place) => (
            <div key={place.id} style={{ padding: 14, borderRadius: 20, background: 'var(--app-surface)', border: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button onClick={() => openPlace(place)} style={{ textAlign: 'left', flex: 1 }}>
                <strong>{place.name}</strong>
                <p style={{ color: 'var(--app-text-muted)', marginTop: 6 }}>{place.city}</p>
              </button>
              <button onClick={() => toggleFavorite(place.id)} style={{ padding: '10px 12px', borderRadius: 14, background: isFavorite(place.id) ? 'rgba(249,115,22,0.18)' : 'rgba(148,163,184,0.1)' }}>
                {isFavorite(place.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </OverlayFrame>
  );
}
