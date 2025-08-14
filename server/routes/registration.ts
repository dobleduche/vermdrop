import { RequestHandler } from "express";
import { z } from "zod";

// Validation schemas
const RegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  wallet_address: z.string().min(32, "Invalid wallet address"),
});

const VerificationSchema = z.object({
  wallet_address: z.string().min(32, "Invalid wallet address"),
  twitter_followed: z.boolean().optional(),
  telegram_joined: z.boolean().optional(),
  tweet_verified: z.boolean().optional(),
  tweet_url: z.string().url().optional(),
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
  twitter_followed: boolean;
  telegram_joined: boolean;
  tweet_verified: boolean;
  friends_invited: number;
}

import { supabase } from '../lib/supabase';

// Real database integration with Supabase

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const data = RegistrationSchema.parse(req.body);

    // Check if wallet already registered in Supabase
    const { data: existingUser, error: checkError } = await supabase
      .from('vermairdrop_registrations')
      .select('*')
      .eq('wallet_address', data.wallet_address)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw checkError;
    }

    if (existingUser) {
      return res.status(409).json({
        error: "Wallet address already registered",
        registration: existingUser
      });
    }

    // Create new registration in Supabase
    const newRegistration = {
      email: data.email,
      twitter: data.twitter,
      telegram: data.telegram,
      wallet_address: data.wallet_address,
      is_verm_holder: false,
      verm_balance: 0,
      bonus_eligible: false,
      social_verified: false,
      twitter_followed: false,
      telegram_joined: false,
      tweet_verified: false,
      friends_invited: 0,
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('vermairdrop_registrations')
      .insert([newRegistration])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({
      success: true,
      registration: insertedData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const getRegistration: RequestHandler = async (req, res) => {
  try {
    const { wallet_address } = req.params;

    if (!wallet_address) {
      return res.status(400).json({
        error: "Wallet address is required"
      });
    }

    const { data: registration, error } = await supabase
      .from('vermairdrop_registrations')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: "Registration not found"
        });
      }
      throw error;
    }

    res.json({
      success: true,
      registration
    });
  } catch (error) {
    console.error("Get registration error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const updateVerification: RequestHandler = async (req, res) => {
  try {
    const data = VerificationSchema.parse(req.body);

    // Build update object
    const updateData: any = {};

    if (data.twitter_followed !== undefined) {
      updateData.twitter_followed = data.twitter_followed;
    }

    if (data.telegram_joined !== undefined) {
      updateData.telegram_joined = data.telegram_joined;
    }

    if (data.tweet_verified !== undefined) {
      updateData.tweet_verified = data.tweet_verified;
    }

    if (data.tweet_url !== undefined) {
      updateData.tweet_url = data.tweet_url;
    }

    if (data.friends_invited !== undefined) {
      updateData.friends_invited = data.friends_invited;
    }

    // First get current registration
    const { data: currentReg, error: fetchError } = await supabase
      .from('vermairdrop_registrations')
      .select('*')
      .eq('wallet_address', data.wallet_address)
      .single();

    if (fetchError) {
      return res.status(404).json({
        error: "Registration not found"
      });
    }

    // Calculate overall verification status
    const merged = { ...currentReg, ...updateData };
    updateData.social_verified =
      merged.twitter_followed &&
      merged.telegram_joined &&
      merged.tweet_verified &&
      merged.friends_invited >= 1;

    // Update bonus eligibility
    updateData.bonus_eligible = updateData.social_verified && merged.is_verm_holder;

    // Update in Supabase
    const { data: updatedReg, error: updateError } = await supabase
      .from('vermairdrop_registrations')
      .update(updateData)
      .eq('wallet_address', data.wallet_address)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      registration: updatedReg
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }

    console.error("Verification update error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const getRegistrationStats: RequestHandler = async (req, res) => {
  try {
    const stats = {
      total_registrations: registrations.length,
      verified_users: registrations.filter(reg => reg.social_verified).length,
      verm_holders: registrations.filter(reg => reg.is_verm_holder).length,
      bonus_eligible: registrations.filter(reg => reg.bonus_eligible).length,
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};
