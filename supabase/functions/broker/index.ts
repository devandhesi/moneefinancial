import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple XOR-based encryption (for token storage)
function encrypt(text: string, key: string): string {
  const encoded = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    result[i] = encoded[i] ^ keyBytes[i % keyBytes.length];
  }
  return btoa(String.fromCharCode(...result));
}

function decrypt(encoded: string, key: string): string {
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return new TextDecoder().decode(result);
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function getUserClient(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

async function getUserId(authHeader: string): Promise<string | null> {
  const supabase = getUserClient(authHeader);
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return data.claims.sub as string;
}

const ENCRYPTION_KEY = Deno.env.get("BROKER_ENCRYPTION_KEY") || "default-key";

// ============ ALPACA CONNECTION ============
async function connectAlpaca(userId: string, apiKey: string, apiSecret: string) {
  // Validate by calling read-only account endpoint
  const res = await fetch("https://paper-api.alpaca.markets/v2/account", {
    headers: {
      "APCA-API-KEY-ID": apiKey,
      "APCA-API-SECRET-KEY": apiSecret,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Alpaca validation failed: ${err}`);
  }

  const account = await res.json();
  const admin = getSupabaseAdmin();

  // Store encrypted keys
  await admin.from("broker_connections").upsert({
    user_id: userId,
    provider: "alpaca",
    status: "connected",
    access_token_encrypted: encrypt(apiKey, ENCRYPTION_KEY),
    refresh_token_encrypted: encrypt(apiSecret, ENCRYPTION_KEY),
    metadata: {
      account_id: account.id,
      account_number: account.account_number,
      status: account.status,
    },
    last_sync_at: new Date().toISOString(),
  }, { onConflict: "user_id,provider" });

  // Store account
  await admin.from("broker_accounts").upsert({
    user_id: userId,
    provider: "alpaca",
    account_id: account.id,
    account_name: `Alpaca ${account.account_number}`,
    account_type: "brokerage",
    currency: account.currency || "USD",
    cash: parseFloat(account.cash) || 0,
    buying_power: parseFloat(account.buying_power) || 0,
    total_value: parseFloat(account.portfolio_value) || 0,
    as_of: new Date().toISOString(),
  }, { onConflict: "user_id,provider,account_id" });

  return { success: true, account_id: account.id };
}

// ============ SYNC ALPACA ============
async function syncAlpaca(userId: string) {
  const admin = getSupabaseAdmin();
  const { data: conn } = await admin
    .from("broker_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "alpaca")
    .eq("status", "connected")
    .single();

  if (!conn) throw new Error("No active Alpaca connection");

  const apiKey = decrypt(conn.access_token_encrypted, ENCRYPTION_KEY);
  const apiSecret = decrypt(conn.refresh_token_encrypted, ENCRYPTION_KEY);
  const headers = {
    "APCA-API-KEY-ID": apiKey,
    "APCA-API-SECRET-KEY": apiSecret,
  };
  const base = "https://paper-api.alpaca.markets/v2";

  // Fetch account, positions, orders in parallel
  const [accountRes, positionsRes, ordersRes] = await Promise.all([
    fetch(`${base}/account`, { headers }),
    fetch(`${base}/positions`, { headers }),
    fetch(`${base}/orders?status=all&limit=50`, { headers }),
  ]);

  if (!accountRes.ok) throw new Error("Failed to fetch Alpaca account");

  const account = await accountRes.json();
  const positions = positionsRes.ok ? await positionsRes.json() : [];
  const orders = ordersRes.ok ? await ordersRes.json() : [];

  // Upsert account
  await admin.from("broker_accounts").upsert({
    user_id: userId,
    provider: "alpaca",
    account_id: account.id,
    account_name: `Alpaca ${account.account_number}`,
    account_type: "brokerage",
    currency: account.currency || "USD",
    cash: parseFloat(account.cash) || 0,
    buying_power: parseFloat(account.buying_power) || 0,
    total_value: parseFloat(account.portfolio_value) || 0,
    as_of: new Date().toISOString(),
  }, { onConflict: "user_id,provider,account_id" });

  // Upsert positions
  for (const pos of positions) {
    await admin.from("broker_positions").upsert({
      user_id: userId,
      provider: "alpaca",
      account_id: account.id,
      symbol: pos.symbol,
      quantity: parseFloat(pos.qty) || 0,
      average_price: parseFloat(pos.avg_entry_price) || null,
      market_price: parseFloat(pos.current_price) || null,
      market_value: parseFloat(pos.market_value) || null,
      unrealized_pl: parseFloat(pos.unrealized_pl) || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider,account_id,symbol" });
  }

  // Upsert orders (dedup by order_id)
  for (const ord of orders) {
    await admin.from("broker_orders").upsert({
      user_id: userId,
      provider: "alpaca",
      account_id: account.id,
      order_id: ord.id,
      symbol: ord.symbol,
      side: ord.side,
      quantity: parseFloat(ord.qty) || 0,
      order_type: ord.type,
      status: ord.status,
      created_at: ord.created_at,
      updated_at: ord.updated_at || new Date().toISOString(),
    }, { onConflict: "user_id,provider,account_id,order_id" });

    // If order has fills
    if (ord.filled_qty && parseFloat(ord.filled_qty) > 0) {
      await admin.from("broker_fills").upsert({
        user_id: userId,
        provider: "alpaca",
        account_id: account.id,
        order_id: ord.id,
        execution_id: `${ord.id}-fill`,
        symbol: ord.symbol,
        side: ord.side,
        quantity: parseFloat(ord.filled_qty) || 0,
        price: parseFloat(ord.filled_avg_price) || 0,
        executed_at: ord.filled_at || ord.updated_at || new Date().toISOString(),
      }, { onConflict: "user_id,provider,account_id,execution_id" });
    }
  }

  // Update last_sync_at
  await admin.from("broker_connections").update({
    last_sync_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("provider", "alpaca");

  return { success: true, positions: positions.length, orders: orders.length };
}

// ============ CSV IMPORT ============
async function importCsv(userId: string, csvData: any[]) {
  const admin = getSupabaseAdmin();

  // Create/update CSV connection
  await admin.from("broker_connections").upsert({
    user_id: userId,
    provider: "csv",
    status: "connected",
    metadata: { imported_count: csvData.length },
    last_sync_at: new Date().toISOString(),
  }, { onConflict: "user_id,provider" });

  // Create a default CSV account
  const accountId = "csv-import";
  await admin.from("broker_accounts").upsert({
    user_id: userId,
    provider: "csv",
    account_id: accountId,
    account_name: "CSV Import",
    account_type: "manual",
    currency: "USD",
    cash: 0,
    total_value: csvData.reduce((sum, row) => sum + (parseFloat(row.market_value) || parseFloat(row.quantity) * parseFloat(row.price) || 0), 0),
    as_of: new Date().toISOString(),
  }, { onConflict: "user_id,provider,account_id" });

  // Import positions
  for (const row of csvData) {
    const symbol = (row.symbol || row.ticker || row.Symbol || row.Ticker || "").toUpperCase().trim();
    if (!symbol) continue;

    await admin.from("broker_positions").upsert({
      user_id: userId,
      provider: "csv",
      account_id: accountId,
      symbol,
      quantity: parseFloat(row.quantity || row.shares || row.Quantity || row.Shares) || 0,
      average_price: parseFloat(row.average_price || row.avg_price || row.cost_basis || row.Price) || null,
      market_price: parseFloat(row.market_price || row.current_price) || null,
      market_value: parseFloat(row.market_value || row.value) || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider,account_id,symbol" });
  }

  return { success: true, imported: csvData.length };
}

// ============ DISCONNECT ============
async function disconnect(userId: string, provider: string) {
  const admin = getSupabaseAdmin();

  await admin.from("broker_connections").update({
    status: "disconnected",
    access_token_encrypted: null,
    refresh_token_encrypted: null,
    token_expires_at: null,
  }).eq("user_id", userId).eq("provider", provider);

  // Clean up data
  await admin.from("broker_positions").delete().eq("user_id", userId).eq("provider", provider);
  await admin.from("broker_orders").delete().eq("user_id", userId).eq("provider", provider);
  await admin.from("broker_fills").delete().eq("user_id", userId).eq("provider", provider);
  await admin.from("broker_accounts").delete().eq("user_id", userId).eq("provider", provider);

  return { success: true };
}

// ============ GET CONNECTIONS ============
async function getConnections(userId: string) {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("broker_connections")
    .select("*")
    .eq("user_id", userId);
  return data || [];
}

// ============ GET PORTFOLIO ============
async function getPortfolio(userId: string) {
  const admin = getSupabaseAdmin();

  const [
    { data: accounts },
    { data: positions },
    { data: orders },
    { data: fills },
  ] = await Promise.all([
    admin.from("broker_accounts").select("*").eq("user_id", userId),
    admin.from("broker_positions").select("*").eq("user_id", userId),
    admin.from("broker_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    admin.from("broker_fills").select("*").eq("user_id", userId).order("executed_at", { ascending: false }).limit(50),
  ]);

  // Aggregate positions by symbol
  const symbolMap = new Map<string, any>();
  for (const pos of (positions || [])) {
    const existing = symbolMap.get(pos.symbol);
    if (existing) {
      existing.quantity += pos.quantity;
      existing.market_value = (existing.market_value || 0) + (pos.market_value || 0);
      existing.unrealized_pl = (existing.unrealized_pl || 0) + (pos.unrealized_pl || 0);
      if (pos.average_price && existing.average_price) {
        existing.average_price = (existing.average_price * existing.prevQty + pos.average_price * pos.quantity) / (existing.prevQty + pos.quantity);
      }
      existing.prevQty += pos.quantity;
      existing.providers.push(pos.provider);
    } else {
      symbolMap.set(pos.symbol, {
        ...pos,
        prevQty: pos.quantity,
        providers: [pos.provider],
      });
    }
  }

  const totalCash = (accounts || []).reduce((sum, a) => sum + (a.cash || 0), 0);
  const totalValue = (accounts || []).reduce((sum, a) => sum + (a.total_value || 0), 0);

  return {
    accounts: accounts || [],
    positions: Array.from(symbolMap.values()).map(({ prevQty, ...rest }) => rest),
    orders: orders || [],
    fills: fills || [],
    summary: { totalCash, totalValue, positionCount: symbolMap.size },
  };
}

// ============ PLAID STUBS ============
async function createPlaidLinkToken(userId: string) {
  const clientId = Deno.env.get("PLAID_CLIENT_ID");
  const secret = Deno.env.get("PLAID_SECRET");
  if (!clientId || !secret) {
    throw new Error("Plaid is not configured. Add PLAID_CLIENT_ID and PLAID_SECRET to enable.");
  }

  const res = await fetch("https://sandbox.plaid.com/link/token/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      secret: secret,
      user: { client_user_id: userId },
      client_name: "Monee",
      products: ["investments"],
      country_codes: ["US", "CA"],
      language: "en",
    }),
  });

  if (!res.ok) throw new Error("Failed to create Plaid link token");
  const data = await res.json();
  return { link_token: data.link_token };
}

async function exchangePlaidToken(userId: string, publicToken: string) {
  const clientId = Deno.env.get("PLAID_CLIENT_ID");
  const secret = Deno.env.get("PLAID_SECRET");
  if (!clientId || !secret) throw new Error("Plaid not configured");

  const res = await fetch("https://sandbox.plaid.com/item/public_token/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, secret, public_token: publicToken }),
  });

  if (!res.ok) throw new Error("Failed to exchange Plaid token");
  const data = await res.json();

  const admin = getSupabaseAdmin();
  await admin.from("broker_connections").upsert({
    user_id: userId,
    provider: "plaid",
    status: "connected",
    access_token_encrypted: encrypt(data.access_token, ENCRYPTION_KEY),
    metadata: { item_id: data.item_id },
    last_sync_at: new Date().toISOString(),
  }, { onConflict: "user_id,provider" });

  return { success: true };
}

// ============ ROUTER ============
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = await getUserId(authHeader);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    let result;

    switch (action) {
      case "get_connections":
        result = await getConnections(userId);
        break;
      case "connect_alpaca":
        if (!body.api_key || !body.api_secret) throw new Error("API key and secret required");
        result = await connectAlpaca(userId, body.api_key, body.api_secret);
        break;
      case "sync":
        if (body.provider === "alpaca") result = await syncAlpaca(userId);
        else throw new Error(`Sync not supported for provider: ${body.provider}`);
        break;
      case "import_csv":
        if (!body.data || !Array.isArray(body.data)) throw new Error("CSV data required");
        result = await importCsv(userId, body.data);
        break;
      case "disconnect":
        if (!body.provider) throw new Error("Provider required");
        result = await disconnect(userId, body.provider);
        break;
      case "get_portfolio":
        result = await getPortfolio(userId);
        break;
      case "plaid_create_link":
        result = await createPlaidLinkToken(userId);
        break;
      case "plaid_exchange":
        if (!body.public_token) throw new Error("Public token required");
        result = await exchangePlaidToken(userId, body.public_token);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Broker function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
