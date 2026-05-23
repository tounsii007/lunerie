import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onScroll = () => setShowTop(node.scrollTop > 480);
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <main
        ref={ref}
        style={{
          height: '100dvh',
          width: '100%',
          maxWidth: 490,
          margin: '0 auto',
          padding: '24px 20px 132px',
          overflowY: 'auto',
        }}
        className="scrollbar-hidden"
      >
        {children}
      </main>
      <AnimatePresence>
        {showTop ? (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.85 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            aria-label={t('scrollToTop')}
            style={{
              position: 'fixed',
              insetInlineEnd: 18,
              insetBlockEnd: 110,
              width: 46,
              height: 46,
              borderRadius: 999,
              background: 'var(--app-chip-bg-strong)',
              border: '1px solid var(--accent-soft)',
              color: 'var(--accent-light)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              boxShadow: 'var(--app-chip-shadow)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 35,
            }}
          >
            <ArrowUp size={18} strokeWidth={2.4} />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}
