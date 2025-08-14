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

// Mock database - In production, use PostgreSQL
let registrations: Registration[] = [];
let nextId = 1;

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const data = RegistrationSchema.parse(req.body);
    
    // Check if wallet already registered
    const existingRegistration = registrations.find(
      reg => reg.wallet_address === data.wallet_address
    );
    
    if (existingRegistration) {
      return res.status(409).json({
        error: "Wallet address already registered",
        registration: existingRegistration
      });
    }
    
    // Create new registration
    const newRegistration: Registration = {
      id: nextId++,
      timestamp: new Date().toISOString(),
      email: data.email,
      twitter: data.twitter,
      telegram: data.telegram,
      wallet_address: data.wallet_address,
      is_verm_holder: false, // Will be checked via blockchain
      verm_balance: 0,
      bonus_eligible: false,
      social_verified: false,
      twitter_followed: false,
      telegram_joined: false,
      tweet_verified: false,
      friends_invited: 0,
    };
    
    registrations.push(newRegistration);
    
    res.status(201).json({
      success: true,
      registration: newRegistration
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
    
    const registration = registrations.find(
      reg => reg.wallet_address === wallet_address
    );
    
    if (!registration) {
      return res.status(404).json({
        error: "Registration not found"
      });
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
    
    const registrationIndex = registrations.findIndex(
      reg => reg.wallet_address === data.wallet_address
    );
    
    if (registrationIndex === -1) {
      return res.status(404).json({
        error: "Registration not found"
      });
    }
    
    // Update verification status
    const registration = registrations[registrationIndex];

    if (data.twitter_followed !== undefined) {
      registration.twitter_followed = data.twitter_followed;
    }

    if (data.telegram_joined !== undefined) {
      registration.telegram_joined = data.telegram_joined;
    }

    if (data.tweet_verified !== undefined) {
      registration.tweet_verified = data.tweet_verified;
    }

    if (data.friends_invited !== undefined) {
      registration.friends_invited = data.friends_invited;
    }

    // Update overall verification status - all requirements must be met
    registration.social_verified =
      registration.twitter_followed &&
      registration.telegram_joined &&
      registration.tweet_verified &&
      registration.friends_invited >= 1;

    // Update bonus eligibility based on verification
    registration.bonus_eligible = registration.social_verified && registration.is_verm_holder;
    
    registrations[registrationIndex] = registration;
    
    res.json({
      success: true,
      registration
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
