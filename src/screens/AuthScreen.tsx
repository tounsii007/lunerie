import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, LogIn, Mail, Sparkles, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/state/auth-context';
import { useHaptic } from '@/hooks/useHaptic';
import { LunerieApiError } from '@/api/lunerie/lunerieClient';

type Mode = 'login' | 'register';

interface AuthScreenProps {
  onAuthenticated?: () => void;
  onBack?: () => void;
}

interface PasswordCheck {
  label: string;
  passed: boolean;
}

function evaluatePassword(password: string): { strength: number; checks: PasswordCheck[] } {
  const checks: PasswordCheck[] = [
    { label: '12+ characters', passed: password.length >= 12 },
    { label: 'Letter', passed: /[a-zA-Z]/.test(password) },
    { label: 'Number', passed: /\d/.test(password) },
    { label: 'Symbol', passed: /[^a-zA-Z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.passed).length;
  return { strength, checks };
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

  const passwordEvaluation = useMemo(() => evaluatePassword(password), [password]);

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
        minHeight: '100dvh',
        padding: '24px 24px max(24px, env(safe-area-inset-bottom)) 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 24,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-15%',
          width: 320,
          height: 320,
          borderRadius: 999,
          background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          padding: 28,
          borderRadius: 28,
          background: 'var(--app-elevated)',
          border: '1px solid var(--app-border)',
          boxShadow: '0 32px 80px rgba(2, 8, 23, 0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          display: 'grid',
          gap: 18,
          position: 'relative',
        }}
      >
        <header style={{ display: 'grid', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent-light)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={12} />
            Lunerie account
          </span>
          <h1
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 32,
              lineHeight: 1.05,
              letterSpacing: '-0.022em',
              fontWeight: 600,
            }}
          >
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ color: 'var(--app-text-muted)', fontSize: 13, lineHeight: 1.6 }}>
            {mode === 'login'
              ? 'Sign in to sync your favorites and recent views across devices.'
              : 'Sync your discovery feed across devices and back up everything you love.'}
          </p>
        </header>

        {/* Tab switcher with sliding pill */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            padding: 4,
            borderRadius: 14,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
          }}
        >
          {(['login', 'register'] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={active}
                style={{
                  position: 'relative',
                  padding: '11px 12px',
                  borderRadius: 11,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  background: 'transparent',
                  color: active ? '#0f172a' : 'var(--app-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'color 0.22s var(--ease-out)',
                  zIndex: 1,
                }}
              >
                {active ? (
                  <motion.span
                    layoutId="auth-tab-active"
                    transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 11,
                      background: 'var(--accent)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 4px 14px var(--accent-glow)',
                      zIndex: -1,
                    }}
                  />
                ) : null}
                {m === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            );
          })}
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
            {mode === 'register' && password.length > 0 ? (
              <PasswordStrength evaluation={passwordEvaluation} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{passwordHint}</span>
            )}
          </Field>

          <motion.button
            type="submit"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            style={{
              marginTop: 4,
              padding: '15px 18px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 14px 36px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.32)',
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'wait' : 'pointer',
              transition: 'opacity 0.22s var(--ease-out)',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} />
                Working…
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {onBack ? (
          <button
            onClick={onBack}
            style={{
              fontSize: 13,
              color: 'var(--app-text-muted)',
              textAlign: 'center',
              padding: 10,
              borderRadius: 12,
              transition: 'background 0.18s var(--ease-out), color 0.18s var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--app-text)';
              e.currentTarget.style.background = 'var(--app-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--app-text-muted)';
              e.currentTarget.style.background = 'transparent';
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
  padding: '13px 14px',
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

function PasswordStrength({ evaluation }: { evaluation: { strength: number; checks: PasswordCheck[] } }) {
  const colors = ['#ef4444', '#f59e0b', '#facc15', '#84cc16', '#10b981'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const color = colors[evaluation.strength] ?? colors[0];
  const label = labels[evaluation.strength] ?? labels[0];

  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 6 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
        }}
        aria-hidden
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            initial={{ scaleX: 0.4, opacity: 0.4 }}
            animate={{
              scaleX: 1,
              opacity: i < evaluation.strength ? 1 : 0.25,
              backgroundColor: i < evaluation.strength ? color : 'rgba(148, 163, 184, 0.32)',
            }}
            transition={{ duration: 0.22 }}
            style={{
              height: 4,
              borderRadius: 999,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
        }}
      >
        <span style={{ color, fontWeight: 700 }}>{label}</span>
        <span style={{ color: 'var(--app-text-muted)' }}>
          {evaluation.checks.filter((c) => c.passed).length}/4 requirements met
        </span>
      </div>
    </div>
  );
}
