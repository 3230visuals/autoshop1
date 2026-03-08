-- ═══════════════════════════════════════════════════
-- 008_profile_trigger.sql
-- Automatically create a profile when a new user signs up
-- ═══════════════════════════════════════════════════

-- 1. Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with postgres privileges, bypassing RLS
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'User'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'CLIENT'),
        COALESCE(
            new.raw_user_meta_data->>'avatar_url',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
        )
    )
    ON CONFLICT (id) DO NOTHING; -- Avoid errors if profile already exists
    RETURN new;
END;
$$;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
