import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, User, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import M88DatabaseUI from '../App';

// Fixed Accounts table row type with UUID
type Account = {
  id: string; // Changed from number to string for UUID
  username: string;
  password: string; // Plain for demo; in production, store hashed passwords
  type: 'company' | 'factory';
  name: string;
  department?: string | null;
  facility?: string | null;
  created_at?: string; // Added optional timestamp fields
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
  const [showSignUp, setShowSignUp] = useState(false);

  // LOGIN via Supabase Accounts table with UUID support
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

      // Compare passwords (in production, use proper hash comparison)
      if (user.password !== password) {
        setError('Invalid password');
        setIsLoading(false);
        return;
      }

      // Login successful
      console.log('Login successful for user:', user.username);
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

  // SIGN UP via Supabase Accounts table with UUID support
  const [signUpFields, setSignUpFields] = useState({
    username: '',
    password: '',
    name: '',
    type: 'company' as 'company' | 'factory',
    department: '',
    facility: ''
  });
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSignUpError('');
    setSignUpSuccess('');

    try {
      const trimmedUsername = signUpFields.username.trim();
      console.log('Attempting signup for username:', trimmedUsername);

      // Validate required fields
      if (!trimmedUsername || !signUpFields.password || !signUpFields.name) {
        setSignUpError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (signUpFields.type === 'company' && !signUpFields.department.trim()) {
        setSignUpError('Department is required for company accounts');
        setIsLoading(false);
        return;
      }

      if (signUpFields.type === 'factory' && !signUpFields.facility.trim()) {
        setSignUpError('Facility is required for factory accounts');
        setIsLoading(false);
        return;
      }

      // Check if username already exists
      const { data: existing, error: existingErr } = await supabase
        .from('accounts')
        .select('id')
        .eq('username', trimmedUsername)
        .limit(1);

      console.log('Username check result:', { existing, existingErr });

      if (existingErr) {
        console.error('Error checking username:', existingErr);
        throw new Error(`Error checking username: ${existingErr.message}`);
      }

      if (existing && existing.length > 0) {
        setSignUpError('Username already exists. Please choose a different username.');
        setIsLoading(false);
        return;
      }

      // Prepare insert data
      const insertData = {
        username: trimmedUsername,
        password: signUpFields.password, // In production, hash this!
        type: signUpFields.type,
        name: signUpFields.name.trim(),
        department: signUpFields.type === 'company' ? signUpFields.department.trim() || null : null,
        facility: signUpFields.type === 'factory' ? signUpFields.facility.trim() || null : null,
        is_active: true
      };

      console.log('Inserting new account:', { ...insertData, password: '[REDACTED]' });

      // Insert new account - Supabase will auto-generate UUID
      const { data: newUser, error: insertErr } = await supabase
        .from('accounts')
        .insert([insertData])
        .select() // Return the inserted record
        .single(); // Get single record instead of array

      if (insertErr) {
        console.error('Insert error:', insertErr);
        throw new Error(`Failed to create account: ${insertErr.message}`);
      }

      console.log('Account created successfully:', { ...newUser, password: '[REDACTED]' });
      
      setSignUpSuccess('Account created successfully! You can now log in.');
      setShowSignUp(false);
      
      // Prefill login form with new credentials
      setUsername(trimmedUsername);
      setPassword(signUpFields.password);

      // Reset signup form
      setSignUpFields({
        username: '',
        password: '',
        name: '',
        type: 'company',
        department: '',
        facility: ''
      });

    } catch (err: any) {
      console.error('Signup error:', err);
      setSignUpError(err.message || 'Failed to create account. Please try again.');
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
    setSignUpSuccess('');
  };

  // If user is authenticated, show the main app
  if (authenticatedUser) {
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

        {/* Success message from signup */}
        {signUpSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{signUpSuccess}</p>
          </div>
        )}

        {/* {!showSignUp ? ( */}
           LOGIN FORM
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

            {/* {/* <div className="text-center mt-4">
              <button
                type="button"
                className="text-indigo-600 hover:underline text-sm"
                onClick={() => {
                  setShowSignUp(true);
                  setError('');
                  setSignUpSuccess('');
                }}
              >
                Don't have an account? Sign up
              </button>
            </div> */}
          </form>
        {/* ) : (
          // SIGNUP FORM
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username *
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                type="text"
                placeholder="Choose a username"
                value={signUpFields.username}
                onChange={e => setSignUpFields(f => ({ ...f, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                type="password"
                placeholder="Choose a password (min 6 characters)"
                value={signUpFields.password}
                onChange={e => setSignUpFields(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                type="text"
                placeholder="Your full name"
                value={signUpFields.name}
                onChange={e => setSignUpFields(f => ({ ...f, name: e.target.value }))}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Type *
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={signUpFields.type}
                onChange={e => setSignUpFields(f => ({ 
                  ...f, 
                  type: e.target.value as 'company' | 'factory',
                  department: '', // Reset when type changes
                  facility: ''
                }))}
                required
              >
                <option value="company">Company</option>
                <option value="factory">Factory</option>
              </select>
            </div>

            {signUpFields.type === 'company' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department *
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  placeholder="e.g., Operations, Management, HR"
                  value={signUpFields.department}
                  onChange={e => setSignUpFields(f => ({ ...f, department: e.target.value }))}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Facility *
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  placeholder="e.g., Plant A, Factory North, Warehouse 1"
                  value={signUpFields.facility}
                  onChange={e => setSignUpFields(f => ({ ...f, facility: e.target.value }))}
                  required
                />
              </div>
            )}

            {signUpError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{signUpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-indigo-600 hover:underline text-sm"
                onClick={() => {
                  setShowSignUp(false);
                  setSignUpError('');
                  setSignUpSuccess('');
                }}
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )} */}

        {/* Demo credentials info */}
        {/* <div className="mt-6 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 text-center">
            Demo: Try creating a new account or contact admin for test credentials
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;