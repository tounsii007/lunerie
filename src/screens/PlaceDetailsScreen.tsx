import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Share2 } from 'lucide-react';
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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    pushRecentView(place);
  }, [place, pushRecentView]);

  const handleSave = () => {
    // Pass the full Place so the favorite captures a snapshot — see
    // FavoritesScreen for why this matters.
    toggleFavorite(place);
    haptic('success');
    toast.success(saved ? t('removedFromFavorites') : t('addedToFavorites'), { duration: 1600 });
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
      <div style={{ position: 'relative' }}>
        <div
          aria-hidden
          className={imageLoaded ? '' : 'skeleton'}
          style={{
            position: 'absolute',
            inset: 0,
            background: imageLoaded ? 'transparent' : 'var(--app-surface)',
            transition: 'background 0.4s var(--ease-out)',
          }}
        />
        <motion.img
          key={place.heroImage.url}
          src={place.heroImage.url}
          alt={place.name}
          loading="eager"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 1.06 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, transparent 38%, rgba(2,6,23,0.72) 96%)',
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
              WebkitBackdropFilter: 'blur(10px)',
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
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
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {place.relevance}% match
          </Pill>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{ padding: 20, display: 'grid', gap: 18 }}
      >
        <div>
          <p
            style={{
              color: 'var(--accent-light)',
              marginBottom: 10,
              fontWeight: 600,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MapPin size={14} />
            {place.city}, {place.countryName}
          </p>
          <p className="text-sm leading-[1.7] text-[var(--app-text-muted)]">{place.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {place.categories.map((category, index) => (
            <motion.span
              key={category}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + 0.04 * index, duration: 0.32 }}
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
            </motion.span>
          ))}
        </div>
        <div
          style={{
            padding: 18,
            borderRadius: 22,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            display: 'grid',
            gap: 12,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: 11,
                color: 'var(--app-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              {t('coordinates')}
            </strong>
            <p style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14, marginTop: 6 }}>
              {place.coordinates.latitude.toFixed(4)}, {place.coordinates.longitude.toFixed(4)}
            </p>
          </div>
          <div
            style={{
              height: 1,
              background: 'var(--app-border)',
              margin: '2px 0',
            }}
            aria-hidden
          />
          <div>
            <strong
              style={{
                fontSize: 11,
                color: 'var(--app-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              {t('sourceLabel')}
            </strong>
            <p style={{ fontSize: 13, marginTop: 6, color: 'var(--app-text)' }}>{place.sourceAttribution}</p>
          </div>
        </Card>

        <PlacesMap places={[place]} height={220} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            aria-label={saved ? t('saved') : t('save')}
            aria-pressed={saved}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '16px 18px',
              borderRadius: 18,
              background: saved
                ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                : 'var(--accent-soft)',
              color: saved ? '#0f172a' : 'var(--accent-light)',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: '1px solid var(--accent)',
              boxShadow: saved ? '0 12px 28px var(--accent-glow)' : 'none',
              transition: 'background 0.22s var(--ease-out), box-shadow 0.22s var(--ease-out), color 0.22s var(--ease-out)',
            }}
          >
            <motion.span
              animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.36 }}
              style={{ display: 'inline-flex' }}
            >
              <Heart size={16} fill={saved ? '#0f172a' : 'transparent'} />
            </motion.span>
            {saved ? t('saved') : t('save')}
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
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
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Share2 size={16} />
            {t('share')}
          </motion.button>
        </div>
      </motion.div>
    </OverlayFrame>
  );
}
