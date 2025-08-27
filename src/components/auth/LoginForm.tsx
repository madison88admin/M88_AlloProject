import { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { RoleSelector } from './RoleSelector.tsx';
import type { UserRole } from '../../types'; 

interface LoginFormProps {
  onLogin: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  onSwitchToRegister: () => void;
  loading: boolean;
}

export const LoginForm = ({ onLogin, onSwitchToRegister, loading }: LoginFormProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!selectedRole) {
      setError('Please select a user type');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    const result = await onLogin(formData.email, formData.password, selectedRole);

    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Tab Header */}
      <div className="flex mb-6">
        <button
          type="button"
          className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-blue-500 text-white shadow-md"
        >
          <LogIn className="w-4 h-4 inline mr-2" />
          Sign In
        </button>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Sign Up
        </button>
      </div>

      <div className="space-y-4">
        {/* Role Selection */}
        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          disabled={loading}
        />

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12 disabled:opacity-50"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !selectedRole}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Sign up
          </button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;