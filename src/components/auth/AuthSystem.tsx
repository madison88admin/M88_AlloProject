import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import type { UserRole } from '../../types'; 

interface AuthSystemProps {
  onLogin: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  onRegister: (email: string, password: string, name: string, role: UserRole, company: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

export const AuthSystem = ({ onLogin, onRegister, loading }: AuthSystemProps) => {
  const [isLogin, setIsLogin] = useState(true);

  const resetForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">M88 Database</h1>
          <p className="text-slate-600">Account Allocation Management System</p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8">
          {isLogin ? (
            <LoginForm 
              onLogin={onLogin}
              onSwitchToRegister={resetForm}
              loading={loading}
            />
          ) : (
            <RegisterForm 
              onRegister={onRegister}
              onSwitchToLogin={resetForm}
              loading={loading}
            />
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-amber-800 font-medium mb-2">Demo Credentials:</p>
          <div className="text-xs text-amber-700 space-y-1">
            <div><strong>Madison 88 Admin:</strong> admin@madison88.com / madison123</div>
            <div><strong>Madison 88 Manager:</strong> manager@madison88.com / manager123</div>
            <div><strong>Factory User:</strong> factory@supplier.com / factory123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;