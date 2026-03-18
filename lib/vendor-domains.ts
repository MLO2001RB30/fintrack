/**
 * Maps vendor/merchant/institution names to their primary domain.
 *
 * Used by MerchantLogo when a domain isn't directly available on the data model
 * (e.g. transaction merchants). Covers banks, brokers, holdings, subscriptions,
 * and common Danish retail/service merchants.
 *
 * Lookup precedence: explicit `domain` prop > this registry > letter initials.
 */
export const VENDOR_DOMAINS: Record<string, string> = {
  // ── Danish Banks ───────────────────────────────────────────────────────────
  "Danske Bank":             "danskebank.dk",
  "Nordea":                  "nordea.dk",
  "Lunar":                   "lunar.app",
  "Jyske Bank":              "jyskebank.dk",
  "Sydbank":                 "sydbank.dk",
  "Arbejdernes Landsbank":   "al-bank.dk",
  "Spar Nord":               "sparnord.dk",
  "Nykredit":                "nykredit.dk",
  "Sparekassen Danmark":     "sparekassendanmark.dk",
  "BankNordik":              "banknordik.dk",
  "Middelfart Sparekasse":   "msbank.dk",
  "Lån & Spar":              "lsb.dk",

  // ── Investment Brokers ────────────────────────────────────────────────────
  "Nordnet":    "nordnet.dk",
  "Saxo":       "home.saxo",
  "Coinbase":   "coinbase.com",
  "eToro":      "etoro.com",
  "Degiro":     "degiro.dk",
  "Revolut":    "revolut.com",

  // ── Investment Holdings ───────────────────────────────────────────────────
  "Novo Nordisk B":       "novonordisk.com",
  "Novo Nordisk":         "novonordisk.com",
  "Vanguard FTSE All-W":  "vanguard.com",
  "Vanguard":             "vanguard.com",
  "Apple Inc.":           "apple.com",
  "Apple":                "apple.com",
  "Bitcoin":              "bitcoin.org",
  "Ethereum":             "ethereum.org",
  "PFA Pension":          "pfa.dk",
  "PFA":                  "pfa.dk",
  "Ørsted A/S":           "orsted.com",
  "Ørsted":               "orsted.com",
  "Danica Pension":       "danica.dk",
  "Vestas":               "vestas.com",
  "Maersk":               "maersk.com",
  "DSV":                  "dsv.com",
  "Carlsberg":            "carlsberggroup.com",
  "Microsoft":            "microsoft.com",
  "Alphabet":             "abc.xyz",
  "Amazon":               "amazon.com",
  "Tesla":                "tesla.com",
  "NVIDIA":               "nvidia.com",
  "iShares":              "ishares.com",

  // ── Subscriptions ─────────────────────────────────────────────────────────
  "Netflix":         "netflix.com",
  "Spotify":         "spotify.com",
  "Adobe CC":        "adobe.com",
  "Adobe":           "adobe.com",
  "iCloud+":         "apple.com",
  "iCloud":          "apple.com",
  "ChatGPT Plus":    "openai.com",
  "ChatGPT":         "openai.com",
  "OpenAI":          "openai.com",
  "TV 2 Play":       "tv2.dk",
  "TV 2":            "tv2.dk",
  "Dropbox Plus":    "dropbox.com",
  "Dropbox":         "dropbox.com",
  "Disney+":         "disneyplus.com",
  "NordVPN":         "nordvpn.com",
  "Headspace":       "headspace.com",
  "Notion":          "notion.so",
  "GitHub":          "github.com",
  "Duolingo":        "duolingo.com",
  "YouTube Premium": "youtube.com",
  "LinkedIn":        "linkedin.com",
  "Canva":           "canva.com",
  "Figma":           "figma.com",
  "Slack":           "slack.com",
  "Zoom":            "zoom.us",
  "Microsoft 365":   "microsoft.com",
  "Office 365":      "microsoft.com",
  "Xbox Game Pass":  "xbox.com",
  "PlayStation Plus":"playstation.com",
  "Apple TV+":       "apple.com",
  "HBO Max":         "hbomax.com",
  "Paramount+":      "paramountplus.com",
  "Tidal":           "tidal.com",
  "Deezer":          "deezer.com",

  // ── Groceries & Supermarkets ───────────────────────────────────────────────
  "Netto":        "netto.dk",
  "Føtex":        "foetex.dk",
  "Bilka":        "bilka.dk",
  "Rema 1000":    "rema1000.dk",
  "Lidl":         "lidl.dk",
  "Aldi":         "aldi.dk",
  "SuperBrugsen": "coop.dk",
  "Irma":         "irma.dk",
  "Meny":         "meny.dk",
  "Fakta":        "coop.dk",
  "Spar":         "spar.dk",

  // ── Transport ─────────────────────────────────────────────────────────────
  "DSB":         "dsb.dk",
  "Rejsekort":   "rejsekort.dk",
  "Flixbus":     "flixbus.dk",
  "Uber":        "uber.com",
  "Bolt":        "bolt.eu",

  // ── Food & Dining ─────────────────────────────────────────────────────────
  "Just Eat":    "just-eat.dk",
  "Wolt":        "wolt.com",
  "Foodora":     "foodora.dk",

  // ── Fuel ──────────────────────────────────────────────────────────────────
  "Shell":      "shell.dk",
  "Circle K":   "circlek.dk",
  "Q8":         "q8.dk",
  "OK":         "ok.dk",

  // ── Health & Beauty ───────────────────────────────────────────────────────
  "Matas":      "matas.dk",
  "Apoteket":   "apoteket.dk",
  "Fitness World": "fitnessworld.dk",

  // ── Media & Telco ─────────────────────────────────────────────────────────
  "DR":        "dr.dk",
  "TDC":       "tdc.dk",
  "Telenor":   "telenor.dk",
  "Telia":     "telia.dk",
  "3":         "3.dk",

  // ── Shopping & Retail ─────────────────────────────────────────────────────
  "Zalando":   "zalando.dk",
  "H&M":       "hm.com",
  "ZARA":      "zara.com",
  "IKEA":      "ikea.dk",
  "Elgiganten":"elgiganten.dk",
  "Power":     "power.dk",

  // ── Utilities & Payments ──────────────────────────────────────────────────
  "Nets":       "nets.eu",
  "Nets — El":  "nets.eu",
  "MobilePay":  "mobilepay.dk",

  // ── Internal transfers — no logo ──────────────────────────────────────────
  "Lønoverførsel":        "",
  "Overførsel — Spare":   "",
  "Overførsel":           "",
};

/** Returns the domain for a given vendor name, or empty string if unknown. */
export function lookupDomain(name: string): string {
  return VENDOR_DOMAINS[name] ?? "";
}
