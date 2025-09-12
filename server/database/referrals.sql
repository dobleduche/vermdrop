-- Referral aggregate per referrer
CREATE TABLE IF NOT EXISTS public.vermairdrop_referrals (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer_wallet_address VARCHAR(100) UNIQUE NOT NULL,
  referral_code VARCHAR(64) UNIQUE NOT NULL,
  total_referred INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_wallet ON public.vermairdrop_referrals (referrer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.vermairdrop_referrals (referral_code);

-- Referral events (referee registrations credited to referrer)
CREATE TABLE IF NOT EXISTS public.vermairdrop_referral_events (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referral_code VARCHAR(64) NOT NULL,
  referrer_wallet_address VARCHAR(100) NOT NULL,
  referee_wallet_address VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON public.vermairdrop_referral_events (referrer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_events_code ON public.vermairdrop_referral_events (referral_code);
