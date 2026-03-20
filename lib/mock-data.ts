// ─── Currency Formatting ─────────────────────────────────────────────────────

export function formatDKK(amountInOere: number, compact = false): string {
  const amount = amountInOere / 100;
  if (compact && Math.abs(amount) >= 1_000) {
    // Use k/M suffixes — universally understood, no "t kr." ambiguity
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1).replace(".", ",")} M kr.`;
    }
    return `${Math.round(amount / 1_000)} k kr.`;
  }
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Clean axis labels for Recharts Y-axis: 700k, 1,2M etc. */
export function formatAxisDKK(amountInOere: number): string {
  const amount = amountInOere / 100;
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return `${Math.round(amount)}`;
}

export function formatChange(amountInOere: number): string {
  const amount = amountInOere / 100;
  const sign = amount >= 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)} kr.`;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  institution: string;
  institutionColor: string;
  domain: string;   // for logo lookup
  accountName: string;
  accountType: "checking" | "savings" | "credit";
  iban: string;
  balanceOere: number;
  lastSynced: string;
  status: "active" | "expired" | "error";
}

export const ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    institution: "Danske Bank",
    institutionColor: "#003755",
    domain: "danskebank.dk",
    accountName: "Lønkonto",
    accountType: "checking",
    iban: "DK50 0040 0440 1162 43",
    balanceOere: 4_832_500,   // 48.325 kr
    lastSynced: "2 min. ago",
    status: "active",
  },
  {
    id: "acc-2",
    institution: "Danske Bank",
    institutionColor: "#003755",
    domain: "danskebank.dk",
    accountName: "Opsparing",
    accountType: "savings",
    iban: "DK50 0040 0441 9843 12",
    balanceOere: 12_450_000,  // 124.500 kr
    lastSynced: "2 min. ago",
    status: "active",
  },
  {
    id: "acc-3",
    institution: "Nordea",
    institutionColor: "#0000A0",
    domain: "nordea.dk",
    accountName: "Flex-konto",
    accountType: "checking",
    iban: "DK93 2000 1234 5678 90",
    balanceOere: 1_287_300,   // 12.873 kr
    lastSynced: "14 min. ago",
    status: "active",
  },
  {
    id: "acc-4",
    institution: "Lunar",
    institutionColor: "#7B61FF",
    domain: "lunar.app",
    accountName: "Everyday",
    accountType: "checking",
    iban: "DK20 9100 4567 3421 08",
    balanceOere: 634_200,     // 6.342 kr
    lastSynced: "Expired",
    status: "expired",
  },
];

// ─── Subscriptions ────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  merchant: string;
  domain: string;   // for logo lookup
  category: string;
  amountOere: number;
  cadence: "monthly" | "quarterly" | "yearly";
  nextExpected: string;
  status: "active" | "paused" | "cancelled";
  confidence: number;
  cancelUrl?: string;
  accountId: string;
}

export const SUBSCRIPTIONS: Subscription[] = [
  { id: "sub-1",  merchant: "Netflix",      domain: "netflix.com",     category: "Streaming", amountOere: 14900,  cadence: "monthly",  nextExpected: "2026-04-07", status: "active",    confidence: 0.98, cancelUrl: "https://netflix.com/cancel",  accountId: "acc-1" },
  { id: "sub-2",  merchant: "Spotify",      domain: "spotify.com",     category: "Music",     amountOere: 9900,   cadence: "monthly",  nextExpected: "2026-04-12", status: "active",    confidence: 0.97, cancelUrl: "https://spotify.com/account", accountId: "acc-1" },
  { id: "sub-3",  merchant: "Adobe CC",     domain: "adobe.com",       category: "Software",  amountOere: 72900,  cadence: "monthly",  nextExpected: "2026-04-01", status: "active",    confidence: 0.96, accountId: "acc-1" },
  { id: "sub-4",  merchant: "iCloud+",      domain: "apple.com",       category: "Storage",   amountOere: 1500,   cadence: "monthly",  nextExpected: "2026-04-18", status: "active",    confidence: 0.95, accountId: "acc-3" },
  { id: "sub-5",  merchant: "ChatGPT Plus", domain: "openai.com",      category: "AI",        amountOere: 13500,  cadence: "monthly",  nextExpected: "2026-04-22", status: "active",    confidence: 0.93, accountId: "acc-1" },
  { id: "sub-6",  merchant: "TV 2 Play",    domain: "tv2.dk",          category: "Streaming", amountOere: 14900,  cadence: "monthly",  nextExpected: "2026-04-03", status: "active",    confidence: 0.91, accountId: "acc-3" },
  { id: "sub-7",  merchant: "Dropbox Plus", domain: "dropbox.com",     category: "Storage",   amountOere: 115200, cadence: "yearly",   nextExpected: "2026-11-15", status: "active",    confidence: 0.90, accountId: "acc-1" },
  { id: "sub-8",  merchant: "Disney+",      domain: "disneyplus.com",  category: "Streaming", amountOere: 7900,   cadence: "monthly",  nextExpected: "2026-04-09", status: "paused",    confidence: 0.94, cancelUrl: "https://disneyplus.com", accountId: "acc-3" },
  { id: "sub-9",  merchant: "NordVPN",      domain: "nordvpn.com",     category: "Security",  amountOere: 35900,  cadence: "yearly",   nextExpected: "2027-01-10", status: "active",    confidence: 0.88, accountId: "acc-1" },
  { id: "sub-10", merchant: "Headspace",    domain: "headspace.com",   category: "Wellness",  amountOere: 49900,  cadence: "yearly",   nextExpected: "2026-09-04", status: "cancelled", confidence: 0.85, accountId: "acc-1" },
];

export function monthlyEquivalent(sub: Subscription): number {
  if (sub.cadence === "monthly") return sub.amountOere;
  if (sub.cadence === "quarterly") return Math.round(sub.amountOere / 3);
  return Math.round(sub.amountOere / 12);
}

export const MONTHLY_BURN = SUBSCRIPTIONS
  .filter(s => s.status === "active")
  .reduce((sum, s) => sum + monthlyEquivalent(s), 0);

// ─── Cash Flow Planning ───────────────────────────────────────────────────────

export const MOCK_TODAY = "2026-03-19";

export interface CashFlowEvent {
  id: string;
  label: string;
  merchant: string;
  amountOere: number;
  date: string;
  type: "income" | "bill" | "subscription";
  category: string;
  accountId: string;
  essential?: boolean;
}

export const UPCOMING_FIXED_EXPENSES: CashFlowEvent[] = [
  {
    id: "bill-rent",
    label: "Housing",
    merchant: "Rent",
    amountOere: -12_500_00,
    date: "2026-03-29",
    type: "bill",
    category: "Housing",
    accountId: "acc-1",
    essential: true,
  },
  {
    id: "bill-electricity",
    label: "Utilities",
    merchant: "EWII Energi",
    amountOere: -1_450_00,
    date: "2026-03-24",
    type: "bill",
    category: "Utilities",
    accountId: "acc-1",
    essential: true,
  },
  {
    id: "bill-mobile",
    label: "Phone",
    merchant: "Telmore",
    amountOere: -199_00,
    date: "2026-03-21",
    type: "bill",
    category: "Phone",
    accountId: "acc-1",
    essential: true,
  },
  {
    id: "bill-internet",
    label: "Internet",
    merchant: "Hiper",
    amountOere: -329_00,
    date: "2026-03-26",
    type: "bill",
    category: "Internet",
    accountId: "acc-1",
    essential: true,
  },
  {
    id: "bill-insurance",
    label: "Insurance",
    merchant: "Tryg",
    amountOere: -1_095_00,
    date: "2026-04-02",
    type: "bill",
    category: "Insurance",
    accountId: "acc-1",
    essential: true,
  },
];

export const UPCOMING_INCOME: CashFlowEvent[] = [
  {
    id: "income-salary",
    label: "Salary",
    merchant: "Primary employer",
    amountOere: 42_000_00,
    date: "2026-03-31",
    type: "income",
    category: "Income",
    accountId: "acc-1",
  },
  {
    id: "income-freelance",
    label: "Freelance",
    merchant: "Product design client",
    amountOere: 6_500_00,
    date: "2026-04-04",
    type: "income",
    category: "Income",
    accountId: "acc-1",
  },
];

export const UPCOMING_SUBSCRIPTION_EVENTS: CashFlowEvent[] = SUBSCRIPTIONS
  .filter((sub) => sub.status === "active")
  .map((sub) => ({
    id: `subscription-${sub.id}`,
    label: sub.category,
    merchant: sub.merchant,
    amountOere: -sub.amountOere,
    date: sub.nextExpected,
    type: "subscription" as const,
    category: sub.category,
    accountId: sub.accountId,
    essential: false,
  }));

export const UPCOMING_CASHFLOW: CashFlowEvent[] = [
  ...UPCOMING_INCOME,
  ...UPCOMING_FIXED_EXPENSES,
  ...UPCOMING_SUBSCRIPTION_EVENTS,
].sort((a, b) => {
  if (a.date === b.date) return b.amountOere - a.amountOere;
  return a.date.localeCompare(b.date);
});

export function getDaysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
}

export function getUpcomingCashFlow(days: number, fromIso = MOCK_TODAY): CashFlowEvent[] {
  return UPCOMING_CASHFLOW.filter((event) => {
    const diff = getDaysBetween(fromIso, event.date);
    return diff >= 0 && diff <= days;
  });
}

export function getCheckingBalanceTotal(): number {
  return ACCOUNTS.filter((account) => account.status === "active" && account.accountType === "checking")
    .reduce((sum, account) => sum + account.balanceOere, 0);
}

export interface CashFlowForecastPoint {
  date: string;
  balanceOere: number;
  deltaOere: number;
}

export function buildCashFlowForecast(days = 30, startingBalanceOere = getCheckingBalanceTotal()): CashFlowForecastPoint[] {
  const start = new Date(MOCK_TODAY);
  const points: CashFlowForecastPoint[] = [];
  let balanceOere = startingBalanceOere;

  for (let offset = 0; offset <= days; offset += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + offset);
    const date = current.toISOString().slice(0, 10);

    const deltaOere = UPCOMING_CASHFLOW
      .filter((event) => event.date === date)
      .reduce((sum, event) => sum + event.amountOere, 0);

    balanceOere += deltaOere;

    points.push({
      date,
      balanceOere,
      deltaOere,
    });
  }

  return points;
}

// ─── Planning ────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  category: string;
  monthlyLimitOere: number;
  essential?: boolean;
}

export const BUDGETS: Budget[] = [
  { id: "budget-groceries", category: "Groceries", monthlyLimitOere: 450_000, essential: true },
  { id: "budget-transport", category: "Transport", monthlyLimitOere: 180_000, essential: true },
  { id: "budget-food", category: "Food", monthlyLimitOere: 220_000 },
  { id: "budget-shopping", category: "Shopping", monthlyLimitOere: 250_000 },
  { id: "budget-entertainment", category: "Entertainment", monthlyLimitOere: 160_000 },
  { id: "budget-utilities", category: "Utilities", monthlyLimitOere: 220_000, essential: true },
  { id: "budget-health", category: "Health", monthlyLimitOere: 150_000, essential: true },
  { id: "budget-subscriptions", category: "Subscriptions", monthlyLimitOere: 180_000 },
];

export interface Goal {
  id: string;
  name: string;
  targetOere: number;
  currentOere: number;
  monthlyContributionOere: number;
  targetDate: string;
  theme: "cash" | "safety" | "investing";
}

export const GOALS: Goal[] = [
  {
    id: "goal-emergency-fund",
    name: "Emergency fund",
    targetOere: 150_000_00,
    currentOere: 83_000_00,
    monthlyContributionOere: 6_000_00,
    targetDate: "2027-02-01",
    theme: "safety",
  },
  {
    id: "goal-summer-trip",
    name: "Summer trip",
    targetOere: 24_000_00,
    currentOere: 9_500_00,
    monthlyContributionOere: 2_500_00,
    targetDate: "2026-07-01",
    theme: "cash",
  },
  {
    id: "goal-invest-more",
    name: "Annual investing target",
    targetOere: 60_000_00,
    currentOere: 18_000_00,
    monthlyContributionOere: 4_000_00,
    targetDate: "2026-12-31",
    theme: "investing",
  },
];

// ─── Review queues ───────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  title: string;
  description: string;
  type: "subscription" | "transaction" | "account" | "merchant";
  severity: "high" | "medium" | "low";
  href: string;
  cta: string;
  merchant?: string;
  accountId?: string;
}

export const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "review-lunar",
    title: "Reconnect the Lunar connection",
    description: "The connection has expired, so forecasts and recent transactions are less trustworthy.",
    type: "account",
    severity: "high",
    href: "/accounts?focus=reconnect&account=acc-4",
    cta: "Reconnect",
    accountId: "acc-4",
  },
  {
    id: "review-adobe",
    title: "Review Adobe CC",
    description: "Adobe CC is your most expensive recurring charge and should have an explicit decision behind it.",
    type: "subscription",
    severity: "high",
    href: "/subscriptions",
    cta: "Open",
    merchant: "Adobe CC",
  },
  {
    id: "review-disney",
    title: "Decide on Disney+",
    description: "Confirm whether it should remain a paused recurring cost or be removed entirely.",
    type: "subscription",
    severity: "medium",
    href: "/subscriptions",
    cta: "Review",
    merchant: "Disney+",
  },
  {
    id: "review-zalando",
    title: "Inspect the larger Zalando purchase",
    description: "It is the largest non-recurring purchase this month and a good place to confirm the categorization.",
    type: "transaction",
    severity: "medium",
    href: "/transactions?review=merchant&merchant=Zalando",
    cta: "Inspect",
    merchant: "Zalando",
  },
  {
    id: "review-transfer",
    title: "Confirm internal transfers",
    description: "Transfers into savings should be hidden from the spending view once they are confirmed as internal.",
    type: "merchant",
    severity: "low",
    href: "/transactions?review=transfer",
    cta: "Check",
  },
];

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  accountId: string;
  amountOere: number;
  category: string;
  isSubscription: boolean;
  subscriptionId?: string;
}

export const TRANSACTIONS: Transaction[] = [
  { id: "tx-33", date: "2026-03-19", merchant: "Irma",               accountId: "acc-1", amountOere: -42300,   category: "Groceries",    isSubscription: false },
  { id: "tx-34", date: "2026-03-19", merchant: "Rejsekort",          accountId: "acc-1", amountOere: -2400,    category: "Transport",    isSubscription: false },
  { id: "tx-35", date: "2026-03-19", merchant: "Espresso House",     accountId: "acc-3", amountOere: -5200,    category: "Food",         isSubscription: false },
  { id: "tx-36", date: "2026-03-18", merchant: "Føtex",              accountId: "acc-1", amountOere: -51200,   category: "Groceries",    isSubscription: false },
  { id: "tx-37", date: "2026-03-18", merchant: "Apoteket",           accountId: "acc-1", amountOere: -18900,   category: "Health",       isSubscription: false },
  { id: "tx-38", date: "2026-03-18", merchant: "Circle K",           accountId: "acc-3", amountOere: -36800,   category: "Transport",    isSubscription: false },
  { id: "tx-1",  date: "2026-03-17", merchant: "Netflix",            accountId: "acc-1", amountOere: -14900,   category: "Streaming",    isSubscription: true,  subscriptionId: "sub-1" },
  { id: "tx-2",  date: "2026-03-17", merchant: "Netto",              accountId: "acc-1", amountOere: -34200,   category: "Groceries",    isSubscription: false },
  { id: "tx-3",  date: "2026-03-16", merchant: "Lønoverførsel",      accountId: "acc-1", amountOere: 4_200_000, category: "Income",      isSubscription: false },
  { id: "tx-4",  date: "2026-03-15", merchant: "DSB",                accountId: "acc-1", amountOere: -9600,    category: "Transport",    isSubscription: false },
  { id: "tx-5",  date: "2026-03-14", merchant: "Spotify",            accountId: "acc-1", amountOere: -9900,    category: "Music",        isSubscription: true,  subscriptionId: "sub-2" },
  { id: "tx-6",  date: "2026-03-14", merchant: "Føtex",              accountId: "acc-1", amountOere: -28700,   category: "Groceries",    isSubscription: false },
  { id: "tx-7",  date: "2026-03-13", merchant: "Adobe CC",           accountId: "acc-1", amountOere: -72900,   category: "Software",     isSubscription: true,  subscriptionId: "sub-3" },
  { id: "tx-8",  date: "2026-03-13", merchant: "Just Eat",           accountId: "acc-1", amountOere: -18900,   category: "Food",         isSubscription: false },
  { id: "tx-9",  date: "2026-03-12", merchant: "TV 2 Play",          accountId: "acc-3", amountOere: -14900,   category: "Streaming",    isSubscription: true,  subscriptionId: "sub-6" },
  { id: "tx-10", date: "2026-03-12", merchant: "Shell",              accountId: "acc-3", amountOere: -54300,   category: "Transport",    isSubscription: false },
  { id: "tx-11", date: "2026-03-11", merchant: "Overførsel — Spare", accountId: "acc-2", amountOere: 200_000,  category: "Transfer",     isSubscription: false },
  { id: "tx-12", date: "2026-03-10", merchant: "iCloud+",            accountId: "acc-3", amountOere: -1500,    category: "Storage",      isSubscription: true,  subscriptionId: "sub-4" },
  { id: "tx-13", date: "2026-03-10", merchant: "Matas",              accountId: "acc-1", amountOere: -12400,   category: "Health",       isSubscription: false },
  { id: "tx-14", date: "2026-03-09", merchant: "ChatGPT Plus",       accountId: "acc-1", amountOere: -13500,   category: "AI",           isSubscription: true,  subscriptionId: "sub-5" },
  { id: "tx-15", date: "2026-03-08", merchant: "Bilka",              accountId: "acc-1", amountOere: -46200,   category: "Groceries",    isSubscription: false },
  { id: "tx-16", date: "2026-03-07", merchant: "DR",                 accountId: "acc-3", amountOere: -26700,   category: "Entertainment",isSubscription: false },
  { id: "tx-17", date: "2026-03-06", merchant: "Rema 1000",          accountId: "acc-1", amountOere: -19800,   category: "Groceries",    isSubscription: false },
  { id: "tx-18", date: "2026-03-05", merchant: "Fitness World",      accountId: "acc-3", amountOere: -24900,   category: "Health",       isSubscription: false },
  { id: "tx-19", date: "2026-03-04", merchant: "Zalando",            accountId: "acc-1", amountOere: -89900,   category: "Shopping",     isSubscription: false },
  { id: "tx-20", date: "2026-03-03", merchant: "Nets — El",          accountId: "acc-1", amountOere: -53200,   category: "Utilities",    isSubscription: false },
  { id: "tx-21", date: "2026-02-27", merchant: "Lønoverførsel",      accountId: "acc-1", amountOere: 4_150_000, category: "Income",      isSubscription: false },
  { id: "tx-22", date: "2026-02-26", merchant: "Netto",              accountId: "acc-1", amountOere: -31500,   category: "Groceries",    isSubscription: false },
  { id: "tx-23", date: "2026-02-24", merchant: "Føtex",              accountId: "acc-1", amountOere: -22600,   category: "Groceries",    isSubscription: false },
  { id: "tx-24", date: "2026-02-23", merchant: "Adobe CC",           accountId: "acc-1", amountOere: -72900,   category: "Software",     isSubscription: true,  subscriptionId: "sub-3" },
  { id: "tx-25", date: "2026-02-21", merchant: "Shell",              accountId: "acc-3", amountOere: -40100,   category: "Transport",    isSubscription: false },
  { id: "tx-26", date: "2026-02-20", merchant: "Spotify",            accountId: "acc-1", amountOere: -9900,    category: "Music",        isSubscription: true,  subscriptionId: "sub-2" },
  { id: "tx-27", date: "2026-02-18", merchant: "Nets — El",          accountId: "acc-1", amountOere: -48100,   category: "Utilities",    isSubscription: false },
  { id: "tx-28", date: "2026-02-16", merchant: "Zalando",            accountId: "acc-1", amountOere: -75600,   category: "Shopping",     isSubscription: false },
  { id: "tx-29", date: "2026-02-14", merchant: "Just Eat",           accountId: "acc-1", amountOere: -14300,   category: "Food",         isSubscription: false },
  { id: "tx-30", date: "2026-02-12", merchant: "TV 2 Play",          accountId: "acc-3", amountOere: -14900,   category: "Streaming",    isSubscription: true,  subscriptionId: "sub-6" },
  { id: "tx-31", date: "2026-02-10", merchant: "Matas",              accountId: "acc-1", amountOere: -10700,   category: "Health",       isSubscription: false },
  { id: "tx-32", date: "2026-02-08", merchant: "ChatGPT Plus",       accountId: "acc-1", amountOere: -13500,   category: "AI",           isSubscription: true,  subscriptionId: "sub-5" },
];

// ─── Investments ──────────────────────────────────────────────────────────────
//
// All prices stored in minor units of their native currency:
//   DKK → øre  (1 DKK = 100 øre)
//   EUR → euro-cents
//   USD → US cents
//
// toBaseDKK() converts any of these to DKK-øre for display.
//
// Exchange rates (fixed for mock data):
export const EUR_DKK = 7.46;
export const USD_DKK = 6.88;

export function toBaseDKKOere(amountMinor: number, currency: string): number {
  if (currency === "DKK") return amountMinor;
  if (currency === "EUR") return amountMinor * EUR_DKK;
  if (currency === "USD") return amountMinor * USD_DKK;
  return amountMinor;
}

export interface Holding {
  id: string;
  name: string;
  ticker: string;
  isin: string;
  domain: string;   // for logo lookup
  assetClass: "stock" | "etf" | "crypto" | "pension" | "bond";
  quantity: number;
  avgCostMinor: number;       // price per unit in native minor units
  currentPriceMinor: number;  // price per unit in native minor units
  currency: string;
  broker: string;
  priceUpdated: string;
}

export const HOLDINGS: Holding[] = [
  //                                                                                               avgCost  currentPrice  (all per unit, in minor units of currency)
  { id: "h-1", name: "Novo Nordisk B",      ticker: "NOVO B",  isin: "DK0060534915", domain: "novonordisk.com", assetClass: "stock",   quantity: 15,    avgCostMinor: 73_500,     currentPriceMinor: 62_400,     currency: "DKK", broker: "Nordnet",  priceUpdated: "Today"  },
  { id: "h-2", name: "Vanguard FTSE All-W", ticker: "VWCE.DE", isin: "IE00BK5BQT80", domain: "vanguard.com",    assetClass: "etf",     quantity: 42,    avgCostMinor: 10_250,     currentPriceMinor: 12_840,     currency: "EUR", broker: "Nordnet",  priceUpdated: "Today"  },
  { id: "h-3", name: "Apple Inc.",          ticker: "AAPL",    isin: "US0378331005", domain: "apple.com",       assetClass: "stock",   quantity: 12,    avgCostMinor: 17_800,     currentPriceMinor: 22_300,     currency: "USD", broker: "Saxo",     priceUpdated: "Today"  },
  { id: "h-4", name: "Bitcoin",             ticker: "BTC",     isin: "",             domain: "bitcoin.org",     assetClass: "crypto",  quantity: 0.184, avgCostMinor: 3_850_000,  currentPriceMinor: 7_120_000,  currency: "USD", broker: "Coinbase", priceUpdated: "Live"   },
  { id: "h-5", name: "PFA Pension",         ticker: "PFA",     isin: "",             domain: "pfa.dk",          assetClass: "pension", quantity: 1,     avgCostMinor: 0,          currentPriceMinor: 31_245_000, currency: "DKK", broker: "PFA",      priceUpdated: "Manual" },
  { id: "h-6", name: "Ørsted A/S",          ticker: "ORSTED",  isin: "DK0060094928", domain: "orsted.com",      assetClass: "stock",   quantity: 30,    avgCostMinor: 43_200,     currentPriceMinor: 28_100,     currency: "DKK", broker: "Nordnet",  priceUpdated: "Today"  },
];

// ─── Net Worth History ─────────────────────────────────────────────────────────
//
// All values in DKK-øre. Starting points match the sum of ACCOUNTS + HOLDINGS + CASH.
//   bank        ≈ 19,204,000 øre  = 192,040 kr
//   investments ≈ 47,500,000 øre  = 475,000 kr   (sum of HOLDINGS at current prices)
//   cash        ≈    527,400 øre  =   5,274 kr

export interface NetWorthPoint {
  date: string;
  total: number;
  bank: number;
  investments: number;
  cash: number;
}

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function generateNetWorthHistory(): NetWorthPoint[] {
  const rng = seededRandom(42);
  const data: NetWorthPoint[] = [];
  const today = new Date("2026-03-19");

  let bank = 19_200_000;
  let inv  = 47_500_000;
  let cash =    527_400;

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    bank += (rng() - 0.45) * 300_000;
    inv  += (rng() - 0.42) * 900_000;
    cash += (rng() - 0.5)  *  20_000;

    bank = Math.max(bank, 12_000_000);
    inv  = Math.max(inv,  30_000_000);
    cash = Math.max(cash,    200_000);

    data.push({
      date: dateStr,
      bank: Math.round(bank),
      investments: Math.round(inv),
      cash: Math.round(cash),
      total: Math.round(bank + inv + cash),
    });
  }
  return data;
}

export const NET_WORTH_HISTORY = generateNetWorthHistory();

export const NET_WORTH_NOW     = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1];
export const NET_WORTH_90D_AGO = NET_WORTH_HISTORY[0];
export const NET_WORTH_CHANGE  = NET_WORTH_NOW.total - NET_WORTH_90D_AGO.total;
export const NET_WORTH_PCT     = (NET_WORTH_CHANGE / NET_WORTH_90D_AGO.total) * 100;

// ─── Cash Holdings ────────────────────────────────────────────────────────────

export const CASH_HOLDINGS = [
  { id: "c-1", label: "Kontanter (pung)",   amountOere:  80_000 },  // 800 kr
  { id: "c-2", label: "Spareskabet hjemme", amountOere: 250_000 },  // 2.500 kr
  { id: "c-3", label: "Rejsekasse (EUR)",   amountOere: 197_400 },  // ~1.974 kr
];

export const TOTAL_CASH = CASH_HOLDINGS.reduce((s, c) => s + c.amountOere, 0);
