-- $VERM Airdrop Registration Table
CREATE TABLE IF NOT EXISTS public.vermairdrop_registrations (
  id SERIAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  email CHARACTER VARYING(255) NOT NULL,
  twitter CHARACTER VARYING(100) NULL,
  telegram CHARACTER VARYING(100) NULL,
  wallet_address CHARACTER VARYING(100) NOT NULL,
  is_verm_holder BOOLEAN NULL DEFAULT FALSE,
  verm_balance NUMERIC(20, 6) NULL DEFAULT 0,
  bonus_eligible BOOLEAN NULL DEFAULT FALSE,
  social_verified BOOLEAN NULL DEFAULT FALSE,
  CONSTRAINT vermairdrop_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT vermairdrop_registrations_wallet_address_key UNIQUE (wallet_address)
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_address 
ON public.vermairdrop_registrations 
USING btree (wallet_address) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_timestamp 
ON public.vermairdrop_registrations 
USING btree ("timestamp" DESC) 
TABLESPACE pg_default;

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_social_verified 
ON public.vermairdrop_registrations 
USING btree (social_verified) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_bonus_eligible 
ON public.vermairdrop_registrations 
USING btree (bonus_eligible) 
TABLESPACE pg_default;
