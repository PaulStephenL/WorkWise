import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a user profile for a verified user
 * This is a workaround for RLS permission issues during email verification
 */
export async function createUserProfile(userId, name, email, role = 'user') {
  // First try with the normal client
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: name || 'User',
        email: email,
        role: role
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in normal profile creation:', error);
    
    // Use a custom function call as a fallback
    try {
      // This fallback uses a server-side RPC function that should be created
      // in your Supabase dashboard
      const { data: functionData, error: functionError } = await supabase.rpc(
        'create_user_profile',
        { 
          user_id: userId,
          user_name: name || 'User',
          user_email: email,
          user_role: role
        }
      );
      
      if (functionError) throw functionError;
      return { data: functionData, error: null };
    } catch (functionError) {
      console.error('Error in function profile creation:', functionError);
      return { data: null, error: functionError };
    }
  }
}

/**
 * Helper function to check and verify if a user has admin role
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - True if user is admin, false otherwise
 */
export async function checkAndVerifyAdminRole(userId) {
  try {
    // Fetch the user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')  // Get all fields for better debugging
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin role:', error);
      
      // Try checking with RPC as a fallback (bypasses RLS)
      try {
        console.log('Trying RPC fallback for role check...');
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_user_role',
          { user_id: userId }
        );
        
        if (rpcError) {
          console.error('RPC role check failed:', rpcError);
          return false;
        }
        
        if (rpcData && typeof rpcData === 'string') {
          const normalizedRpcRole = rpcData.toString().trim().toLowerCase();
          console.log('RPC role check result:', normalizedRpcRole);
          return normalizedRpcRole === 'admin';
        }
      } catch (rpcError) {
        console.error('Exception in RPC role check:', rpcError);
      }
      
      return false;
    }
    
    // Log exact data for debugging
    console.log('User profile data for admin check:', data);
    
    // Additional safety checks
    if (!data) {
      console.error('No profile data found for user:', userId);
      return false;
    }
    
    if (!data.role) {
      console.error('No role field found for user:', userId);
      return false;
    }
    
    // Check role type
    console.log('Role type:', typeof data.role);
    console.log('Role value length:', data.role.length);
    console.log('Role value:', JSON.stringify(data.role)); // Shows hidden whitespace
    
    // Use normalized comparison for better reliability
    const normalizedRole = data.role.toString().trim().toLowerCase();
    console.log('Normalized role:', normalizedRole);
    console.log('Is admin check result:', normalizedRole === 'admin');
    
    // We know from user's previous message the role had whitespace
    // Auto-fix the role if needed
    if (normalizedRole === 'admin' && normalizedRole !== data.role) {
      console.log('Auto-fixing admin role with whitespace...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error auto-fixing role:', updateError);
      } else {
        console.log('Successfully fixed admin role');
      }
    }
    
    return normalizedRole === 'admin';
  } catch (error) {
    console.error('Exception checking admin role:', error);
    return false;
  }
}

// For testing/development - can be used to set a user as admin
export async function setUserAsAdmin(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    console.log('User set as admin:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return { success: false, error };
  }
}