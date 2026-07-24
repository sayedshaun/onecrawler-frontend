import { Settings2 } from "lucide-react";

import { AccountCard } from "@/components/settings/account-card";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { UsageCard } from "@/components/settings/usage-card";
import { SessionsCard } from "@/components/settings/sessions-card";
import { ApiKeysCard } from "@/components/settings/api-keys-card";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={Settings2}
        title="Settings"
        description="Manage your account, API keys, and agent configuration."
      />
      <AccountCard />
      <AppearanceCard />
      <UsageCard />
      <SessionsCard />
      <ApiKeysCard />
    </div>
  );
}
