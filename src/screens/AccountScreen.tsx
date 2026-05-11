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
import { useMotionSafe } from '@/hooks/useMotionSafe';
import { AuthScreen } from '@/screens/AuthScreen';

type DrawerKind = 'logout' | 'logout-all' | 'deactivate' | 'hard-delete' | null;

export function AccountScreen() {
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
      const msg = error instanceof LunerieApiError ? error.message : 'Failed';
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
      toast.success('Account export downloaded');
    } catch (error) {
      const msg = error instanceof LunerieApiError ? error.message : 'Failed';
      toast.error(msg);
    }
  };

  return (
    <ScreenContainer>
      <motion.div {...motionSafe.fadeUp()} className="grid gap-[22px]">
        <ScreenHeader
          eyebrow="Your account"
          title={user.displayName}
          description={user.email}
        />

        <Card icon={<User size={16} />} title="Session">
          <Row
            title="Sign out"
            description="End the session on this device only."
            onClick={() => setDrawer('logout')}
            iconRight={<LogOut size={16} />}
          />
          <Row
            title="Sign out everywhere"
            description="Revoke all refresh tokens for this account."
            onClick={() => setDrawer('logout-all')}
            iconRight={<ShieldOff size={16} />}
          />
        </Card>

        <Card icon={<Download size={16} />} title="Your data">
          <Row
            title="Export account data"
            description="Download a JSON copy of preferences, favorites, recent views/searches, sessions, audit events."
            onClick={exportData}
            iconRight={<Download size={16} />}
          />
          <Row
            title="Deactivate account"
            description="Lock the account; data is preserved and can be restored."
            onClick={() => setDrawer('deactivate')}
            iconRight={<ShieldOff size={16} />}
          />
          <Row
            danger
            title="Permanently delete account"
            description="GDPR Article 17 — irreversible. Requires password + typed confirmation."
            onClick={() => setDrawer('hard-delete')}
            iconRight={<Trash2 size={16} />}
          />
        </Card>
      </motion.div>

      <ConfirmDrawer
        variant="confirm"
        open={drawer === 'logout'}
        title="Sign out?"
        description="You'll need to sign in again to sync your places."
        confirmLabel="Sign out"
        onCancel={close}
        onConfirm={() =>
          wrap(async () => {
            await logout();
            haptic('warning');
            toast.success('Signed out');
          })
        }
      />

      <ConfirmDrawer
        variant="confirm"
        open={drawer === 'logout-all'}
        title="Sign out everywhere?"
        description="Revokes all refresh tokens across every device."
        confirmLabel="Revoke all sessions"
        destructive
        onCancel={close}
        onConfirm={() =>
          wrap(async () => {
            await logoutAll();
            haptic('warning');
            toast.success('All sessions revoked');
          })
        }
      />

      <ConfirmDrawer
        variant="confirm"
        open={drawer === 'deactivate'}
        title="Deactivate this account?"
        description="You can reactivate by signing in again. Data is preserved."
        confirmLabel="Deactivate"
        destructive
        onCancel={close}
        onConfirm={() =>
          wrap(async () => {
            await lunerie.profile.deactivate();
            await logout();
            haptic('warning');
            toast.success('Account deactivated');
          })
        }
      />

      <ConfirmDrawer
        variant="prompt"
        open={drawer === 'hard-delete'}
        title="Permanently delete this account?"
        description="This wipes every record tied to your account and cannot be undone. We require your password + the exact phrase below."
        confirmLabel="Delete forever"
        destructive
        expected="DELETE MY ACCOUNT"
        expectedHint='Type DELETE MY ACCOUNT to confirm'
        passwordLabel="Current password"
        onCancel={close}
        onConfirm={({ password, confirmation }) =>
          wrap(async () => {
            await lunerie.profile.hardDelete(password, confirmation);
            haptic('warning');
            toast.success('Account permanently deleted');
            await logout();
          })
        }
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
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5 text-left ${
        danger
          ? 'border-[rgba(239,68,68,0.45)] bg-[rgba(239,68,68,0.08)] text-[#fca5a5]'
          : 'border-[var(--app-border)] bg-transparent text-[var(--app-text)]'
      }`}
    >
      <span className="grid gap-0.5">
        <strong className="text-sm">{title}</strong>
        {description ? (
          <span
            className={`text-xs ${
              danger ? 'text-[rgba(252,165,165,0.78)]' : 'text-[var(--app-text-muted)]'
            }`}
          >
            {description}
          </span>
        ) : null}
      </span>
      {iconRight ? <span className="text-current">{iconRight}</span> : null}
    </button>
  );
}
