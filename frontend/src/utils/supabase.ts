import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export type UserSubscription = {
  id?: string;
  email: string;
  plan: 'lite' | 'standard' | 'premium';
  subscription_status: 'active' | 'canceled';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  updated_at?: string;
};

export const getUserByEmail = async (email: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data as UserSubscription;
};

export const createOrUpdateUser = async (user: UserSubscription): Promise<UserSubscription | null> => {
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (existingUser) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...user,
        updated_at: new Date().toISOString(),
      })
      .eq('email', user.email)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data as UserSubscription;
  } else {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        ...user,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data as UserSubscription;
  }
};

export const saveAnalysisHistory = async (
  email: string,
  url: string,
  summary_json: any,
  tags: string[],
  scores: {
    sns_score?: number;
    structure_score?: number;
    ux_score?: number;
    app_score?: number;
    theme_score?: number;
  }
): Promise<string | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('analysis_history')
      .insert({
        user_email: email,
        url,
        summary_json,
        tags,
        ...scores
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error saving analysis history:', error);
      return null;
    }
    
    return data.id;
  } catch (err) {
    console.error('Error in saveAnalysisHistory:', err);
    return null;
  }
};

export const getAnalysisHistory = async (email: string, tagFilter?: string[]): Promise<any[]> => {
  try {
    let query = supabaseAdmin
      .from('analysis_history')
      .select('*')
      .eq('user_email', email)
      .order('analyzed_at', { ascending: false });
    
    if (tagFilter && tagFilter.length > 0) {
      query = query.contains('tags', tagFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getAnalysisHistory:', err);
    return [];
  }
};
