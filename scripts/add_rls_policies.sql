ALTER TABLE IF EXISTS public.analysis_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own analysis history" ON public.analysis_history;
    DROP POLICY IF EXISTS "Users can insert their own analysis history" ON public.analysis_history;
    DROP POLICY IF EXISTS "Users can update their own analysis history" ON public.analysis_history;
    DROP POLICY IF EXISTS "Users can delete their own analysis history" ON public.analysis_history;
    DROP POLICY IF EXISTS "Service role can access all analysis history" ON public.analysis_history;
    
    CREATE POLICY "Users can view their own analysis history" ON public.analysis_history FOR SELECT USING (auth.email() = user_email);
    CREATE POLICY "Users can insert their own analysis history" ON public.analysis_history FOR INSERT WITH CHECK (auth.email() = user_email);
    CREATE POLICY "Users can update their own analysis history" ON public.analysis_history FOR UPDATE USING (auth.email() = user_email);
    CREATE POLICY "Users can delete their own analysis history" ON public.analysis_history FOR DELETE USING (auth.email() = user_email);
    CREATE POLICY "Service role can access all analysis history" ON public.analysis_history FOR ALL USING (auth.role() = 'service_role');
END
$$;

ALTER TABLE IF EXISTS public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Service role can access all user settings" ON public.user_settings;
    
    CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.email() = user_email);
    CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.email() = user_email);
    CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.email() = user_email);
    CREATE POLICY "Users can delete their own settings" ON public.user_settings FOR DELETE USING (auth.email() = user_email);
    CREATE POLICY "Service role can access all user settings" ON public.user_settings FOR ALL USING (auth.role() = 'service_role');
END
$$;
