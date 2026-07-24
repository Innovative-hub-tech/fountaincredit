
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('super_admin','finance_officer','loan_officer','customer_support','borrower');
CREATE TYPE public.gender_type AS ENUM ('male','female','other');
CREATE TYPE public.bvn_status AS ENUM ('unverified','pending','verified','failed');
CREATE TYPE public.account_status AS ENUM ('active','suspended','blacklisted');
CREATE TYPE public.loan_status AS ENUM ('pending','approved','rejected','disbursed','active','partially_repaid','fully_repaid','defaulted');
CREATE TYPE public.repayment_schedule AS ENUM ('weekly','biweekly','monthly','lump_sum');
CREATE TYPE public.repayment_status AS ENUM ('pending','verified','rejected');

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','finance_officer','loan_officer','customer_support')
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Super admin manages roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ===== UPDATED_AT HELPER =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  date_of_birth date,
  gender public.gender_type,
  phone text,
  email text,
  address text,
  occupation text,
  employer text,
  monthly_income numeric,
  next_of_kin_name text,
  next_of_kin_phone text,
  bank_name text,
  bank_account_number text,
  bvn text,
  passport_url text,
  gov_id_url text,
  bvn_verification public.bvn_status NOT NULL DEFAULT 'unverified',
  account_status public.account_status NOT NULL DEFAULT 'active',
  registration_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Staff view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + borrower role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'borrower')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== LOANS =====
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  purpose text NOT NULL,
  duration_months integer NOT NULL,
  schedule public.repayment_schedule NOT NULL DEFAULT 'monthly',
  status public.loan_status NOT NULL DEFAULT 'pending',
  interest_rate numeric NOT NULL DEFAULT 0,
  total_repayable numeric,
  amount_repaid numeric NOT NULL DEFAULT 0,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  disbursed_amount numeric,
  disbursed_at timestamptz,
  disbursement_reference text,
  disbursement_notes text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Borrowers view own loans" ON public.loans
  FOR SELECT TO authenticated USING (auth.uid() = borrower_id);
CREATE POLICY "Borrowers create own loans" ON public.loans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Staff view all loans" ON public.loans
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update loans" ON public.loans
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== REPAYMENTS =====
CREATE TABLE public.repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  reference_number text,
  proof_url text,
  status public.repayment_status NOT NULL DEFAULT 'pending',
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repayments TO authenticated;
GRANT ALL ON public.repayments TO service_role;
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Borrowers view own repayments" ON public.repayments
  FOR SELECT TO authenticated USING (auth.uid() = borrower_id);
CREATE POLICY "Borrowers create own repayments" ON public.repayments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Staff view all repayments" ON public.repayments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update repayments" ON public.repayments
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER repayments_updated_at BEFORE UPDATE ON public.repayments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) OR auth.uid() = user_id);

-- ===== APP SETTINGS =====
CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  whatsapp_number text NOT NULL DEFAULT '08033708798',
  primary_email text NOT NULL DEFAULT 'fountainlords22@gmail.com',
  secondary_email text NOT NULL DEFAULT 'innovativet.hub@gmail.com',
  account_name text NOT NULL DEFAULT 'Fountain Credit',
  account_number text NOT NULL DEFAULT '8033708798',
  bank_name text NOT NULL DEFAULT 'Opay',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Super admin updates settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
