import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';

export function OverlayFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      const focusable = sectionRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (focusable ?? sectionRef.current)?.focus({ preventScroll: true });
    }, 80);

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !sectionRef.current) return;
      const focusables = sectionRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--app-overlay-scrim)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'grid',
          placeItems: 'end center',
          padding: 12,
          zIndex: 60,
        }}
      >
        <motion.section
          ref={sectionRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          onClick={(event) => event.stopPropagation()}
          style={{
            width: 'min(460px, 100%)',
            maxHeight: '94dvh',
            overflowY: 'auto',
            borderRadius: 32,
            background: 'var(--app-elevated)',
            border: '1px solid var(--app-border)',
            paddingBottom: 28,
            color: 'var(--app-text)',
            outline: 'none',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 18,
              background: 'var(--app-elevated)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid var(--app-border)',
            }}
          >
            <div
              aria-hidden
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                background: 'var(--app-border)',
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            <h2 id={titleId} style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label={t('close')}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--app-surface)',
                border: '1px solid var(--app-border)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {t('close')}
            </button>
          </div>
          {children}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
