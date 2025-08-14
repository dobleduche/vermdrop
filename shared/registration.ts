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
}

export interface VerificationRequest {
  wallet_address: string;
  twitter_verified?: boolean;
  telegram_verified?: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  registration?: Registration;
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
