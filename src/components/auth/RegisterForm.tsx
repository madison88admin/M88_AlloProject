import { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { RoleSelector } from './RoleSelector.tsx';
import type { UserRole } from '../../types'; 

interface RegisterFormProps {
  onRegister: (email: string, password: string, name: string, role: UserRole, company: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToLogin: () => void;
  loading: boolean;
}

export const RegisterForm = ({ onRegister, onSwitchToLogin, loading }: RegisterFormProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!selectedRole) {
      setError('Please select a user type');
      return;
    }

    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.company.trim()) {
      setError('Company name is required');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await onRegister(
      formData.email,
      formData.password,
      formData.name,
      selectedRole,
      formData.company
    );

    if (!result.success) {
      setError(result.error || 'Registration failed');
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

  // Get placeholder text based on selected role
  const getCompanyPlaceholder = () => {
    if (!selectedRole) return 'Enter your company name';
    if (['admin', 'manager'].includes(selectedRole)) return 'Madison 88 Company';
    return 'Factory/Supplier Company';
  };

  return (
    <>
      {/* Tab Header */}
      <div className="flex mb-6">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <LogIn className="w-4 h-4 inline mr-2" />
          Sign In
        </button>
        <button
          type="button"
          className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-blue-500 text-white shadow-md"
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

        {/* Full Name Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your full name"
            autoComplete="name"
          />
        </div>

        {/* Company Name Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder={getCompanyPlaceholder()}
            autoComplete="organization"
          />
        </div>

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
              autoComplete="new-password"
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
          <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12 disabled:opacity-50"
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Terms Notice */}
        <div className="text-xs text-slate-500 text-center">
          By creating an account, you agree to the M88 Database terms of service and privacy policy.
        </div>

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
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create Account
            </>
          )}
        </button>
      </div>

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;