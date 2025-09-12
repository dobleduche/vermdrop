import { RequestHandler } from "express";
import { z } from "zod";
import { getOrCreateReferral, trackReferralEvent } from "../lib/referrals";

export const getReferralInfo: RequestHandler = async (req, res) => {
  try {
    const wallet = req.params.wallet as string;
    if (!wallet) return res.status(400).json({ success: false, error: "Wallet is required" });

    const info = await getOrCreateReferral(wallet);
    return res.json({ success: true, info });
  } catch (e) {
    console.error("getReferralInfo error", e);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const TrackSchema = z.object({
  referral_code: z.string().min(4),
  referee_wallet_address: z.string().min(32)
});

export const trackReferral: RequestHandler = async (req, res) => {
  try {
    const data = TrackSchema.parse(req.body);
    const result = await trackReferralEvent(data.referral_code, data.referee_wallet_address);
    if (!result.ok) return res.status(400).json({ success: false, error: "Failed to track referral" });
    return res.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation failed", details: e.errors });
    }
    console.error("trackReferral error", e);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
