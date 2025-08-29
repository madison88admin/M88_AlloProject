import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, User, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import M88DatabaseUI from '../App';

// Updated Account type to include admin
type Account = {
  id: string; // UUID from Supabase
  username: string;
  password: string; // Plain for demo; in production, store hashed passwords
  type: 'company' | 'factory' | 'admin'; // Added admin type
  name: string;
  department?: string | null;
  facility?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<Account | null>(null);

  // LOGIN via Supabase Accounts table with admin support
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with username:', username);
      
      const { data, error: dbError } = await supabase
        .from('accounts')
        .select('*')
        .eq('username', username.trim()) // Trim whitespace
        .eq('is_active', true) // Only active accounts
        .limit(1);

      console.log('Supabase response:', { data, error: dbError });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!data || data.length === 0) {
        setError('Username not found');
        setIsLoading(false);
        return;
      }

      const user = data[0] as Account;
      console.log('Found user:', { ...user, password: '[REDACTED]' });

      // Validate account type
      if (!['company', 'factory', 'admin'].includes(user.type)) {
        setError('Invalid account type. Please contact administrator.');
        setIsLoading(false);
        return;
      }

      // Compare passwords (in production, use proper hash comparison)
      if (user.password !== password) {
        setError('Invalid password');
        setIsLoading(false);
        return;
      }

      // Login successful
      console.log(`Login successful for ${user.type} user:`, user.username);
      setAuthenticatedUser(user);
      setError('');
      
      // Clear form
      setUsername('');
      setPassword('');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('User logged out');
    setAuthenticatedUser(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  // Get user type display info
  const getUserTypeInfo = (type: 'company' | 'factory' | 'admin') => {
    switch (type) {
      case 'company':
        return { label: 'Company User', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'factory':
        return { label: 'Factory User', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'admin':
        return { label: 'Administrator', color: 'text-purple-600', bgColor: 'bg-purple-50' };
      default:
        return { label: 'User', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  // If user is authenticated, show the main app
  if (authenticatedUser) {
    const userTypeInfo = getUserTypeInfo(authenticatedUser.type);
    
    return (
      <M88DatabaseUI 
        tableType={authenticatedUser.type} 
        onLogout={handleLogout}
        user={authenticatedUser} // Pass full user object
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Building2 className="w-12 h-12 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-900">M88 Allocation</h1>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Account Types Info */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-700 mb-3 text-center">Account Types</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">Company</span>
              </div>
              <span className="text-slate-500">Standard business access</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">Factory</span>
              </div>
              <span className="text-slate-500">Manufacturing facility access</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-slate-600">Admin</span>
              </div>
              <span className="text-slate-500">Full system administration</span>
            </div>
          </div>
        </div>

        {/* Demo credentials info - you can remove this in production */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700 text-center">
            <strong>Demo Accounts:</strong> Contact your administrator for login credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;