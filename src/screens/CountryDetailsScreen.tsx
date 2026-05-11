import { OverlayFrame } from '@/components/AppShell';
import { Card, Stack } from '@/components/primitives';
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
      {country.heroImage ? (
        <img
          src={country.heroImage.url}
          alt={country.name}
          className="h-[260px] w-full object-cover"
        />
      ) : null}
      <Stack gap="md" className="p-5">
        <p className="leading-[1.6] text-[var(--app-text-muted)]">
          {country.region} · {country.subregion}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Card padded className="p-3.5">
            <strong>Capital</strong>
            <p className="text-[var(--app-text-muted)]">{country.capital}</p>
          </Card>
          <Card padded className="p-3.5">
            <strong>Population</strong>
            <p className="text-[var(--app-text-muted)]">{country.population.toLocaleString()}</p>
          </Card>
        </div>
        <Card padded className="p-4">
          <strong>Languages</strong>
          <p className="mt-2 text-[var(--app-text-muted)]">{country.languages.join(' · ')}</p>
        </Card>
        {data?.items.length ? (
          <PlacesMap places={data.items.slice(0, 8)} onSelectPlace={openPlace} />
        ) : null}
        <Stack gap="sm">
          {data?.items.slice(0, 4).map((place) => (
            <div
              key={place.id}
              className="flex justify-between gap-3 rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3.5"
            >
              <button onClick={() => openPlace(place)} className="flex-1 text-left">
                <strong>{place.name}</strong>
                <p className="mt-1.5 text-[var(--app-text-muted)]">{place.city}</p>
              </button>
              <button
                onClick={() => toggleFavorite(place)}
                aria-pressed={isFavorite(place.id)}
                className={`rounded-[14px] px-3 py-2.5 ${
                  isFavorite(place.id)
                    ? 'bg-[rgba(249,115,22,0.18)] text-[var(--accent-light)]'
                    : 'bg-[rgba(148,163,184,0.1)]'
                }`}
              >
                {isFavorite(place.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          ))}
        </Stack>
      </Stack>
    </OverlayFrame>
  );
}
