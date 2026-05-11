import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Download, LogOut, ShieldOff, Trash2, User } from 'lucide-react';
import { ScreenContainer } from '@/components/AppShell';
import { ConfirmDrawer } from '@/components/ConfirmDrawer';
import { ScreenHeader } from '@/components/primitives';
import { useAuth } from '@/state/auth-context';
import lunerie, { LunerieApiError } from '@/api/lunerie/lunerieClient';
import { useHaptic } from '@/hooks/useHaptic';
import { useI18n } from '@/i18n/I18nProvider';
import { AuthScreen } from '@/screens/AuthScreen';

type DrawerKind = 'logout' | 'logout-all' | 'deactivate' | 'hard-delete' | null;

export function AccountScreen() {
  const { t } = useI18n();
  const { user, logout, logoutAll } = useAuth();
  const haptic = useHaptic();
  const motionSafe = useMotionSafe();
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState<DrawerKind>(null);

  if (!user) {
    return <AuthScreen />;
  }

  const close = () => {
    if (busy) return;
    setDrawer(null);
  };

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      setDrawer(null);
    } catch (error) {
      const msg = error instanceof LunerieApiError ? error.message : t('errors.somethingWentWrong');
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await lunerie.profile.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lunerie-account-export.json';
      a.click();
      URL.revokeObjectURL(url);
      haptic('success');
      toast.success(t('account.exportDownloaded'));
    } catch (error) {
      const msg = error instanceof LunerieApiError ? error.message : t('errors.somethingWentWrong');
      toast.error(msg);
    }
  };

  return (
    <ScreenContainer>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'grid', gap: 22 }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            aria-hidden
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              color: '#0f172a',
              fontSize: 26,
              fontWeight: 800,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 14px 32px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.32)',
              flexShrink: 0,
              letterSpacing: '-0.02em',
              fontFamily: '"Fraunces", serif',
            }}
          >
            {user.displayName.trim().slice(0, 1).toUpperCase() || '·'}
          </div>
          <div style={{ display: 'grid', gap: 4, minWidth: 0 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--accent-light)',
                fontWeight: 700,
              }}
            >
              {t('account.title')}
            </span>
            <h1
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 30,
                lineHeight: 1.05,
                letterSpacing: '-0.022em',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.displayName}
            </h1>
            <p
              style={{
                color: 'var(--app-text-muted)',
                fontSize: 13,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
            </p>
          </div>
        </header>

        <Card icon={<User size={16} />} title={t('account.session')}>
          <Row title={t('auth.signOut')} description={t('account.signOutDescription')} onClick={() => setDrawer('logout')} iconRight={<LogOut size={16} />} />
          <Row title={t('auth.signOutEverywhere')} description={t('account.signOutEverywhereDescription')} onClick={() => setDrawer('logout-all')} iconRight={<ShieldOff size={16} />} />
        </Card>

        <Card icon={<Download size={16} />} title={t('account.yourData')}>
          <Row title={t('account.exportTitle')} description={t('account.exportBody')} onClick={exportData} iconRight={<Download size={16} />} />
          <Row title={t('account.deactivateTitle')} description={t('account.deactivateBody')} onClick={() => setDrawer('deactivate')} iconRight={<ShieldOff size={16} />} />
          <Row danger title={t('account.deleteTitle')} description={t('account.deleteBody')} onClick={() => setDrawer('hard-delete')} iconRight={<Trash2 size={16} />} />
        </Card>
      </motion.div>

      <ConfirmDrawer
        variant="confirm"
        open={drawer === 'logout'}
        title={t('account.signOutConfirmTitle')}
        description={t('account.signOutConfirmBody')}
        confirmLabel={t('auth.signOut')}
        cancelLabel={t('cancel')}
        onCancel={close}
        onConfirm={() => wrap(async () => { await logout(); haptic('warning'); toast.success(t('auth.signedOut')); })}
      />

      <ConfirmDrawer
        variant="confirm"
        open={drawer === 'logout-all'}
        title={t('account.signOutAllConfirmTitle')}
        description={t('account.signOutAllConfirmBody')}
        confirmLabel={t('account.revokeCta')}
        cancelLabel={t('cancel')}
        destructive
        onCancel={close}
        onConfirm={() => wrap(async () => { await logoutAll(); haptic('warning'); toast.success(t('auth.allSessionsRevoked')); })}
      />

      <ConfirmDrawer
        variant="confirm"
        open={drawer === 'deactivate'}
        title={t('account.deactivateConfirmTitle')}
        description={t('account.deactivateConfirmBody')}
        confirmLabel={t('account.deactivateTitle')}
        cancelLabel={t('cancel')}
        destructive
        onCancel={close}
        onConfirm={() => wrap(async () => { await lunerie.profile.deactivate(); await logout(); haptic('warning'); toast.success(t('account.deactivated')); })}
      />

      <ConfirmDrawer
        variant="prompt"
        open={drawer === 'hard-delete'}
        title={t('account.deleteConfirmTitle')}
        description={t('account.deleteConfirmBody')}
        confirmLabel={t('account.deleteCta')}
        cancelLabel={t('cancel')}
        destructive
        expected="DELETE MY ACCOUNT"
        expectedHint={t('account.deleteTypeHint')}
        passwordLabel={t('auth.currentPassword')}
        onCancel={close}
        onConfirm={({ password, confirmation }) => wrap(async () => {
          await lunerie.profile.hardDelete(password, confirmation);
          haptic('warning');
          toast.success(t('account.deleted'));
          await logout();
        })}
      />
    </ScreenContainer>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[18px] backdrop-blur-xl">
      <header className="flex items-center gap-2">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          {icon}
        </span>
        <h2 className="text-base font-bold">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Row({
  title,
  description,
  iconRight,
  onClick,
  danger,
}: {
  title: string;
  description?: string;
  iconRight?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 26, stiffness: 360 }}
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 14,
        border: danger ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid var(--app-border)',
        background: danger
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))'
          : 'transparent',
        color: danger ? '#fca5a5' : 'var(--app-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        width: '100%',
        transition: 'background 0.22s var(--ease-out)',
      }}
    >
      <span className="grid gap-0.5">
        <strong className="text-sm">{title}</strong>
        {description ? (
          <span
            style={{
              fontSize: 12,
              color: danger ? 'rgba(252,165,165,0.82)' : 'var(--app-text-muted)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </span>
        ) : null}
      </span>
      {iconRight ? <span style={{ color: 'inherit', flexShrink: 0 }}>{iconRight}</span> : null}
    </motion.button>
  );
}
