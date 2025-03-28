import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, checkAndVerifyAdminRole, createUserProfile } from '../lib/supabase';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for success message from email verification
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('No user returned from login');

      try {
        // Use the dedicated helper function to check admin role
        // This will not create profiles automatically
        const isAdmin = await checkAndVerifyAdminRole(data.user.id);
        console.log('Is admin check result:', isAdmin);
        
        if (isAdmin) {
          console.log('Admin user confirmed, redirecting to admin dashboard');
          navigate('/admin');
          return;
        }
        
        // If not admin, fetch user data to check role as a backup
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('User ID:', data.user.id);
        console.log('User data from profiles table:', userData);
        
        if (userError) {
          console.error('Error fetching user role:', userError);
          
          // Check if this is a "no rows" error, meaning profile doesn't exist
          if (userError.code === 'PGRST116' || userError.message?.includes('no rows')) {
            console.log('Profile does not exist for this user');
            setError('Your account is missing a profile. Please contact an administrator or use the Admin Utilities below to create one.');
            setLoading(false);
            return;
          }
          
          // If we can't get the role, log the error but still navigate to dashboard
          // This prevents 500 errors from blocking the UI
          navigate('/user/dashboard');
          return;
        }

        // Navigate based on role (this is a backup in case the helper function didn't work)
        if (userData && userData.role) {
          console.log('User role found:', userData.role);
          console.log('Role type:', typeof userData.role);
          console.log('Role length:', userData.role.length);
          // More robust comparison - trim whitespace and ensure case-insensitive
          const normalizedRole = userData.role.toString().trim().toLowerCase();
          console.log('Normalized role:', normalizedRole);
          console.log('Comparison result:', normalizedRole === 'admin');
          
          if (normalizedRole === 'admin') {
            console.log('Admin user detected, redirecting to admin dashboard');
            navigate('/admin');
          } else {
            // For all other roles, go to user dashboard
            console.log('Non-admin role detected:', normalizedRole);
            navigate('/user/dashboard');
          }
        } else {
          console.warn('User role not found, defaulting to user dashboard');
          navigate('/user/dashboard');
        }
      } catch (roleError) {
        console.error('Error checking user role:', roleError);
        // If role check fails, default to regular user access
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email to confirm your account');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to login');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                type="email"
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#101d42] focus:ring focus:ring-[#101d42] focus:ring-opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                type="password"
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#101d42] focus:ring focus:ring-[#101d42] focus:ring-opacity-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#101d42] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#101d42] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-sm text-[#101d42] hover:text-opacity-90"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
      
      {/* Admin utilities section - always visible for now during development */}
      <div className="mt-8 bg-gray-100 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Role Utilities</h2>
        <div className="space-y-4">
          <AdminRoleDebugger />
        </div>
      </div>
    </div>
  );
}

// Admin role debugging component
function AdminRoleDebugger() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [sqlCommand, setSqlCommand] = useState('');
  const [userData, setUserData] = useState(null);

  async function getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        setUserData(data.user);
        setStatus({ message: `Current user: ${data.user.email}`, type: 'info' });
      } else {
        setStatus({ message: 'No logged in user found', type: 'error' });
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      setStatus({ message: 'Error fetching user', type: 'error' });
    }
  }

  async function createProfile() {
    if (!userId) {
      setStatus({ message: 'Please get or enter a user ID first', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (existingProfile) {
        setStatus({ message: 'Profile already exists for this user', type: 'info' });
        setLoading(false);
        return;
      }
    
      // Get user details for better profile creation
      const userEmail = userData?.email || 'user@example.com';
      const userName = userData?.user_metadata?.full_name || 
                      userData?.email?.split('@')[0] || 
                      'User';
      
      // Create a new profile
      const { data: newProfile, error: createError } = await createUserProfile(
        userId,
        userName,
        userEmail,
        'user' // Default role is 'user'
      );
      
      if (createError) {
        throw createError;
      }
      
      setStatus({ 
        message: `Profile created successfully with role 'user'. Use 'Set Admin' button to make this user an admin.`,
        type: 'success'
      });
      
      // Refresh profile data - wait a moment for the database to update
      setTimeout(checkRole, 1000);
      
    } catch (error) {
      console.error('Error creating profile:', error);
      setStatus({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function checkRole() {
    if (!userId) {
      setStatus({ message: 'Please get or enter a user ID first', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')  // Get all fields for inspection
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Show the full user data for debugging
      console.log('Full user profile data:', data);
      
      setStatus({ 
        message: `User data: Role=${data?.role || 'None'}, 
                 ID=${data?.id || 'None'}, 
                 Name=${data?.name || 'None'}
                 Full data in console.`,
        type: 'info'
      });
    } catch (error) {
      console.error('Error checking role:', error);
      setStatus({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function setAdmin() {
    if (!userId) {
      setStatus({ message: 'Please get or enter a user ID first', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // First try with direct update
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (error) throw error;
      
      setStatus({ message: `User ${userId} successfully set as admin`, type: 'success' });
    } catch (error) {
      console.error('Error setting admin:', error);
      setStatus({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function setAdminAndNavigate() {
    if (!userId) {
      setStatus({ message: 'Please get or enter a user ID first', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // Update the role to admin
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (error) throw error;
      
      setStatus({ 
        message: `User ${userId} set as admin. Redirecting to admin dashboard...`,
        type: 'success'
      });
      
      // Short delay for UI feedback
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
      
    } catch (error) {
      console.error('Error setting admin:', error);
      setStatus({ message: `Error: ${error.message}`, type: 'error' });
      setLoading(false);
    }
  }

  async function fixRoleWhitespace() {
    if (!userId) {
      setStatus({ message: 'Please get or enter a user ID first', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // First get the current role value
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!userData || !userData.role) {
        setStatus({ message: 'No role found for this user', type: 'error' });
        setLoading(false);
        return;
      }
      
      // Trim the role value to remove any whitespace
      const trimmedRole = userData.role.toString().trim();
      console.log(`Current role: "${userData.role}" (${userData.role.length} chars)`);
      console.log(`Trimmed role: "${trimmedRole}" (${trimmedRole.length} chars)`);
      
      // Update with the trimmed value
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: trimmedRole })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      setStatus({ 
        message: `Role value cleaned: "${userData.role}" → "${trimmedRole}"`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error fixing role whitespace:', error);
      setStatus({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  // Generate SQL command for manual execution
  function generateSqlCommand() {
    if (!userId) {
      setStatus({ message: 'Please get or enter a user ID first', type: 'error' });
      return;
    }

    const sql = `-- Run this SQL in your Supabase SQL Editor
-- 1. First check if the profile exists:
SELECT * FROM public.profiles WHERE id = '${userId}';

-- 2. If the profile doesn't exist, insert it:
INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
VALUES ('${userId}', 'Admin User', 'admin@example.com', 'admin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. If the profile exists, update the role to admin:
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = '${userId}';`;

    setSqlCommand(sql);
    setStatus({ 
      message: 'SQL command generated. You can copy and execute this in Supabase SQL Editor.',
      type: 'info'
    });
  }

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <div className="flex flex-col space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="flex-1 border border-gray-300 px-3 py-2 rounded"
          />
          <button 
            onClick={getCurrentUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Get Current User
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={checkRole}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            disabled={loading}
          >
            Check Role
          </button>
          <button 
            onClick={createProfile}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            Create Profile
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={setAdmin}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={loading}
          >
            Set as Admin
          </button>
          <button 
            onClick={setAdminAndNavigate}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            disabled={loading}
          >
            Set Admin & Navigate
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={fixRoleWhitespace}
            className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            disabled={loading}
          >
            Clean Role Whitespace
          </button>
          <button 
            onClick={generateSqlCommand}
            className="flex-1 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            disabled={loading}
          >
            Generate SQL Fix
          </button>
        </div>
        
        {sqlCommand && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">SQL Command for Database Admin</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlCommand);
                  setStatus({ message: 'SQL command copied to clipboard', type: 'success' });
                }}
                className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">{sqlCommand}</pre>
          </div>
        )}
        
        {status.message && (
          <div className={`p-3 rounded ${
            status.type === 'error' ? 'bg-red-100 text-red-700' : 
            status.type === 'success' ? 'bg-green-100 text-green-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;