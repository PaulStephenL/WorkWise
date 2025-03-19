import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting auth user:', error);
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Unexpected error in fetchUser:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    fetchUser();

    // Cleanup listener on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-[#101d42] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8" />
            <span className="text-xl font-bold">WorkWise</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 text-lg">
            <Link to="/Home" className="hover:text-[#ffdde2]">Jobs</Link>
            <Link to="/about" className="hover:text-[#ffdde2]">About</Link>
            <Link to="/contact" className="hover:text-[#ffdde2]">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/user/dashboard"
                  className="px-4 py-2 rounded bg-[#798478] hover:bg-[#a0a083] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded bg-[#ffdde2] text-[#101d42] hover:bg-opacity-90 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded bg-[#798478] hover:bg-[#a0a083] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded bg-[#ffdde2] text-[#101d42] hover:bg-opacity-90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;