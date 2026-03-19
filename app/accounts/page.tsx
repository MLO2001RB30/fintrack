import { AppShell } from "@/components/app-shell";
import { AccountsPage } from "@/components/pages/accounts";

type AccountsRouteProps = {
  searchParams: Promise<{
    focus?: string;
    account?: string;
  }>;
};

export default async function Page({ searchParams }: AccountsRouteProps) {
  const params = await searchParams;
  const initialReconnectId = params.focus === "reconnect" ? params.account ?? null : null;

  return (
    <AppShell>
      <AccountsPage initialReconnectId={initialReconnectId} />
    </AppShell>
  );
}
