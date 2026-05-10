import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface BaseProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
}

interface ConfirmProps extends BaseProps {
  variant: 'confirm';
  onConfirm: () => Promise<void> | void;
}

interface PromptProps extends BaseProps {
  variant: 'prompt';
  /** Phrase the user must type. */
  expected: string;
  /** Visible hint about what to type. */
  expectedHint?: string;
  passwordLabel?: string;
  onConfirm: (data: { password: string; confirmation: string }) => Promise<void> | void;
}

type Props = ConfirmProps | PromptProps;

/** Modern, accessible drawer-based confirmation. Replaces window.confirm/prompt. */
export function ConfirmDrawer(props: Props) {
  const { open, onCancel, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive } = props;
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setPassword('');
      setConfirmation('');
      setError(null);
    }
  }, [open]);

  const isPrompt = props.variant === 'prompt';
  const matches = !isPrompt || (isPrompt && confirmation === (props as PromptProps).expected);
  const canSubmit = !busy && matches && (!isPrompt || password.length >= 1);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (props.variant === 'confirm') {
        await props.onConfirm();
      } else {
        await props.onConfirm({ password, confirmation });
      }
    } catch (err) {
      setError((err as Error).message || 'Failed');
      setBusy(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={(value) => !value && onCancel()} dismissible={!busy}>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--app-overlay-scrim)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 80,
          }}
        />
        <Drawer.Content
          style={{
            position: 'fixed',
            insetInline: 0,
            bottom: 0,
            zIndex: 90,
            background: 'var(--app-elevated)',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            border: '1px solid var(--app-border)',
            outline: 'none',
            maxHeight: '88dvh',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: 44, height: 5, borderRadius: 999, background: 'var(--app-border)', margin: '12px auto 0' }} />
          <div style={{ padding: 24, display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: destructive ? 'rgba(239, 68, 68, 0.15)' : 'var(--accent-soft)',
                  color: destructive ? '#fca5a5' : 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} />
              </span>
              <div style={{ display: 'grid', gap: 6 }}>
                <Drawer.Title style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{title}</Drawer.Title>
                {description ? (
                  <Drawer.Description style={{ color: 'var(--app-text-muted)', fontSize: 14, lineHeight: 1.55 }}>
                    {description}
                  </Drawer.Description>
                ) : null}
              </div>
            </div>

            {isPrompt ? (
              <>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--app-text-muted)', fontWeight: 600 }}>
                    {(props as PromptProps).passwordLabel ?? 'Password'}
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={drawerInputStyle}
                    autoFocus
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--app-text-muted)', fontWeight: 600 }}>
                    {(props as PromptProps).expectedHint ?? `Type "${(props as PromptProps).expected}" to confirm`}
                  </span>
                  <input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    spellCheck={false}
                    autoCapitalize="off"
                    style={drawerInputStyle}
                  />
                </label>
              </>
            ) : null}

            {error ? (
              <p style={{ color: '#fca5a5', fontSize: 13, marginTop: -4 }}>{error}</p>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={onCancel}
                disabled={busy}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid var(--app-border)',
                  background: 'var(--app-surface)',
                  color: 'var(--app-text)',
                  fontWeight: 600,
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: destructive
                    ? 'linear-gradient(135deg, #ef4444, #fca5a5)'
                    : 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  color: '#0f172a',
                  fontWeight: 800,
                  opacity: canSubmit ? 1 : 0.5,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmit
                    ? destructive
                      ? '0 12px 30px rgba(239, 68, 68, 0.35)'
                      : '0 12px 30px var(--accent-glow)'
                    : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'box-shadow 0.22s var(--ease-out), opacity 0.22s var(--ease-out)',
                }}
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ animation: 'spin 0.9s linear infinite' }} />
                    Working…
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const drawerInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  color: 'var(--app-text)',
  outline: 'none',
  fontSize: 14,
};
