import { useState } from 'react';
import { Plus, Download, Building2, Database, TrendingUp, Users, Lock, Building, Factory, Shield } from 'lucide-react';
import type { User } from '../../types'; // Fixed import - now using updated types

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

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

// Analytics Card Component
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
const RoleBadge = ({ role }: { role: User['role'] }) => {
  // Fixed role configuration with proper typing
  const config: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    madison88: {
      label: 'Madison 88',
      icon: <Building className="w-3 h-3" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    factory: {
      label: 'Factory',
      icon: <Factory className="w-3 h-3" />,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    admin: {
      label: 'Admin',
      icon: <Shield className="w-3 h-3" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    manager: {
      label: 'Manager',
      icon: <Users className="w-3 h-3" />,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    factory_user: {
      label: 'Factory User',
      icon: <Factory className="w-3 h-3" />,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    viewer: {
      label: 'Viewer',
      icon: <Users className="w-3 h-3" />,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  // Fixed indexing issue with fallback
  const roleConfig = config[role] || config.viewer;
  const { label, icon, color } = roleConfig;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${color}`}>
      {icon}
      {label}
    </span>
  );
};

// User Profile Component
const UserProfile = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  return (
    <div className="flex items-center gap-3">
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
        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
        title="Logout"
      >
        <Lock className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
};

// Main Dashboard Component
export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock analytics data filtered by role
  const getAnalytics = () => {
    if (user.role === 'madison88' || user.role === 'admin' || user.role === 'manager') {
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

  const analytics = getAnalytics();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRecord = () => {
    // TODO: Implement add record functionality
    console.log('Add record clicked');
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log('Export data clicked');
  };

  // Check if user has admin-level access
  const isAdminLevel = ['madison88', 'admin', 'manager'].includes(user.role);

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
            <UserProfile user={user} onLogout={onLogout} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Analytics Cards - Role Based */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            title={isAdminLevel ? 'Total Records' : 'Assigned Brands'}
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
        </div>

        {/* Search and Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={isAdminLevel ? "Search all records..." : "Search assigned brands..."}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <PermissionGuard permission="export_data" user={user}>
              <button 
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </PermissionGuard>
            <PermissionGuard permission="edit_all" user={user}>
              <button 
                onClick={handleAddRecord}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Role-based Content Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              {isAdminLevel ? (
                <Building className="w-8 h-8 text-slate-600" />
              ) : (
                <Factory className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {isAdminLevel ? 'Management Dashboard' : 'Factory Portal'}
            </h3>
            <p className="text-slate-600 mb-4">
              {isAdminLevel 
                ? 'Full access to all brand allocations and system management'
                : 'Limited access to your assigned brands and orders'
              }
            </p>
            
            {/* User Permissions Display */}
            <div className="bg-slate-50 rounded-xl p-4 text-left max-w-md mx-auto mb-6">
              <h4 className="font-medium text-slate-900 mb-2">Your Permissions:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {user.permissions.map((permission: string) => (
                  <li key={permission} className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-green-500" />
                    {permission.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Table Placeholder - Replace with your actual DataTable component */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-slate-900 mb-3">Data Table Area</h4>
              <p className="text-slate-600 text-sm mb-4">
                Replace this section with your existing DataTable component from:
                <code className="bg-slate-100 px-2 py-1 rounded text-xs ml-1">
                  src/components/DataTable.tsx
                </code>
              </p>
              
              {/* Integration Instructions */}
              <div className="bg-white/80 rounded-lg p-4 text-xs text-left">
                <div className="font-medium text-slate-800 mb-2">Integration Steps:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Import your DataTable component</li>
                  <li>Pass the <code className="bg-slate-100 px-1 rounded">user</code> prop for role-based filtering</li>
                  <li>Use <code className="bg-slate-100 px-1 rounded">PermissionGuard</code> for conditional features</li>
                  <li>Filter data based on user.role (admin/manager vs factory/viewer)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Role-Specific Content */}
        {isAdminLevel && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Management Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PermissionGuard permission="manage_users" user={user}>
                <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left">
                  <div className="font-medium text-slate-900">User Management</div>
                  <div className="text-sm text-slate-600">Manage factory user access</div>
                </button>
              </PermissionGuard>
              
              <PermissionGuard permission="analytics" user={user}>
                <button className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-left">
                  <div className="font-medium text-slate-900">Advanced Analytics</div>
                  <div className="text-sm text-slate-600">Detailed reporting dashboard</div>
                </button>
              </PermissionGuard>
              
              <PermissionGuard permission="export_data" user={user}>
                <button className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-left">
                  <div className="font-medium text-slate-900">Bulk Operations</div>
                  <div className="text-sm text-slate-600">Import/export data in bulk</div>
                </button>
              </PermissionGuard>
            </div>
          </div>
        )}

        {['factory', 'factory_user', 'viewer'].includes(user.role) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Factory Portal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="font-medium text-slate-900 mb-2">Assigned Brands</div>
                <div className="text-sm text-slate-600">View and manage your assigned brand allocations</div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="font-medium text-slate-900 mb-2">Order Status</div>
                <div className="text-sm text-slate-600">Track current and upcoming orders</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;