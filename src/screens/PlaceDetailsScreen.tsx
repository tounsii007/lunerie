import { useEffect } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { OverlayFrame } from '@/components/AppShell';
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
    toggleFavorite(place.id);
    haptic('success');
    toast.success(saved ? 'Removed from favorites' : 'Added to favorites', { duration: 1600 });
  };

  const handleShare = async () => {
    haptic('light');
    const result = await shareContent({ title: place.name, text: place.description, url: window.location.href });
    if (result === 'copied') {
      toast.success(t('shareCopied'));
    } else if (result === 'unsupported') {
      toast.error(t('shareUnavailable'));
    }
  };

  return (
    <OverlayFrame title={place.name} onClose={closeOverlay}>
      <div style={{ position: 'relative' }}>
        <img
          src={place.heroImage.url}
          alt={place.name}
          loading="eager"
          decoding="async"
          style={{ width: '100%', height: 280, objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 50%, rgba(2,6,23,0.7))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            right: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            gap: 12,
          }}
        >
          <span
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(10px)',
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {place.popularity}% hot
          </span>
          <span
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-soft)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--accent-light)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {place.relevance}% match
          </span>
        </div>
      </div>
      <div style={{ padding: 20, display: 'grid', gap: 18 }}>
        <div>
          <p style={{ color: 'var(--accent-light)', marginBottom: 10, fontWeight: 600, fontSize: 14 }}>
            {place.city}, {place.countryName}
          </p>
          <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.7, fontSize: 14 }}>{place.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {place.categories.map((category) => (
            <span
              key={category}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-soft)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent-light)',
                textTransform: 'capitalize',
              }}
            >
              {category.replace('_', ' ')}
            </span>
          ))}
        </div>
        <div
          style={{
            padding: 18,
            borderRadius: 22,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            display: 'grid',
            gap: 10,
          }}
        >
          <div>
            <strong style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>{t('coordinates')}</strong>
            <p style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14, marginTop: 4 }}>
              {place.coordinates.latitude.toFixed(4)}, {place.coordinates.longitude.toFixed(4)}
            </p>
          </div>
          <div>
            <strong style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>{t('sourceLabel')}</strong>
            <p style={{ fontSize: 13, marginTop: 4, color: 'var(--app-text)' }}>{place.sourceAttribution}</p>
          </div>
        </div>
        <PlacesMap places={[place]} height={220} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            aria-label={saved ? t('saved') : t('save')}
            aria-pressed={saved}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '16px 18px',
              borderRadius: 18,
              background: saved ? 'var(--accent)' : 'var(--accent-soft)',
              color: saved ? '#0f172a' : 'var(--accent-light)',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: '1px solid var(--accent)',
              transition: 'all 0.18s ease',
            }}
          >
            <Heart size={16} fill={saved ? '#0f172a' : 'transparent'} />
            {saved ? t('saved') : t('save')}
          </button>
          <button
            onClick={handleShare}
            aria-label={t('share')}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '16px 18px',
              borderRadius: 18,
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              color: 'var(--app-text)',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Share2 size={16} />
            {t('share')}
          </button>
        </div>
      </div>
    </OverlayFrame>
  );
}
