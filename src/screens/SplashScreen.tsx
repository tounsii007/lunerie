import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

export function SplashScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}
      >
        <motion.div
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            margin: '0 auto 24px',
            width: 124,
            height: 124,
            borderRadius: 36,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light) 60%, #38bdf8)',
            boxShadow: '0 24px 60px var(--accent-glow)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Sparkles size={52} color="#0f172a" />
        </motion.div>
        <p
          style={{
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            marginBottom: 12,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          Global hidden places
        </p>
        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 52,
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          {APP_NAME}
        </h1>
        <p style={{ color: 'rgba(248,250,252,0.84)', lineHeight: 1.6, fontSize: 15 }}>{APP_TAGLINE}</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 32,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: 'var(--accent)',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
