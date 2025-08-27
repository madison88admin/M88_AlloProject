import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, User, Building2 } from 'lucide-react';
import M88DatabaseUI from '../App';

// Mock user database - in real app this would be server-side
const users = [
  { id: 1, username: 'john.doe', password: 'company123', type: 'company', name: 'John Doe', department: 'Operations' },
  { id: 2, username: 'sarah.admin', password: 'admin456', type: 'company', name: 'Sarah Wilson', department: 'Management' },
  { id: 3, username: 'mike.factory', password: 'factory789', type: 'factory', name: 'Mike Johnson', facility: 'Plant A' },
  { id: 4, username: 'lisa.operator', password: 'operator321', type: 'factory', name: 'Lisa Chen', facility: 'Plant B' },
  { id: 5, username: 'demo', password: 'demo', type: 'company', name: 'Demo User', department: 'Demo' }
];

type UserType = typeof users[number];

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<UserType | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setAuthenticatedUser(user);
      setError('');
    } else {
      setError('Invalid username or password');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  if (authenticatedUser) {
    return (
      <M88DatabaseUI tableType={authenticatedUser.type as 'company' | 'factory'} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Building2 className="w-12 h-12 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-900">M88 Allocation</h1>
        </div>
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
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-700 mb-2">Demo Credentials:</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <div><strong>Company:</strong> demo / demo</div>
            <div><strong>Company:</strong> john.doe / company123</div>
            <div><strong>Factory:</strong> mike.factory / factory789</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;