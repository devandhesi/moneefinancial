// Common company name → ticker mapping for inline linking in Maven chat.
// Keys are lowercased. Order of insertion matters for multi-word matching:
// longer/more-specific names should come first.

const RAW_MAP: Record<string, string> = {
  // Mega-cap tech
  "apple": "AAPL",
  "microsoft": "MSFT",
  "alphabet": "GOOGL",
  "google": "GOOGL",
  "amazon": "AMZN",
  "meta": "META",
  "facebook": "META",
  "nvidia": "NVDA",
  "tesla": "TSLA",
  "netflix": "NFLX",
  "intel": "INTC",
  "amd": "AMD",
  "advanced micro devices": "AMD",
  "broadcom": "AVGO",
  "oracle": "ORCL",
  "salesforce": "CRM",
  "adobe": "ADBE",
  "qualcomm": "QCOM",
  "cisco": "CSCO",
  "ibm": "IBM",
  "palantir": "PLTR",
  "snowflake": "SNOW",
  "shopify": "SHOP",
  "uber": "UBER",
  "lyft": "LYFT",
  "airbnb": "ABNB",
  "spotify": "SPOT",
  "paypal": "PYPL",
  "block": "SQ",
  "square": "SQ",
  "coinbase": "COIN",
  "robinhood": "HOOD",
  "zoom": "ZM",
  "doordash": "DASH",
  "pinterest": "PINS",
  "snap": "SNAP",
  "snapchat": "SNAP",
  "reddit": "RDDT",
  "roblox": "RBLX",
  "unity": "U",
  "twilio": "TWLO",
  "datadog": "DDOG",
  "crowdstrike": "CRWD",
  "cloudflare": "NET",
  "mongodb": "MDB",
  "okta": "OKTA",
  "servicenow": "NOW",
  "workday": "WDAY",
  "atlassian": "TEAM",

  // Autos / EV
  "ford": "F",
  "general motors": "GM",
  "rivian": "RIVN",
  "lucid": "LCID",
  "lucid motors": "LCID",
  "nio": "NIO",
  "xpeng": "XPEV",
  "li auto": "LI",
  "stellantis": "STLA",
  "toyota": "TM",

  // Finance
  "jpmorgan": "JPM",
  "jp morgan": "JPM",
  "jpmorgan chase": "JPM",
  "bank of america": "BAC",
  "wells fargo": "WFC",
  "goldman sachs": "GS",
  "morgan stanley": "MS",
  "citigroup": "C",
  "blackrock": "BLK",
  "berkshire hathaway": "BRK.B",
  "berkshire": "BRK.B",
  "visa": "V",
  "mastercard": "MA",
  "american express": "AXP",
  "schwab": "SCHW",
  "charles schwab": "SCHW",

  // Retail / consumer
  "walmart": "WMT",
  "costco": "COST",
  "target": "TGT",
  "home depot": "HD",
  "lowe's": "LOW",
  "lowes": "LOW",
  "nike": "NKE",
  "starbucks": "SBUX",
  "mcdonald's": "MCD",
  "mcdonalds": "MCD",
  "chipotle": "CMG",
  "coca-cola": "KO",
  "coca cola": "KO",
  "pepsi": "PEP",
  "pepsico": "PEP",
  "procter & gamble": "PG",
  "procter and gamble": "PG",
  "unilever": "UL",
  "disney": "DIS",
  "walt disney": "DIS",

  // Healthcare / pharma
  "johnson & johnson": "JNJ",
  "johnson and johnson": "JNJ",
  "pfizer": "PFE",
  "moderna": "MRNA",
  "merck": "MRK",
  "eli lilly": "LLY",
  "lilly": "LLY",
  "novo nordisk": "NVO",
  "abbvie": "ABBV",
  "unitedhealth": "UNH",
  "cvs": "CVS",

  // Energy
  "exxon": "XOM",
  "exxonmobil": "XOM",
  "exxon mobil": "XOM",
  "chevron": "CVX",
  "shell": "SHEL",
  "bp": "BP",
  "occidental": "OXY",

  // Aerospace / industrial
  "boeing": "BA",
  "lockheed martin": "LMT",
  "raytheon": "RTX",
  "caterpillar": "CAT",
  "ge": "GE",
  "general electric": "GE",
  "3m": "MMM",

  // Telecom / media
  "at&t": "T",
  "verizon": "VZ",
  "t-mobile": "TMUS",
  "comcast": "CMCSA",
  "warner bros discovery": "WBD",

  // ETFs / indices commonly mentioned by name
  "spy": "SPY",
  "s&p 500": "SPY",
  "sp500": "SPY",
  "nasdaq": "QQQ",
  "nasdaq 100": "QQQ",
  "qqq": "QQQ",
  "dow jones": "DIA",

  // Canadian (since SEDI/Canadian features exist)
  "shopify inc": "SHOP",
  "royal bank": "RY",
  "td bank": "TD",
  "toronto-dominion": "TD",
  "enbridge": "ENB",
  "canadian national railway": "CNR.TO",
  "bce": "BCE",
  "bombardier": "BBD.B",
  "barrick gold": "GOLD",
  "suncor": "SU",
};

// Sort keys by length (desc) so multi-word names match before shorter ones.
const SORTED_NAMES = Object.keys(RAW_MAP).sort((a, b) => b.length - a.length);

// Escape regex special chars.
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build a single regex that matches any known company name as a whole word.
// Uses lookarounds so we don't match inside other words (e.g., "tesla" in "teslamotors").
const COMPANY_REGEX = new RegExp(
  `(?<![A-Za-z0-9])(${SORTED_NAMES.map(escapeRegex).join("|")})(?![A-Za-z0-9])`,
  "gi",
);

export function lookupTicker(name: string): string | null {
  return RAW_MAP[name.toLowerCase()] ?? null;
}

export { COMPANY_REGEX };