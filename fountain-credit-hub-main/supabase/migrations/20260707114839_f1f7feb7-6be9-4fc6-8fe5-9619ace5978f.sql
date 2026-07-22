
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS default_interest_rate numeric NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS late_penalty_rate numeric NOT NULL DEFAULT 5;

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS penalty_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS topup_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS topup_total numeric NOT NULL DEFAULT 0;
