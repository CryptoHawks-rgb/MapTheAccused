import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Search, Users, Shield, BarChart3, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || location.pathname === '/login') {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">MapTheAccused</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/search"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>

            {(user.role === 'admin' || user.role === 'superadmin') && (
              <Link
                to="/manage-accused"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/manage-accused') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Manage Accused</span>
              </Link>
            )}

            {user.role === 'superadmin' && (
              <Link
                to="/manage-users"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/manage-users') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Manage Users</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-700">Welcome, </span>
              <span className="font-medium text-gray-900">{user.username}</span>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-danger-600 hover:bg-danger-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/search') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </Link>

            {(user.role === 'admin' || user.role === 'superadmin') && (
              <Link
                to="/manage-accused"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/manage-accused') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Manage Accused</span>
              </Link>
            )}

            {user.role === 'superadmin' && (
              <Link
                to="/manage-users"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/manage-users') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Manage Users</span>
              </Link>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="px-3 py-2">
                <div className="text-base font-medium text-gray-800">{user.username}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;