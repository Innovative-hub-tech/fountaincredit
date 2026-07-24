-- Auto-grant super_admin to the designated owner email on signup,
-- and grant it now if that user already exists.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'innovativet.hub@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'borrower')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END; $function$;

-- If the owner already signed up, promote them now.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role
FROM auth.users u
WHERE lower(u.email) = 'innovativet.hub@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;