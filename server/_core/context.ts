import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClient } from "@supabase/supabase-js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function getBearerToken(req: CreateExpressContextOptions["req"]) {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

async function authenticateSupabase(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  const token = getBearerToken(req);
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role, active")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError || !profile?.active) return null;

  return {
    id: 1,
    openId: profile.id,
    name: profile.display_name ?? authData.user.email ?? null,
    email: authData.user.email ?? null,
    loginMethod: "supabase",
    role: profile.role === "superadmin" || profile.role === "admin" ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } as User;
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await authenticateSupabase(opts.req);
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
