import { useEffect } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { OverlayFrame } from '@/components/AppShell';
import { Button, Card, Pill, Stack } from '@/components/primitives';
import { PlacesMap } from '@/components/PlacesMap';
import type { Place } from '@/domain/models';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useHaptic } from '@/hooks/useHaptic';
import { shareContent } from '@/utils/share';

export function PlaceDetailsScreen({ place }: { place: Place }) {
  const { t } = useI18n();
  const { closeOverlay } = useNavigation();
  const { isFavorite, toggleFavorite, pushRecentView } = useFavorites();
  const haptic = useHaptic();
  const saved = isFavorite(place.id);

  useEffect(() => {
    pushRecentView(place);
  }, [place, pushRecentView]);

  const handleSave = () => {
    // Pass the full Place so the favorite captures a snapshot — see
    // FavoritesScreen for why this matters.
    toggleFavorite(place);
    haptic('success');
    toast.success(saved ? 'Removed from favorites' : 'Added to favorites', { duration: 1600 });
  };

  const handleShare = async () => {
    haptic('light');
    const result = await shareContent({
      title: place.name,
      text: place.description,
      url: window.location.href,
    });
    if (result === 'copied') {
      toast.success(t('shareCopied'));
    } else if (result === 'unsupported') {
      toast.error(t('shareUnavailable'));
    }
  };

  return (
    <OverlayFrame title={place.name} onClose={closeOverlay}>
      <div className="relative">
        <img
          src={place.heroImage.url}
          alt={place.name}
          loading="eager"
          decoding="async"
          className="h-[280px] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(2,6,23,0.7))]" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
          <Pill tone="inverse">{place.popularity}% hot</Pill>
          <Pill tone="accent" className="uppercase tracking-[0.06em]">
            {place.relevance}% match
          </Pill>
        </div>
      </div>

      <Stack gap="lg" className="p-5">
        <div>
          <p className="mb-2.5 text-sm font-semibold text-[var(--accent-light)]">
            {place.city}, {place.countryName}
          </p>
          <p className="text-sm leading-[1.7] text-[var(--app-text-muted)]">{place.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {place.categories.map((category) => (
            <Pill key={category} tone="accent" className="capitalize">
              {category.replace('_', ' ')}
            </Pill>
          ))}
        </div>

        <Card className="grid gap-2.5">
          <div>
            <strong className="text-[13px] text-[var(--app-text-muted)]">{t('coordinates')}</strong>
            <p className="mt-1 text-sm tabular-nums">
              {place.coordinates.latitude.toFixed(4)}, {place.coordinates.longitude.toFixed(4)}
            </p>
          </div>
          <div>
            <strong className="text-[13px] text-[var(--app-text-muted)]">{t('sourceLabel')}</strong>
            <p className="mt-1 text-[13px] text-[var(--app-text)]">{place.sourceAttribution}</p>
          </div>
        </Card>

        <PlacesMap places={[place]} height={220} />

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            aria-label={saved ? t('saved') : t('save')}
            aria-pressed={saved}
            variant={saved ? 'primary' : 'secondary'}
            className="min-w-[140px] flex-1"
          >
            <Heart size={16} fill={saved ? '#0f172a' : 'transparent'} />
            {saved ? t('saved') : t('save')}
          </Button>
          <Button
            onClick={handleShare}
            aria-label={t('share')}
            variant="secondary"
            className="min-w-[140px] flex-1"
          >
            <Share2 size={16} />
            {t('share')}
          </Button>
        </div>
      </Stack>
    </OverlayFrame>
  );
}
