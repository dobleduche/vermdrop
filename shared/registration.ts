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

export interface RegistrationRequest {
  email: string;
  twitter?: string;
  telegram?: string;
  wallet_address: string;
  referred_by_code?: string;
}

export interface VerificationRequest {
  wallet_address: string;
  twitter_followed?: boolean;
  telegram_joined?: boolean;
  tweet_verified?: boolean;
  tweet_url?: string;
  friends_invited?: number;
}

export interface RegistrationResponse {
  success: boolean;
  registration?: Registration & { referral_code?: string };
  error?: string;
  details?: any;
}

export interface RegistrationStats {
  total_registrations: number;
  verified_users: number;
  verm_holders: number;
  bonus_eligible: number;
}

export interface StatsResponse {
  success: boolean;
  stats?: RegistrationStats;
  error?: string;
}

export interface ReferralInfo {
  referral_code: string;
  total_referred: number;
}

export interface ReferralResponse {
  success: boolean;
  info?: ReferralInfo;
  error?: string;
}
