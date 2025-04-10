import React from 'react';
import { Link } from 'react-router-dom';

function AuthButtons() {
  return (
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
  );
}

export default AuthButtons; 