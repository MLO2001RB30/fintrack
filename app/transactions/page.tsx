import { AppShell } from "@/components/app-shell";
import { TransactionsPage } from "@/components/pages/transactions";

type TransactionsRouteProps = {
  searchParams: Promise<{
    review?: string;
    merchant?: string;
  }>;
};

export default async function Page({ searchParams }: TransactionsRouteProps) {
  const params = await searchParams;

  return (
    <AppShell>
      <TransactionsPage
        initialReviewMode={params.review ?? null}
        initialReviewMerchant={params.merchant ?? null}
      />
    </AppShell>
  );
}
