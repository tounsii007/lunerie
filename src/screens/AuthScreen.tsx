import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/state/auth-context';
import { useHaptic } from '@/hooks/useHaptic';
import { LunerieApiError } from '@/api/lunerie/lunerieClient';

type Mode = 'login' | 'register';

interface AuthScreenProps {
  onAuthenticated?: () => void;
  onBack?: () => void;
}

export function AuthScreen({ onAuthenticated, onBack }: AuthScreenProps) {
  const { login, register } = useAuth();
  const haptic = useHaptic();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        toast.success(`Welcome back, ${email.split('@')[0]}`);
      } else {
        await register(email.trim(), password, displayName.trim() || email.split('@')[0]);
        toast.success('Account created');
      }
      haptic('success');
      onAuthenticated?.();
    } catch (error) {
      haptic('warning');
      if (error instanceof LunerieApiError) {
        if (error.violations?.length) {
          toast.error(error.violations.map((v) => `${v.field}: ${v.message}`).join('\n'));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordHint =
    mode === 'register'
      ? 'At least 12 characters with letters, digits and a symbol.'
      : 'Use the password you registered with.';

  return (
    <div
      style={{
        // Use min-height with safe-area inset; scroll vertical when content exceeds viewport
        minHeight: '100dvh',
        padding: '24px 24px max(24px, env(safe-area-inset-bottom)) 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 24,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          padding: 28,
          borderRadius: 28,
          background: 'var(--app-elevated)',
          border: '1px solid var(--app-border)',
          boxShadow: '0 32px 80px rgba(2, 8, 23, 0.45)',
          display: 'grid',
          gap: 18,
        }}
      >
        <header style={{ display: 'grid', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent-light)',
              fontWeight: 700,
            }}
          >
            Lunerie account
          </span>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ color: 'var(--app-text-muted)', fontSize: 13, lineHeight: 1.55 }}>
            {mode === 'login'
              ? 'Sign in to sync your favorites and recent views across devices.'
              : 'Sync your discovery feed across devices and back up everything you love.'}
          </p>
        </header>

        {/* Tab switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            padding: 4,
            borderRadius: 14,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
          }}
        >
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              style={{
                padding: '10px 12px',
                borderRadius: 11,
                fontSize: 13,
                fontWeight: mode === m ? 700 : 500,
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#0f172a' : 'var(--app-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.18s ease',
              }}
            >
              {m === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          {mode === 'register' ? (
            <Field label="Display name" icon={<UserPlus size={16} />}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Aisha"
                autoComplete="name"
                style={inputStyle}
              />
            </Field>
          ) : null}

          <Field label="Email" icon={<Mail size={16} />}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Password" icon={<Lock size={16} />}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'min. 12 characters' : '••••••••'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={mode === 'register' ? 12 : 1}
                style={{ ...inputStyle, paddingRight: 8 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  padding: 8,
                  borderRadius: 9,
                  color: 'var(--app-text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{passwordHint}</span>
          </Field>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            style={{
              marginTop: 4,
              padding: '14px 18px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 12px 32px var(--accent-glow)',
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!submitting ? <ArrowRight size={16} /> : null}
          </motion.button>
        </form>

        {onBack ? (
          <button
            onClick={onBack}
            style={{
              fontSize: 13,
              color: 'var(--app-text-muted)',
              textAlign: 'center',
              padding: 8,
            }}
          >
            Continue without an account
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  color: 'var(--app-text)',
  outline: 'none',
  fontSize: 14,
};

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          color: 'var(--app-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 600,
        }}
      >
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
