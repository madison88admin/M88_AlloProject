import { Building2, Factory, Shield, Users, Eye, Crown } from 'lucide-react';
import type { UserRole } from '../../types';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
}

// Role configuration with icons and descriptions - Updated to include all roles
const roleConfig = {
  admin: {
    icon: Shield,
    label: 'Admin',
    description: 'Full system access and user management',
    color: 'border-purple-200 bg-purple-50 text-purple-900 hover:border-purple-300',
    selectedColor: 'border-purple-500 bg-purple-100 text-purple-900 ring-2 ring-purple-500/20',
    company: 'System Admin'
  },
  manager: {
    icon: Building2,
    label: 'Manager',
    description: 'Manage allocations and view reports',
    color: 'border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300',
    selectedColor: 'border-blue-500 bg-blue-100 text-blue-900 ring-2 ring-blue-500/20',
    company: 'Management'
  },
  factory_user: {
    icon: Factory,
    label: 'Factory User',
    description: 'View assigned brands and orders',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300',
    selectedColor: 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500/20',
    company: 'Factory Partner'
  },
  viewer: {
    icon: Eye,
    label: 'Viewer',
    description: 'Read-only access to data',
    color: 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300',
    selectedColor: 'border-gray-500 bg-gray-100 text-gray-900 ring-2 ring-gray-500/20',
    company: 'External Partner'
  },
  madison88: {
    icon: Crown,
    label: 'Madison 88',
    description: 'Madison 88 company access with full permissions',
    color: 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300',
    selectedColor: 'border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-500/20',
    company: 'Madison 88'
  },
  factory: {
    icon: Factory,
    label: 'Factory',
    description: 'Factory-specific access and operations',
    color: 'border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-300',
    selectedColor: 'border-teal-500 bg-teal-100 text-teal-900 ring-2 ring-teal-500/20',
    company: 'Factory Operations'
  }
} as const;

export const RoleSelector = ({ selectedRole, onRoleChange, disabled = false }: RoleSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Select User Type
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon;
          const isSelected = selectedRole === role;
          
          return (
            <button
              key={role}
              type="button"
              onClick={() => onRoleChange(role as UserRole)}
              disabled={disabled}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected ? config.selectedColor : config.color}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">
                    {config.label}
                  </div>
                  <div className="text-xs opacity-75 leading-relaxed">
                    {config.description}
                  </div>
                  <div className="text-xs opacity-60 mt-1 font-medium">
                    {config.company}
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-xs font-medium opacity-75">
                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Demo credentials hint */}
      {selectedRole && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="text-xs text-amber-800">
            <div className="font-medium mb-1">Demo Credentials for {roleConfig[selectedRole].label}:</div>
            <div className="space-y-1 text-amber-700">
              {selectedRole === 'admin' && (
                <div><strong>Email:</strong> admin@system.com | <strong>Password:</strong> admin123</div>
              )}
              {selectedRole === 'manager' && (
                <div><strong>Email:</strong> manager@company.com | <strong>Password:</strong> manager123</div>
              )}
              {selectedRole === 'factory_user' && (
                <div><strong>Email:</strong> factory@supplier.com | <strong>Password:</strong> factory123</div>
              )}
              {selectedRole === 'viewer' && (
                <div><strong>Email:</strong> viewer@partner.com | <strong>Password:</strong> viewer123</div>
              )}
              {selectedRole === 'madison88' && (
                <div><strong>Email:</strong> user@madison88.com | <strong>Password:</strong> madison123</div>
              )}
              {selectedRole === 'factory' && (
                <div><strong>Email:</strong> operations@factory.com | <strong>Password:</strong> factory123</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;