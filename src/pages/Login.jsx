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
    </div>
  );
}

export default Login;