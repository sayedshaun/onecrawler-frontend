import { useState, type ReactNode } from "react";
import { Check, Key, Loader2, LogOut, Save, ShieldCheck, Trash2, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { ApiError } from "@/lib/api";
import {
  changeEmail,
  changePassword,
  getUsage,
  listSessions,
  renameAccount,
  revokeAllSessions,
  revokeSession,
} from "@/lib/account-api";
import { clearApiKey, listApiKeys, setApiKey } from "@/lib/settings-api";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import type { GenAIProvider } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";
import { Field, FieldRow } from "@/components/crawl-form/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVIDER_MODELS } from "@/components/crawl-form/genai-section";

const PROVIDERS: { value: GenAIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "ollama", label: "Ollama" },
];

function ApiKeysCard() {
  const { data, error, refetch } = usePolledResource(() => listApiKeys(), { cacheKey: "settings:api-keys" });
  const defaults = useSettingsStore((s) => s.defaults);
  const setDefaults = useSettingsStore((s) => s.setDefaults);

  const [provider, setProvider] = useState<GenAIProvider>("openai");
  const [apiKey, setApiKeyValue] = useState("");
  const [modelName, setModelName] = useState(PROVIDER_MODELS.openai[0]);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  function statusFor(p: GenAIProvider) {
    return data?.find((k) => k.provider === p) ?? { provider: p, hasKey: false, updatedAt: null };
  }

  const status = statusFor(provider);

  function handleProviderChange(next: GenAIProvider) {
    setProvider(next);
    setApiKeyValue("");
    setModelName(defaults.genai?.provider === next ? defaults.genai.modelName : PROVIDER_MODELS[next][0]);
  }

  async function handleSave() {
    const value = apiKey.trim();
    if (!value) return;
    setSaving(true);
    setRowError(null);
    try {
      await setApiKey(provider, value);
      // Remembers the model alongside the key so New Crawl's GenAI section
      // defaults to it whenever this provider is selected.
      setDefaults({
        genai: {
          schemaFields: [],
          ...defaults.genai,
          provider,
          modelName: modelName.trim() || PROVIDER_MODELS[provider][0],
        },
      });
      setApiKeyValue("");
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Failed to save API key.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    setRowError(null);
    try {
      await clearApiKey(provider);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Failed to clear API key.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider API Keys</CardTitle>
        <CardDescription>
          Stored server-side and used for GenAI-based extraction. Keys are never shown again once saved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {rowError && <p className="text-sm text-destructive">{rowError}</p>}

        <div className="space-y-3 rounded-lg border border-border p-3">
          <FieldRow>
            <Field label="Provider">
              <Select value={provider} onValueChange={(v) => handleProviderChange(v as GenAIProvider)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Model name">
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={PROVIDER_MODELS[provider][0]}
                list="settings-model-suggestions"
                className="font-mono text-xs"
              />
              <datalist id="settings-model-suggestions">
                {PROVIDER_MODELS[provider].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
          </FieldRow>

          <Field label="API key">
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyValue(e.target.value)}
                placeholder="sk-..."
              />
              <Button variant="outline" size="sm" disabled={saving || !apiKey.trim()} onClick={handleSave}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                Save
              </Button>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {status.hasKey ? (
                <Badge variant="success">
                  <Check className="h-3 w-3" /> Set
                </Badge>
              ) : (
                <Badge variant="outline">Not set</Badge>
              )}
              {status.hasKey && status.updatedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(status.updatedAt))}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" disabled={!status.hasKey || clearing} onClick={handleClear}>
              {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingRow({
  label,
  description,
  value,
  first,
  actionLabel = "Change",
  onAction,
}: {
  label: string;
  description: string;
  value: ReactNode;
  first?: boolean;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
        !first && "border-t border-border",
      )}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <p className="truncate text-sm text-muted-foreground sm:max-w-48">{value}</p>
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function AccountCard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function openName() {
    setName(user?.name ?? "");
    setNameError(null);
    setNameOpen(true);
  }

  function openEmail() {
    setEmail(user?.email ?? "");
    setEmailPassword("");
    setEmailError(null);
    setEmailOpen(true);
  }

  function openPassword() {
    setCurrentPassword("");
    setNewPassword("");
    setPasswordError(null);
    setPasswordOpen(true);
  }

  async function handleRename() {
    if (!name.trim() || name.trim() === user?.name) return;
    setSavingName(true);
    setNameError(null);
    try {
      const updated = await renameAccount(name.trim());
      setUser(updated);
      setNameOpen(false);
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangeEmail() {
    if (!email.trim() || !emailPassword) return;
    setSavingEmail(true);
    setEmailError(null);
    try {
      const updated = await changeEmail(email.trim(), emailPassword);
      setUser(updated);
      setEmailOpen(false);
    } catch (err) {
      setEmailError(err instanceof ApiError ? err.message : "Failed to update email.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || newPassword.length < 8) return;
    setSavingPassword(true);
    setPasswordError(null);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordOpen(false);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Manage your profile and security. Email and password changes require your current password.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <SettingRow label="Name" description="Your display name across the app." value={user?.name} first onAction={openName} />

        <SettingRow label="Email" description="Used to sign in and receive notifications." value={user?.email} onAction={openEmail} />

        <SettingRow label="Password" description="Choose a strong, unique password." value="••••••••" onAction={openPassword} />
      </CardContent>

      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change name</DialogTitle>
            <DialogDescription>Your display name across the app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
          </div>
          {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNameOpen(false)} disabled={savingName}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={savingName || !name.trim() || name.trim() === user?.name}>
              {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>Confirm your current password to update your email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-email">New email</Label>
              <Input
                id="account-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="account-email-password">Current password</Label>
              <Input
                id="account-email-password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
              />
            </div>
          </div>
          {emailError && <p className="text-sm text-destructive">{emailError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)} disabled={savingEmail}>
              Cancel
            </Button>
            <Button
              onClick={handleChangeEmail}
              disabled={savingEmail || !email.trim() || !emailPassword || email.trim() === user?.email}
            >
              {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Choose a new password, at least 8 characters.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
          </div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)} disabled={savingPassword}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={savingPassword || !currentPassword || newPassword.length < 8}>
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SessionsCard() {
  const { data: sessions, error, refetch } = usePolledResource(() => listSessions(), {
    cacheKey: "settings:sessions",
  });
  const logout = useAuthStore((s) => s.logout);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    setActionError(null);
    try {
      await revokeSession(sessionId);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to revoke session.");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    setActionError(null);
    try {
      await revokeAllSessions();
      // Revoking every session invalidates this device's refresh token too —
      // clear local auth state rather than leaving a session the server no longer honors.
      await logout();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to revoke sessions.");
      setRevokingAll(false);
    }
  }

  const items = sessions ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Devices and browsers currently signed in.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={revokingAll || items.length === 0}
          onClick={handleRevokeAll}
        >
          {revokingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
          Sign out everywhere
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {actionError && <p className="text-sm text-destructive">{actionError}</p>}

        {items.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        )}

        {items.map((session) => {
          const revoking = revokingId === session.id;
          return (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-foreground">{session.id}</p>
                <p className="text-xs text-muted-foreground">
                  Signed in {formatRelativeTime(new Date(session.createdAt))} · expires{" "}
                  {formatRelativeTime(new Date(session.expiresAt))}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={revoking}
                onClick={() => handleRevoke(session.id)}
              >
                {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Revoke
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function UsageCard() {
  const { data: usage, error } = usePolledResource(() => getUsage(), { cacheKey: "settings:usage" });

  const stats = [
    { label: "Total crawls", value: usage?.totalJobs ?? 0 },
    { label: "Crawls this month", value: usage?.jobsThisMonth ?? 0 },
    { label: "Pages scraped", value: usage?.urlsScraped ?? 0 },
    { label: "Pages scraped this month", value: usage?.urlsScrapedThisMonth ?? 0 },
    { label: "URLs discovered", value: usage?.urlsDiscovered ?? 0 },
    { label: "Failed URLs", value: usage?.urlsFailed ?? 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
        <CardDescription>Your activity across all crawls.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatNumber(s.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AccountCard />
      <UsageCard />
      <SessionsCard />
      <ApiKeysCard />
    </div>
  );
}
