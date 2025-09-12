-- ODINARY platform core schema

-- Users (optional email)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL UNIQUE,
  email TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memes
CREATE TABLE IF NOT EXISTS public.memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet TEXT NOT NULL,
  text_input TEXT NOT NULL,
  model_cfg_json JSONB NOT NULL,
  ipfs_cid TEXT,
  content_hash TEXT NOT NULL,
  short_hash TEXT NOT NULL UNIQUE,
  watermark_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING'
);
CREATE INDEX IF NOT EXISTS idx_memes_creator ON public.memes (creator_wallet);
CREATE INDEX IF NOT EXISTS idx_memes_created ON public.memes (created_at DESC);

-- Share intents
CREATE TABLE IF NOT EXISTS public.share_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  share_url TEXT NOT NULL,
  tweet_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_share_meme ON public.share_intents (meme_id);

-- Tweet tracking
CREATE TABLE IF NOT EXISTS public.tweet_track (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  tweet_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  snapshot_json JSONB,
  final_interactions INTEGER,
  final_shares INTEGER,
  status TEXT NOT NULL DEFAULT 'PENDING'
);
CREATE INDEX IF NOT EXISTS idx_tweet_track_tweet ON public.tweet_track (tweet_id);

-- Mint events
CREATE TABLE IF NOT EXISTS public.mint_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  nft_mint TEXT NOT NULL,
  price_nary BIGINT NOT NULL,
  tx_sig TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_mint TEXT NOT NULL UNIQUE,
  price_nary BIGINT NOT NULL,
  escrow_pda TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- Token receipts (unruggable token generator)
CREATE TABLE IF NOT EXISTS public.token_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL,
  total_supply NUMERIC(40,0) NOT NULL,
  lp_vault TEXT,
  schedule_json JSONB,
  tx_sig TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DFS / Meme contests
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  rules_json JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN'
);
CREATE INDEX IF NOT EXISTS idx_contests_time ON public.contests (start_at, end_at);

CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  slate_json JSONB NOT NULL,
  stake_nary BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_entries_contest ON public.entries (contest_id);

CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  score NUMERIC(20,6) NOT NULL,
  payout_nary BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.risk_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
