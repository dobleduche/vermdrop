import { RequestHandler } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase";

// Validation schemas
const RegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  twitter: z
    .string()
    .regex(/^@?[A-Za-z0-9_]{1,32}$/, "Invalid Twitter handle")
    .optional(),
  telegram: z
    .string()
    .regex(/^@?[A-Za-z0-9_]{1,32}$/, "Invalid Telegram handle")
    .optional(),
  wallet_address: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid wallet address"),
  referred_by_code: z
    .string()
    .regex(/^[a-z0-9]{4,64}$/i, "Invalid referral code")
    .optional(),
});

const VerificationSchema = z.object({
  wallet_address: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid wallet address"),
  twitter_followed: z.boolean().optional(),
  telegram_joined: z.boolean().optional(),
  tweet_verified: z.boolean().optional(),
  tweet_url: z
    .string()
    .url()
    .refine(
      (v) => /https?:\/\/(x\.com|twitter\.com)\//i.test(v),
      "Tweet URL must be from Twitter/X",
    )
    .optional(),
  friends_invited: z.number().min(0).max(10).optional(),
});

// Types
export interface Registration {
  id: number;
  timestamp: string;
  email: string;
  twitter?: string;
  telegram?: string;
  wallet_address: string;
  is_verm_holder: boolean;
  verm_balance: number;
  bonus_eligible: boolean;
  social_verified: boolean;
}

// Create or return conflict if wallet already registered
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const data = RegistrationSchema.parse(req.body);

    // Normalize inputs
    const normalizedEmail = data.email.trim().toLowerCase();

    // Preflight duplicate checks
    const { data: existingWallet } = await supabase
      .from("vermairdrop_registrations")
      .select("*")
      .eq("wallet_address", data.wallet_address)
      .single();
    if (existingWallet) {
      return res.status(409).json({ success: false, error: "Wallet address already registered", registration: existingWallet });
    }
    const { data: existingEmail } = await supabase
      .from("vermairdrop_registrations")
      .select("*")
      .ilike("email", normalizedEmail)
      .maybeSingle?.() ?? { data: null } as any;
    if (existingEmail) {
      return res.status(409).json({ success: false, error: "Email already registered", registration: existingEmail });
    }

    // Try insert
    const { data: inserted, error: insertError } = await supabase
      .from("vermairdrop_registrations")
      .insert([
        {
          email: normalizedEmail,
          twitter: data.twitter
            ? data.twitter.replace(/^@/, "").toLowerCase()
            : null,
          telegram: data.telegram
            ? data.telegram.replace(/^@/, "").toLowerCase()
            : null,
          wallet_address: data.wallet_address,
        },
      ])
      .select()
      .single();

    if (insertError) {
      // If duplicate wallet, return existing registration
      if (
        // PostgREST unique_violation
        (insertError as any)?.code === "23505" ||
        /duplicate key/i.test((insertError as any)?.message || "")
      ) {
        // Determine conflict field
        const { data: existingByWallet } = await supabase
          .from("vermairdrop_registrations")
          .select("*")
          .eq("wallet_address", data.wallet_address)
          .single();
        if (existingByWallet) {
          return res.status(409).json({
            success: false,
            error: "Wallet address already registered",
            registration: existingByWallet,
          });
        }
        const { data: existingByEmail } = await supabase
          .from("vermairdrop_registrations")
          .select("*")
          .ilike("email", normalizedEmail)
          .maybeSingle?.() ?? { data: null } as any;
        return res.status(409).json({
          success: false,
          error: existingByEmail ? "Email already registered" : "Already registered",
          registration: existingByEmail ?? undefined,
        });
      }

      throw insertError;
    }

    // Ensure this user has a referral code
    try {
      const { getOrCreateReferral, trackReferralEvent } = await import(
        "../lib/referrals"
      );
      await getOrCreateReferral(inserted.wallet_address);

      // If referred_by_code provided, track referral
      const referred_by_code = (req.body as any).referred_by_code as
        | string
        | undefined;
      if (referred_by_code) {
        await trackReferralEvent(referred_by_code, inserted.wallet_address);
      }
    } catch (e) {
      console.warn("Referral setup failed (non-fatal)", e);
    }

    return res.status(201).json({ success: true, registration: inserted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getRegistration: RequestHandler = async (req, res) => {
  try {
    const WalletParam = z.object({
      wallet_address: z
        .string()
        .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid wallet address"),
    });
    const parsed = WalletParam.safeParse(req.params);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid wallet address" });
    }
    const { wallet_address } = parsed.data;

    const { data: registration, error } = await supabase
      .from("vermairdrop_registrations")
      .select("*")
      .eq("wallet_address", wallet_address)
      .single();

    if (error) {
      if ((error as any).code === "PGRST116") {
        return res
          .status(404)
          .json({ success: false, error: "Registration not found" });
      }
      throw error;
    }

    return res.json({ success: true, registration });
  } catch (error) {
    console.error("Get registration error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const updateVerification: RequestHandler = async (req, res) => {
  try {
    const data = VerificationSchema.parse(req.body);

    // Get current registration (must exist to persist)
    const { data: currentReg, error: fetchError } = await supabase
      .from("vermairdrop_registrations")
      .select("*")
      .eq("wallet_address", data.wallet_address)
      .single();

    if (fetchError || !currentReg) {
      return res
        .status(404)
        .json({ success: false, error: "Registration not found" });
    }

    // Compute overall verification without relying on non-existent columns
    const hasAllFlags =
      data.twitter_followed === true &&
      data.telegram_joined === true &&
      data.tweet_verified === true &&
      (data.friends_invited ?? 0) >= 1;

    const social_verified = Boolean(currentReg.social_verified) || hasAllFlags;
    const bonus_eligible = Boolean(
      social_verified && currentReg.is_verm_holder,
    );

    const { data: updatedReg, error: updateError } = await supabase
      .from("vermairdrop_registrations")
      .update({ social_verified, bonus_eligible })
      .eq("wallet_address", data.wallet_address)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({ success: true, registration: updatedReg });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    console.error("Verification update error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getRegistrationStats: RequestHandler = async (_req, res) => {
  try {
    const totalQuery = await supabase
      .from("vermairdrop_registrations")
      .select("id", { count: "exact", head: true });

    const verifiedQuery = await supabase
      .from("vermairdrop_registrations")
      .select("id", { count: "exact", head: true })
      .eq("social_verified", true);

    const holdersQuery = await supabase
      .from("vermairdrop_registrations")
      .select("id", { count: "exact", head: true })
      .eq("is_verm_holder", true);

    const bonusQuery = await supabase
      .from("vermairdrop_registrations")
      .select("id", { count: "exact", head: true })
      .eq("bonus_eligible", true);

    const stats = {
      total_registrations: totalQuery.count ?? 0,
      verified_users: verifiedQuery.count ?? 0,
      verm_holders: holdersQuery.count ?? 0,
      bonus_eligible: bonusQuery.count ?? 0,
    };

    return res.json({ success: true, stats });
  } catch (error) {
    console.error("Stats error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
