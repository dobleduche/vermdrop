import { supabase } from "./supabase";

function generateCodeFromWallet(wallet: string): string {
  // Simple deterministic short code from wallet
  const base = wallet.replace(/[^a-zA-Z0-9]/g, "");
  const hash = Array.from(base).reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) >>> 0, 5381);
  return (hash.toString(36) + base.slice(0, 4)).toLowerCase();
}

export async function getOrCreateReferral(wallet_address: string) {
  // Try fetch existing
  const existing = await supabase
    .from("vermairdrop_referrals")
    .select("referral_code, total_referred")
    .eq("referrer_wallet_address", wallet_address)
    .single();

  if (existing.data && !existing.error) {
    return existing.data;
  }

  // Create
  const code = generateCodeFromWallet(wallet_address);
  const insert = await supabase
    .from("vermairdrop_referrals")
    .insert([{ referrer_wallet_address: wallet_address, referral_code: code }])
    .select("referral_code, total_referred")
    .single();

  if (insert.error && (insert.error as any).code !== "23505") {
    throw insert.error;
  }

  if (insert.error && (insert.error as any).code === "23505") {
    // Unique violation race; fetch again
    const retry = await supabase
      .from("vermairdrop_referrals")
      .select("referral_code, total_referred")
      .eq("referrer_wallet_address", wallet_address)
      .single();
    if (retry.error) throw retry.error;
    return retry.data!;
  }

  return insert.data!;
}

export async function trackReferralEvent(referral_code: string, referee_wallet_address: string) {
  // Resolve referrer by code
  const ref = await supabase
    .from("vermairdrop_referrals")
    .select("referrer_wallet_address")
    .eq("referral_code", referral_code)
    .single();
  if (ref.error || !ref.data) return { ok: false };

  // Insert event, ignore duplicates
  const ins = await supabase
    .from("vermairdrop_referral_events")
    .insert([{ referral_code, referrer_wallet_address: ref.data.referrer_wallet_address, referee_wallet_address }])
    .select("id")
    .single();

  if (ins.error && (ins.error as any).code !== "23505") {
    return { ok: false };
  }

  // Increment aggregate counter
  await supabase
    .from("vermairdrop_referrals")
    .update({ total_referred: (await getReferralCount(ref.data.referrer_wallet_address)) })
    .eq("referrer_wallet_address", ref.data.referrer_wallet_address);

  return { ok: true };
}

export async function getReferralCount(referrer_wallet_address: string): Promise<number> {
  const cnt = await supabase
    .from("vermairdrop_referral_events")
    .select("id", { count: "exact", head: true })
    .eq("referrer_wallet_address", referrer_wallet_address);
  return cnt.count ?? 0;
}
