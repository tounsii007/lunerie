import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { tokens } from '@/theme/tokens';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: 32,
        borderRadius: tokens.radius.lg,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        textAlign: 'center',
        boxShadow: tokens.shadow.card,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 22,
          margin: '0 auto 16px',
          background:
            'radial-gradient(circle at 30% 30%, var(--accent-soft), transparent 70%), var(--accent-soft)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--accent)',
          boxShadow: '0 8px 22px var(--accent-glow)',
        }}
      >
        <Map size={26} />
      </div>
      <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700, letterSpacing: '-0.012em' }}>{title}</h3>
      <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.6, fontSize: 14 }}>{body}</p>
    </motion.div>
  );
}
