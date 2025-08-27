import { useState, useMemo, useEffect } from 'react';
<<<<<<< HEAD
import { Plus, Download, Building2, Database, BarChart3, TrendingUp, Users, RefreshCw, Lock, Eye, EyeOff, UserPlus, LogIn, Factory, Building, Shield, User } from 'lucide-react';
=======
import { Plus, Download, Building2, RefreshCw } from 'lucide-react';
>>>>>>> 72986788e3c3252c3dd9d0e2e296e29770d7ed34

// Types
type UserRole = 'madison88' | 'factory';

<<<<<<< HEAD
type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  permissions: string[];
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: UserRole, company: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
};

// Mock user database with predefined roles
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@madison88.com',
    password: 'madison123',
    name: 'Madison Admin',
    role: 'madison88' as UserRole,
    company: 'Madison 88 Company',
    permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'export_data', 'analytics']
  },
  {
    id: 2,
    email: 'manager@madison88.com',
    password: 'manager123',
    name: 'Madison Manager',
    role: 'madison88' as UserRole,
    company: 'Madison 88 Company',
    permissions: ['view_all', 'edit_limited', 'export_data', 'analytics']
  },
  {
    id: 3,
    email: 'factory@supplier.com',
    password: 'factory123',
    name: 'Factory User',
    role: 'factory' as UserRole,
    company: 'Supplier Factory Ltd',
    permissions: ['view_assigned', 'edit_assigned', 'view_orders']
  }
];

// Authentication hook with RBAC
const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('m88_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('m88_user');
      }
    }
  }, []);
=======
// Components
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
// import { AnalyticsCard } from './components/AnalyticsCard';
import { SearchBar } from './components/SearchBar';
import { FiltersPanel } from './components/FiltersPanel';
import { DataTable } from './components/DataTable';
import { RecordModal } from './components/RecordModal';


const M88DatabaseUI = ({ tableType, onLogout }: { tableType: 'company' | 'factory', onLogout: () => void }) => {
  const {
    loading,
    error,
    loadData,
    handleSaveRecord,
    handleDeleteRecord,
    handleAddRecord,
    handleRefreshData,
    getFilteredData,
    getUniqueValues
  } = useM88Data();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    brand_classification: '',
    terms_of_shipment: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Define columns for both table types
  const companyColumns: Column[] = [
    { key: 'all_brand', label: 'All Brand', type: 'text', required: true, width: '150px' },
    { key: 'brand_visible_to_factory', label: 'Brand Visible to Factory', type: 'text', width: '150px' },
    { key: 'brand_classification', label: 'Brand Classification', type: 'select', options: ['Top', 'Growth', 'Emerging', 'Maintain', 'Divest', 'Early Engagement', 'Growth/Divest'], width: '150px' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'In Development', 'On hold'], width: '150px' },
    { key: 'terms_of_shipment', label: 'Terms', type: 'select', options: ['FOB', 'LDP'], width: '120px' },
    { key: 'lead_pbd', label: 'Lead PBD', type: 'text', width: '150px' },
    { key: 'support_pbd', label: 'Support PBD', type: 'text', width: '150px' },
    { key: 'td', label: 'TD', type: 'text', width: '120px' },
    { key: 'nyo_planner', label: 'NYO Planner', type: 'text', width: '150px' },
    { key: 'indo_m88_md', label: 'Indo M88 MD', type: 'text', width: '150px' },
    { key: 'm88_qa', label: 'M88 QA', type: 'text', width: '120px' },
    { key: 'mlo_planner', label: 'MLO Planner', type: 'text', width: '150px' },
    { key: 'mlo_logistic', label: 'MLO Logistic', type: 'text', width: '150px' },
    { key: 'mlo_purchasing', label: 'MLO Purchasing', type: 'text', width: '150px' },
    { key: 'mlo_costing', label: 'MLO Costing', type: 'text', width: '120px' },
    { key: 'wuxi_moretti', label: 'Wuxi Moretti', type: 'text', width: '120px' },
    { key: 'hz_u_jump', label: 'HZ U-JUMP', type: 'text', width: '120px' },
    { key: 'pt_u_jump', label: 'PT U-JUMP', type: 'text', width: '120px' },
    { key: 'korea_mel', label: 'Korea Mel', type: 'text', width: '120px' },
    { key: 'singfore', label: 'Singfore', type: 'text', width: '120px' },
    { key: 'heads_up', label: 'Heads Up', type: 'text', width: '120px' },
    { key: 'hz_pt_u_jump_senior_md', label: 'HZ/PT U-JUMP Senior MD', type: 'text', width: '180px' },
    { key: 'pt_ujump_local_md', label: 'PT UJUMP Local MD', type: 'text', width: '150px' },
    { key: 'hz_u_jump_shipping', label: 'HZ U-JUMP Shipping', type: 'text', width: '150px' },
    { key: 'pt_ujump_shipping', label: 'PT UJUMP Shipping', type: 'text', width: '150px' },
    { key: 'fa_wuxi', label: 'FA Wuxi', type: 'text', width: '120px' },
    { key: 'fa_hz', label: 'FA HZ', type: 'text', width: '120px' },
    { key: 'fa_pt', label: 'FA PT', type: 'text', width: '120px' },
    { key: 'fa_korea', label: 'FA Korea', type: 'text', width: '120px' },
    { key: 'fa_singfore', label: 'FA Singfore', type: 'text', width: '120px' },
    { key: 'fa_heads', label: 'FA Heads', type: 'text', width: '120px' },
  ];
  const factoryColumns: Column[] = companyColumns.filter(col => col.key !== 'all_brand');

  // Use correct columns based on tableType
  const columns = tableType === 'company' ? companyColumns : factoryColumns;
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const filteredData = getFilteredData(searchTerm, filters);

  // Initialize column visibility when columns change
  useEffect(() => {
    setColumnVisibility(prev => {
      const newVisibility: ColumnVisibility = {};
      columns.forEach((col, index) => {
        newVisibility[col.key] = prev[col.key] !== undefined ? prev[col.key] : index < 8;
      });
      return newVisibility;
    });
  }, [columns]);
>>>>>>> 72986788e3c3252c3dd9d0e2e296e29770d7ed34

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password && u.role === role
      );
      
      if (!foundUser) {
        return { success: false, error: 'Invalid credentials or incorrect role selection' };
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('m88_user', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole, company: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Define permissions based on role
      const permissions = role === 'madison88' 
        ? ['view_all', 'edit_limited', 'export_data']
        : ['view_assigned', 'edit_assigned'];

      const newUser: User = {
        id: Date.now(),
        email,
        name,
        role,
        company,
        permissions
      };

      setUser(newUser);
      localStorage.setItem('m88_user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('m88_user');
  };

  return { user, login, register, logout, loading };
};

// Role Selection Component
const RoleSelector = ({ selectedRole, onRoleChange, disabled }: {
  selectedRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 mb-3">
        Select User Type
      </label>
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => onRoleChange('madison88')}
          disabled={disabled}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left disabled:opacity-50 ${
            selectedRole === 'madison88'
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedRole === 'madison88' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">Madison 88 Company</div>
              <div className="text-sm opacity-75">Full system access with management capabilities</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onRoleChange('factory')}
          disabled={disabled}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left disabled:opacity-50 ${
            selectedRole === 'factory'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
              : 'border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedRole === 'factory' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">Factory User</div>
              <div className="text-sm opacity-75">Limited access to assigned brands and orders</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

// Enhanced Login/Register Component with RBAC
const AuthScreen = ({ onLogin, onRegister, loading }: {
  onLogin: (email: string, password: string, role: UserRole) => Promise<any>;
  onRegister: (email: string, password: string, name: string, role: UserRole, company: string) => Promise<any>;
  loading: boolean;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!selectedRole) {
      setError('Please select a user type');
      return;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!formData.company.trim()) {
        setError('Company name is required');
        return;
      }
    }

    const result = isLogin 
      ? await onLogin(formData.email, formData.password, selectedRole)
      : await onRegister(formData.email, formData.password, formData.name, selectedRole, formData.company);

    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSelectedRole(null);
    setFormData({ email: '', password: '', name: '', company: '', confirmPassword: '' });
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

        {/* Auth Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Sign In
            </button>
            <button
              type="button"
              onClick={resetForm}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
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

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={selectedRole === 'madison88' ? 'Madison 88 Company' : 'Factory/Supplier Company'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

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
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedRole}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
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

// Permission-based component wrapper
const PermissionGuard = ({ 
  children, 
  permission, 
  user, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  permission: string; 
  user: User; 
  fallback?: React.ReactNode; 
}) => {
  if (user.permissions.includes(permission)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};

// Enhanced Analytics Card with role-based visibility
const AnalyticsCard = ({ title, value, icon, color, permission, user }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  permission?: string;
  user: User;
}) => {
  if (permission && !user.permissions.includes(permission)) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const config = {
    madison88: {
      label: 'Madison 88',
      icon: <Building className="w-3 h-3" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    factory: {
      label: 'Factory',
      icon: <Factory className="w-3 h-3" />,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  };

  const { label, icon, color } = config[role];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${color}`}>
      {icon}
      {label}
    </span>
  );
};

// Main Dashboard with RBAC
const MainDashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock analytics data filtered by role
  const getAnalytics = () => {
    if (user.role === 'madison88') {
      return {
        total: 156,
        active: 89,
        filtered: 45
      };
    } else {
      return {
        total: 12,
        active: 8,
        filtered: 5
      };
    }
  };

<<<<<<< HEAD
  const analytics = getAnalytics();
=======
  // Enhanced save record handler that applies FA assignments
  const handleEnhancedSaveRecord = async (record: DataRecord) => {
    try {
      // Apply FA assignment logic before saving
      const recordWithFAUpdates = updateFAAssignments(record);
      return await handleSaveRecord(recordWithFAUpdates);
    } catch (err) {
      throw err; // Re-throw so the caller can handle it
    }
  };

  // Enhanced add record handler that applies FA assignments  
  const handleEnhancedAddRecord = async (record: Omit<DataRecord, 'id'>) => {
    try {
      // Apply FA assignment logic before adding
      const recordWithFAUpdates = updateFAAssignments(record as DataRecord);
      return await handleAddRecord(recordWithFAUpdates);
    } catch (err) {
      throw err; // Re-throw so the caller can handle it
    }
  };

  const handleRefresh = async () => {
    try {
      await handleRefreshData();
      // Clear filters and search after refresh
      setSearchTerm('');
      setFilters({
        status: '',
        brand_classification: '',
        terms_of_shipment: ''
      });
      setSortConfig({ key: '', direction: '' });
    } catch (err) {
      alert('Failed to refresh data. Please try again.');
    }
  };

  // Add a helper to determine editable columns for factory
  const getEditableColumns = (type: 'company' | 'factory') => {
    if (type === 'company') return companyColumns.map(col => col.key); // all editable for company
    // Only allow editing for columns with keys starting with these prefixes
    return factoryColumns
      .filter(col =>
        col.key.startsWith('hz_pt_') ||
        col.key.startsWith('pt_') ||
        col.key.startsWith('hz_u_') ||
        col.key.startsWith('pt_u_')
      )
      .map(col => col.key);
  };
  const editableColumns = getEditableColumns(tableType);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadData} />;
>>>>>>> 72986788e3c3252c3dd9d0e2e296e29770d7ed34

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">M88 Account Allocation</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-700">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.company}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
=======
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 border border-red-200"
                title="Log out"
              >
                Log out
              </button>
              <button 
                onClick={handleRefresh}
>>>>>>> 72986788e3c3252c3dd9d0e2e296e29770d7ed34
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <Lock className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Analytics Cards - Role Based */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*
          <AnalyticsCard
            title={user.role === 'madison88' ? 'Total Records' : 'Assigned Brands'}
            value={analytics.total}
            icon={<Database className="w-5 h-5" />}
            color="blue"
            user={user}
          />
          <AnalyticsCard
            title="Active Brands"
            value={analytics.active}
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
            user={user}
          />
          <AnalyticsCard
            title="Filtered Results"
            value={analytics.filtered}
            icon={<Users className="w-5 h-5" />}
            color="amber"
            permission="analytics"
            user={user}
          />
          */}
        </div>

<<<<<<< HEAD
        {/* Search and Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={user.role === 'madison88' ? "Search all records..." : "Search assigned brands..."}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
        {/* Search and Filters */}
        <div className="space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            recordCount={filteredData.length}
            onRefresh={loadData}
          />
          
          {showFilters && (
            <FiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              getUniqueValues={getUniqueValues}
              columns={columns}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              onClose={() => setShowFilters(false)}
>>>>>>> 72986788e3c3252c3dd9d0e2e296e29770d7ed34
            />
            <PermissionGuard permission="export_data" user={user}>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Download className="w-4 h-4" />
                Export
              </button>
            </PermissionGuard>
            <PermissionGuard permission="edit_all" user={user}>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </PermissionGuard>
          </div>
        </div>

<<<<<<< HEAD
        {/* Role-based Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              {user.role === 'madison88' ? (
                <Building className="w-8 h-8 text-slate-600" />
              ) : (
                <Factory className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {user.role === 'madison88' ? 'Madison 88 Dashboard' : 'Factory Portal'}
            </h3>
            <p className="text-slate-600 mb-4">
              {user.role === 'madison88' 
                ? 'Full access to all brand allocations and system management'
                : 'Limited access to your assigned brands and orders'
              }
            </p>
            <div className="bg-slate-50 rounded-xl p-4 text-left max-w-md mx-auto">
              <h4 className="font-medium text-slate-900 mb-2">Your Permissions:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {user.permissions.map(permission => (
                  <li key={permission} className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-green-500" />
                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>
          </div>
=======
        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
          <DataTable
            data={sortedData}
            columns={columns.filter(col => columnVisibility[col.key])}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={setEditingRecord}
            onDelete={(record) => handleDelete(record.id)}
            onCellUpdate={handleCellUpdate}
            editableColumns={editableColumns}
          />
>>>>>>> 72986788e3c3252c3dd9d0e2e296e29770d7ed34
        </div>
      </main>
    </div>
  );
};

// Main App Component with Enhanced RBAC
const M88DatabaseUI = () => {
  const { user, login, register, logout, loading } = useAuth();

  // Show auth screen if user is not logged in
  if (!user) {
    return (
      <AuthScreen
        onLogin={login}
        onRegister={register}
        loading={loading}
      />
    );
  }

  // Show main dashboard if user is logged in
  return <MainDashboard user={user} onLogout={logout} />;
};

export default M88DatabaseUI;