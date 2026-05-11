import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/state/auth-context';
import { useHaptic } from '@/hooks/useHaptic';
import { useMotionSafe } from '@/hooks/useMotionSafe';
import { LunerieApiError } from '@/api/lunerie/lunerieClient';

type Mode = 'login' | 'register';

interface AuthScreenProps {
  onAuthenticated?: () => void;
  onBack?: () => void;
}

export function AuthScreen({ onAuthenticated, onBack }: AuthScreenProps) {
  const { login, register } = useAuth();
  const haptic = useHaptic();
  const motionSafe = useMotionSafe();
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
      className="flex min-h-[100dvh] flex-col justify-center gap-6 overflow-y-auto p-6 [-webkit-overflow-scrolling:touch]"
      style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        {...motionSafe.fadeUp(16, 0.35)}
        className="mx-auto grid w-full max-w-[420px] gap-[18px] rounded-[28px] border border-[var(--app-border)] bg-[var(--app-elevated)] p-7 shadow-[0_32px_80px_rgba(2,8,23,0.45)]"
      >
        <header className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-light)]">
            Lunerie account
          </span>
          <h1 className="font-display text-[30px] leading-[1.05] tracking-[-0.02em]">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-[13px] leading-[1.55] text-[var(--app-text-muted)]">
            {mode === 'login'
              ? 'Sign in to sync your favorites and recent views across devices.'
              : 'Sync your discovery feed across devices and back up everything you love.'}
          </p>
        </header>

        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="Auth mode"
          className="grid grid-cols-2 gap-1 rounded-[14px] border border-[var(--app-border)] bg-[var(--app-surface)] p-1"
        >
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              onClick={() => setMode(m)}
              aria-selected={mode === m}
              className={`flex items-center justify-center gap-1.5 rounded-[11px] px-3 py-2.5 text-[13px] transition ${
                mode === m
                  ? 'bg-[var(--accent)] font-bold text-[#0f172a]'
                  : 'bg-transparent font-medium text-[var(--app-text)]'
              }`}
            >
              {m === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="grid gap-3.5">
          {mode === 'register' ? (
            <Field label="Display name" icon={<UserPlus size={16} />}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Aisha"
                autoComplete="name"
                className={inputClasses}
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
              className={inputClasses}
            />
          </Field>

          <Field label="Password" icon={<Lock size={16} />}>
            <div className="flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'min. 12 characters' : '••••••••'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={mode === 'register' ? 12 : 1}
                className={`${inputClasses} pr-2`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="rounded-[9px] p-2 text-[var(--app-text-muted)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span className="text-[11px] text-[var(--app-text-muted)]">{passwordHint}</span>
          </Field>

          <motion.button
            type="submit"
            whileTap={motionSafe.reduce ? undefined : { scale: 0.98 }}
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-2xl px-[18px] py-3.5 text-[15px] font-extrabold text-[#0f172a] shadow-[0_12px_32px_var(--accent-glow)] disabled:cursor-wait disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            }}
          >
            {submitting ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!submitting ? <ArrowRight size={16} /> : null}
          </motion.button>
        </form>

        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 text-center text-[13px] text-[var(--app-text-muted)]"
          >
            Continue without an account
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

const inputClasses =
  'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-3 text-sm text-[var(--app-text)] outline-none';

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
    <label className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)]">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
