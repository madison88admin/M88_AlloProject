import React, { useState } from 'react';
import { AlertCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { logUserLogin } from '../services/loggingService';

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

interface LoginPageProps {
  onLogin: (user: Account) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('');
      
      // Log the login
      logUserLogin(user.id, user.username, user.type);
      
      // Call the onLogin callback with the user data
      onLogin(user);
      
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



  // Note: Authentication is now handled by the parent component

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100"
      style={{
        backgroundImage: 'url(/mountain-login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/m88-darklogo.png" 
              alt="M88 Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Allocation System</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
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
                data-form-type="other"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-medium select-none"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  margin: 0,
                  outline: 'none',
                  userSelect: 'none'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
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

        {/* Contact Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <span className="font-medium">Contact:</span> lester@madison88.com for your login credentials
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;