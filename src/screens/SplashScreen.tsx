import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

export function SplashScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Atmospheric ambient orbs */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-15%',
          width: 380,
          height: 380,
          borderRadius: 999,
          background:
            'radial-gradient(circle, var(--accent-glow), transparent 65%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
        }}
      />
      <motion.span
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.85, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        style={{
          position: 'absolute',
          bottom: '-25%',
          right: '-20%',
          width: 460,
          height: 460,
          borderRadius: 999,
          background:
            'radial-gradient(circle, rgba(56,189,248,0.32), transparent 65%)',
          filter: 'blur(32px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420, textAlign: 'center', position: 'relative' }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 8, 0, -8, 0], y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            margin: '0 auto 28px',
            width: 132,
            height: 132,
            borderRadius: 40,
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-light) 55%, #38bdf8)',
            boxShadow:
              '0 28px 70px var(--accent-glow), 0 0 0 1px rgba(255,255,255,0.18) inset, 0 1px 0 rgba(255,255,255,0.32) inset',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
          }}
        >
          {/* highlight sheen */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 6,
              left: 10,
              right: 10,
              height: 38,
              borderRadius: 32,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.36), rgba(255,255,255,0))',
              pointerEvents: 'none',
            }}
          />
          <Sparkles size={54} color="#0f172a" strokeWidth={2.4} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          style={{
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            marginBottom: 12,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          Global hidden places
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.55 }}
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 56,
            marginBottom: 14,
            letterSpacing: '-0.022em',
            fontWeight: 600,
            background:
              'linear-gradient(180deg, var(--app-text) 0%, rgba(248,250,252,0.78) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {APP_NAME}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.5 }}
          style={{
            color: 'rgba(248,250,252,0.84)',
            lineHeight: 1.62,
            fontSize: 15,
          }}
        >
          {APP_TAGLINE}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            marginTop: 36,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
          }}
          role="status"
          aria-label="Loading"
        >
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.18 }}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: 'var(--accent)',
                boxShadow: '0 0 12px var(--accent-glow)',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
