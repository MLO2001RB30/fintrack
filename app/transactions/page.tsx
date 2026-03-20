import { AppShell } from "@/components/app-shell";
import { TransactionsPage } from "@/components/pages/transactions";

type TransactionsRouteProps = {
  searchParams: Promise<{
    review?: string;
    merchant?: string;
    category?: string;
    period?: string;
    account?: string;
    tx?: string;
  }>;
};

export default async function Page({ searchParams }: TransactionsRouteProps) {
  const params = await searchParams;

  return (
    <AppShell>
      <TransactionsPage
        initialReviewMode={params.review ?? null}
        initialReviewMerchant={params.merchant ?? null}
        initialCategory={params.category ?? null}
        initialPeriod={params.period ?? null}
        initialAccount={params.account ?? null}
        initialTransactionId={params.tx ?? null}
      />
    </AppShell>
  );
}
