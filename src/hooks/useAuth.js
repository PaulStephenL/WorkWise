import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Effect for authentication state management
  useEffect(() => {
    let authListener = null;
    isMounted.current = true;
    
    async function initializeAuth() {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }
        
        // Set up auth listener first
        const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            setUser(newSession.user);
            await fetchUserRole(newSession.user.id);
          } 
          else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            setUser(null);
            setUserRole(null);
          }
        });
        
        authListener = data.subscription;
        
        // Handle initial session
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }
    
    // Separate function to fetch user role
    async function fetchUserRole(userId) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('Error fetching user role:', profileError);
          if (isMounted.current) setUserRole('user'); // Default to user role on error
        } else if (profileData) {
          if (isMounted.current) setUserRole(profileData.role || 'user');
        } else {
          if (isMounted.current) setUserRole('user');
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        if (isMounted.current) setUserRole('user');
      }
    }
    
    // Initialize auth
    initializeAuth();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up auth hook');
      isMounted.current = false;
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear states immediately for UI feedback
      setUser(null);
      setUserRole(null);
      
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
      setUserRole(null);
      navigate('/');
    }
  }, [navigate]);

  return {
    user,
    userRole,
    loading,
    logout,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin'
  };
} 