import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

function UserMenu({ userRole, showUserMenu, setShowUserMenu, handleLogout }) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center space-x-2 px-4 py-2 rounded bg-[#798478] hover:bg-[#a0a083] transition-colors"
      >
        <User className="h-5 w-5" />
        <span>Account</span>
      </button>
      
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <Link
            to={userRole === 'admin' ? "/admin" : "/user/dashboard"}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowUserMenu(false)}
          >
            Dashboard
          </Link>
          {userRole === 'user' && (
            <Link
              to="/user/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowUserMenu(false)}
            >
              Profile Settings
            </Link>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Logout button clicked');
              handleLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu; 