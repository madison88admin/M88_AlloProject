import { useState, useMemo, useEffect } from 'react';
import { Plus, Building2, RefreshCw, X, ChevronDown, Filter, Sun, Moon } from 'lucide-react';

import type { Column, SortConfig, Filters, DataRecord, ColumnVisibility } from './types';
import { useM88Data } from './hooks/useM88data';
import { updateFAAssignments, isFactoryColumn } from './utils/faAssignments';

// Components
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { SearchBar } from './components/SearchBar';
import { FiltersPanel } from './components/FiltersPanel';
import { DataTable } from './components/DataTable';
import { RecordModal } from './components/RecordModal';

// Account interface for user prop
interface Account {
  id: string;
  username: string;
  password: string;
  type: 'company' | 'factory' | 'admin';
  name: string;
  department?: string | null;
  facility?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// Professional color scheme for column groups
const GROUP_COLORS = {
  'Brand Info': {
    background: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-800',
    hover: 'hover:bg-primary-100',
    headerBg: 'bg-primary-100/50',
    cellBg: 'bg-primary-50/30',
    icon: 'text-primary-600',
    badge: 'badge-primary'
  },
  'Contact Person': {
    background: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-800',
    hover: 'hover:bg-success-100',
    headerBg: 'bg-success-100/50',
    cellBg: 'bg-success-50/30',
    icon: 'text-success-600',
    badge: 'badge-success'
  },
  'Flags': {
    background: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-800',
    hover: 'hover:bg-warning-100',
    headerBg: 'bg-warning-100/50',
    cellBg: 'bg-warning-50/30',
    icon: 'text-warning-600',
    badge: 'badge-warning'
  },
  'Factory Assignment': {
    background: 'bg-brand-purple/5',
    border: 'border-brand-purple/20',
    text: 'text-brand-purple',
    hover: 'hover:bg-brand-purple/10',
    headerBg: 'bg-brand-purple/10',
    cellBg: 'bg-brand-purple/5',
    icon: 'text-brand-purple',
    badge: 'bg-brand-purple/10 text-brand-purple'
  }
} as const;

// Utility functions for Yes/Blank handling
const normalizeYesBlankValue = (value: any): string => {
  if (!value || value === '' || value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value).toLowerCase().trim();
  if (stringValue === 'yes') {
    return 'Yes';
  }
  
  return '';
};

// Factory-specific column mapping function
const getFactorySpecificColumns = (username: string): string[] => {
  // Map factory usernames to their specific columns
  const factoryColumnMap: Record<string, string[]> = {
    'factory_Wuxi': ['fa_wuxi'],
    'factory_PTwuu': ['fa_pt'],
    'factory_Singfore': ['fa_singfore'],
    'factory_HeadsUp': ['fa_heads'],
    'factory_KoreaMel': ['fa_korea']
  };
  
  return factoryColumnMap[username] || [];
};

// Custom fields utilities
const getCustomFieldsFromData = (data: DataRecord[]): Column[] => {
  const customFieldsSet = new Set<string>();
  const customFieldsTypes: Record<string, { type: string; options?: string[] }> = {};
  
  data.forEach(record => {
    if (record.custom_fields && typeof record.custom_fields === 'object') {
      Object.entries(record.custom_fields).forEach(([key, value]) => {
        customFieldsSet.add(key);
        
        // Infer type from value
        if (typeof value === 'boolean') {
          customFieldsTypes[key] = { type: 'boolean' };
        } else if (Array.isArray(value)) {
          customFieldsTypes[key] = { type: 'select', options: value };
        } else {
          customFieldsTypes[key] = { type: 'text' };
        }
      });
    }
  });

  return Array.from(customFieldsSet).map(key => ({
    key: `custom_${key}`,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: customFieldsTypes[key]?.type as 'text' | 'select' | 'boolean' | 'yes_blank' || 'text',
    options: customFieldsTypes[key]?.options,
    width: '150px',
    custom: true
  }));
};

const M88DatabaseUI = ({ 
  tableType, 
  onLogout, 
  user 
}: { 
  tableType: 'company' | 'factory' | 'admin'; 
  onLogout: () => void; 
  user?: Account; 
}) => {
  const {
    loading,
    error,
    loadData,
    handleSaveRecord,
    handleDeleteRecord,
    handleAddRecord,
    handleRefreshData,
    getFilteredData,
    getUniqueValues,
    data // Add this to get the raw data
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
  const [customColumns, setCustomColumns] = useState<Column[]>([]);
  const [quickView, setQuickView] = useState<'company_essentials' | 'factory_essentials' | 'all' | 'custom'>('company_essentials');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Define base columns for all table types
  const baseCompanyColumns: Column[] = [
    { key: 'all_brand', label: 'All Brand', type: 'text', required: true, width: '150px' },
    { key: 'brand_visible_to_factory', label: 'Brands', type: 'text', width: '150px' },
    { key: 'brand_classification', label: 'Brand Classification', type: 'select', options: ['Top', 'Growth', 'Emerging', 'Maintain', 'Divest', 'Early Engagement', 'Growth/Divest'], width: '150px' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'In Development', 'On hold'], width: '150px' },
    { key: 'terms_of_shipment', label: 'Terms', type: 'select', options: ['FOB', 'LDP'], width: '120px' },
    { key: 'lead_pbd', label: 'Lead PBD', type: 'text', width: '150px' },
    { key: 'support_pbd', label: 'Support PBD', type: 'text', width: '150px' },
    { key: 'td', label: 'TD', type: 'text', width: '120px' },
    { key: 'nyo_planner', label: 'NYO Planner', type: 'text', width: '150px' },
    { key: 'indo_m88_md', label: 'Indo M88 MD', type: 'text', width: '150px' },
    { key: 'indo_m88_qa', label: 'Indo M88 QA', type: 'text', width: '120px' },
    { key: 'mlo_planner', label: 'MLO Planner', type: 'text', width: '150px' },
    { key: 'mlo_logistic', label: 'MLO Logistic', type: 'text', width: '150px' },
    { key: 'mlo_purchasing', label: 'MLO Purchasing', type: 'text', width: '150px' },
    { key: 'mlo_costing', label: 'MLO Costing', type: 'text', width: '120px' },
    { key: 'wuxi_moretti', label: 'Wuxi Moretti', type: 'yes_blank', width: '120px' },
    { key: 'hz_u_jump', label: 'HZ U-JUMP', type: 'yes_blank', width: '120px' },
    { key: 'pt_u_jump', label: 'PT U-JUMP', type: 'yes_blank', width: '120px' },
    { key: 'korea_mel', label: 'Korea Mel', type: 'yes_blank', width: '120px' },
    { key: 'singfore', label: 'Singfore', type: 'yes_blank', width: '120px' },
    { key: 'heads_up', label: 'Heads Up', type: 'yes_blank', width: '120px' },
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

  // Columns that should never be visible to any factory
  const alwaysExcludeForFactories = [
    'all_brand'
  ];

  const companyNonEditableKeys = [
    'hz_pt_u_jump_senior_md',
    'pt_ujump_local_md',
    'hz_u_jump_shipping',
    'pt_ujump_shipping'
  ];

  const factoryNonEditableKeys = [
    'brand_visible_to_factory',
    'brand_classification',
    'status',
    'terms_of_shipment',
    'wuxi_moretti',
    'hz_u_jump',
    'pt_u_jump',
    'korea_mel',
    'singfore',
    'heads_up'
  ];

  // Enhanced factory column function that handles factory-specific visibility
  const getFactoryColumns = (username: string): Column[] => {
    const factorySpecificColumns = getFactorySpecificColumns(username);
    
    // All factory assignment and flag columns
    const allFactoryColumns = [
      'fa_wuxi', 'fa_hz', 'fa_pt', 'fa_korea', 'fa_singfore', 'fa_heads',
      'wuxi_moretti', 'hz_u_jump', 'pt_u_jump', 'korea_mel', 'singfore', 'heads_up'
    ];
    
    return baseCompanyColumns.filter(col => {
      // Exclude columns that should never be visible to factories
      if (alwaysExcludeForFactories.includes(col.key)) {
        return false;
      }
      
      // For factory-specific columns, only include if it belongs to this factory
      if (allFactoryColumns.includes(col.key)) {
        return factorySpecificColumns.includes(col.key);
      }
      
      // Include all other columns
      return true;
    });
  };
  
  // Base factory columns (fallback when no user is provided)
  const baseFactoryColumns: Column[] = baseCompanyColumns.filter(
    col => !alwaysExcludeForFactories.includes(col.key)
  );

  // Admin gets all columns including custom ones
  const baseAdminColumns: Column[] = baseCompanyColumns;

  // Column order state - this will track the current order of columns
  const [companyColumnOrder, setCompanyColumnOrder] = useState<Column[]>(baseCompanyColumns);
  const [factoryColumnOrder, setFactoryColumnOrder] = useState<Column[]>(baseFactoryColumns);
  const [adminColumnOrder, setAdminColumnOrder] = useState<Column[]>(baseAdminColumns);

  // Extract custom fields from data and update columns
  useEffect(() => {
    if (data && data.length > 0) {
      const detectedCustomColumns = getCustomFieldsFromData(data);
      setCustomColumns(detectedCustomColumns);
      
      // Update column orders with custom columns based on table type and user permissions
      switch (tableType) {
        case 'company':
          // Company can see custom columns but cannot add new ones (unless user is admin type)
          if (user?.type === 'admin') {
            setCompanyColumnOrder([...baseCompanyColumns, ...detectedCustomColumns]);
          } else {
            setCompanyColumnOrder([...baseCompanyColumns, ...detectedCustomColumns]);
          }
          break;
        case 'factory':
          // Set factory-specific columns based on user
          const factoryColumns = user?.username ? getFactoryColumns(user.username) : baseFactoryColumns;
          setFactoryColumnOrder(factoryColumns);
          break;
        case 'admin':
          // Admin can see and add custom columns
          setAdminColumnOrder([...baseAdminColumns, ...detectedCustomColumns]);
          break;
      }
    }
  }, [data, tableType, user?.username]);

  // Use correct columns based on tableType and user permissions
  const columns = useMemo(() => {
    switch (tableType) {
      case 'company':
        return companyColumnOrder; // Base columns + custom columns (visibility based on user type)
      case 'factory':
        // Use factory-specific columns based on logged-in user
        const factoryColumns = user?.username ? getFactoryColumns(user.username) : factoryColumnOrder;
        return factoryColumns;
      case 'admin':
        return adminColumnOrder; // All columns + custom columns
      default:
        return companyColumnOrder;
    }
  }, [tableType, companyColumnOrder, factoryColumnOrder, adminColumnOrder, user?.username]);

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  // Define column groups for clarity
  const columnGroups: Record<string, string> = useMemo(() => ({
    brand_classification: 'Brand Info',
    status: 'Brand Info',
    terms_of_shipment: 'Brand Info',
    lead_pbd: 'Contact Person',
    support_pbd: 'Contact Person',
    td: 'Contact Person',
    nyo_planner: 'Contact Person',
    indo_m88_md: 'Contact Person',
    indo_m88_qa: 'Contact Person',
    mlo_planner: 'Contact Person',
    mlo_logistic: 'Contact Person',
    mlo_purchasing: 'Contact Person',
    mlo_costing: 'Contact Person',
    wuxi_moretti: 'Flags',
    hz_u_jump: 'Flags',
    pt_u_jump: 'Flags',
    korea_mel: 'Flags',
    singfore: 'Flags',
    heads_up: 'Flags',
    hz_pt_u_jump_senior_md: 'Factory Assignment',
    pt_ujump_local_md: 'Factory Assignment',
    hz_u_jump_shipping: 'Factory Assignment',
    pt_ujump_shipping: 'Factory Assignment',
    fa_wuxi: 'Factory Assignment',
    fa_hz: 'Factory Assignment',
    fa_pt: 'Factory Assignment',
    fa_korea: 'Factory Assignment',
    fa_singfore: 'Factory Assignment',
    fa_heads: 'Factory Assignment'
  }), []);

  // Helper function to get group colors
  const getGroupColors = (groupName: string) => {
    return GROUP_COLORS[groupName as keyof typeof GROUP_COLORS] || {
      background: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      hover: 'hover:bg-gray-100',
      headerBg: 'bg-gray-100/50',
      cellBg: 'bg-gray-50/30'
    };
  };

  useEffect(() => {
    localStorage.setItem('m88.quickView', quickView);
  }, [quickView]);

  useEffect(() => {
    localStorage.setItem('m88.collapsedGroups', JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle column reordering
  const handleColumnUpdate = (newColumns: Column[]) => {
    switch (tableType) {
      case 'company':
        setCompanyColumnOrder(newColumns);
        break;
      case 'factory':
        setFactoryColumnOrder(newColumns);
        break;
      case 'admin':
        setAdminColumnOrder(newColumns);
        break;
    }
  };

  // Enhanced data processing to flatten custom fields
  const processedData = useMemo(() => {
    return getFilteredData(searchTerm, filters).map(record => {
      const processedRecord = { ...record };
      
      // Flatten custom_fields into the main record object
      if (record.custom_fields && typeof record.custom_fields === 'object') {
        Object.entries(record.custom_fields).forEach(([key, value]) => {
          processedRecord[`custom_${key}`] = value;
        });
      }
      
      return processedRecord;
    });
  }, [getFilteredData, searchTerm, filters]);

  // Initialize column visibility when columns change  
  useEffect(() => {
    setColumnVisibility(prev => {
      const newVisibility: ColumnVisibility = {};
      columns.forEach((col) => {
        newVisibility[col.key] = true;
      });
      // Apply collapsed groups
      Object.entries(collapsedGroups).forEach(([groupName, isCollapsed]) => {
        if (!isCollapsed) return;
        columns.forEach(col => {
          if (columnGroups[col.key] === groupName) {
            newVisibility[col.key] = false;
          }
        });
      });
      return newVisibility;
    });
  }, [columns, tableType, collapsedGroups, columnGroups]);

  // Reset column order when table type changes
  useEffect(() => {
    switch (tableType) {
      case 'company':
        setCompanyColumnOrder([...baseCompanyColumns, ...customColumns]);
        break;
      case 'factory':
        // Use factory-specific columns
        const factoryColumns = user?.username ? getFactoryColumns(user.username) : baseFactoryColumns;
        setFactoryColumnOrder(factoryColumns);
        break;
      case 'admin':
        setAdminColumnOrder([...baseAdminColumns, ...customColumns]);
        break;
    }
  }, [tableType, customColumns, user?.username]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return processedData;
    
    return [...processedData].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? '';
      let bVal = b[sortConfig.key] ?? '';
      
      // Handle custom fields
      if (sortConfig.key.startsWith('custom_')) {
        const customKey = sortConfig.key.replace('custom_', '');
        aVal = a.custom_fields?.[customKey] ?? '';
        bVal = b.custom_fields?.[customKey] ?? '';
      }
      
      // Normalize yes_blank values for sorting
      const column = columns.find(col => col.key === sortConfig.key);
      if (column?.type === 'yes_blank') {
        aVal = normalizeYesBlankValue(aVal);
        bVal = normalizeYesBlankValue(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [processedData, sortConfig, columns]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await handleDeleteRecord(id);
    } catch (err) {
      alert('Failed to delete record. Please try again.');
    }
  };

  // Enhanced cell update handler for custom fields and yes_blank types
  const handleCellUpdate = async (rowId: number, columnKey: string, newValue: any) => {
    try {
      const currentRecord = sortedData.find(record => record.id === rowId);
      if (!currentRecord) return;

      let updatedRecord = { ...currentRecord };
      
      // Find the column to check its type
      const column = columns.find(col => col.key === columnKey);
      let finalValue = newValue;
      
      // Normalize yes_blank values
      if (column?.type === 'yes_blank') {
        finalValue = normalizeYesBlankValue(newValue);
      }

      if (columnKey.startsWith('custom_')) {
        // Handle custom field updates
        const customKey = columnKey.replace('custom_', '');
        const currentCustomFields = updatedRecord.custom_fields || {};
        
        updatedRecord = {
          ...updatedRecord,
          custom_fields: {
            ...currentCustomFields,
            [customKey]: finalValue
          }
        };
      } else {
        // Handle regular field updates
        updatedRecord[columnKey] = finalValue;
      }

      // Apply FA assignments if this is a factory column
      const finalRecord = isFactoryColumn(columnKey) 
        ? updateFAAssignments(updatedRecord)
        : updatedRecord;

      await handleSaveRecord(finalRecord);
      
    } catch (err) {
      alert('Failed to update record. Please try again.');
      console.error('Error updating record:', err);
    }
  };

  // Add custom column functionality - permissions based on table type and user
  const handleAddCustomColumn = async (columnData: { name: string; type: 'text' | 'select' | 'boolean' | 'yes_blank'; options?: string[] }) => {
    // Check permissions
    if (tableType === 'factory') {
      alert('Factory users cannot add custom columns.');
      return;
    }
    
    if (tableType === 'company' && user?.type !== 'admin') {
      alert('Only admin users can add custom columns.');
      return;
    }

    const customKey = columnData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Create new column definition
    const newColumn: Column = {
      key: `custom_${customKey}`,
      label: columnData.name,
      type: columnData.type,
      options: columnData.options,
      width: '150px',
      custom: true
    };

    // Update column orders based on permissions
    if (tableType === 'admin' || (tableType === 'company' && user?.type === 'admin')) {
      if (tableType === 'admin') {
        setAdminColumnOrder(prev => [...prev, newColumn]);
      } else {
        setCompanyColumnOrder(prev => [...prev, newColumn]);
      }
    }

    // Make new column visible
    setColumnVisibility(prev => ({
      ...prev,
      [`custom_${customKey}`]: true
    }));
  };

  // Enhanced save record handler that applies FA assignments and normalizes yes_blank values
  const handleEnhancedSaveRecord = async (record: DataRecord) => {
    try {
      // Normalize yes_blank values in the record
      const normalizedRecord = { ...record };
      columns.forEach(column => {
        if (column.type === 'yes_blank' && normalizedRecord[column.key] !== undefined) {
          normalizedRecord[column.key] = normalizeYesBlankValue(normalizedRecord[column.key]);
        }
      });

      const recordWithFAUpdates = updateFAAssignments(normalizedRecord);
      return await handleSaveRecord(recordWithFAUpdates);
    } catch (err) {
      throw err;
    }
  };

  // Enhanced add record handler that applies FA assignments and normalizes yes_blank values 
  const handleEnhancedAddRecord = async (record: Omit<DataRecord, 'id'>) => {
    try {
      // Normalize yes_blank values in the record
      const normalizedRecord = { ...record } as DataRecord;
      columns.forEach(column => {
        if (column.type === 'yes_blank' && normalizedRecord[column.key] !== undefined) {
          normalizedRecord[column.key] = normalizeYesBlankValue(normalizedRecord[column.key]);
        }
      });

      const recordWithFAUpdates = updateFAAssignments(normalizedRecord);
      return await handleAddRecord(recordWithFAUpdates);
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = async () => {
    try {
      await handleRefreshData();
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

  const getEditableColumns = (type: 'company' | 'factory' | 'admin') => {
    if (type === 'admin') {
      return columns.map(col => col.key);
    } 
    
    if (type === 'company') {
      if (user?.type === 'admin') {
        return columns.map(col => col.key);
      } else {
        return columns
          .filter(col => !companyNonEditableKeys.includes(col.key))
          .map(col => col.key);
      }
    } 
    
    if (type === 'factory') {
      // Let factories edit all except explicitly blocked
      return columns
        .filter(col => !factoryNonEditableKeys.includes(col.key))
        .map(col => col.key);
    }
  
    return [];
  };
  
  const editableColumns = getEditableColumns(tableType);

  // Get table type display name with user context
  const getTableTypeDisplayName = (type: 'company' | 'factory' | 'admin') => {
    const userInfo = user ? ` (${user.name})` : '';
    switch (type) {
      case 'company':
        return `Company Dashboard${userInfo}`;
      case 'factory':
        return `Factory Dashboard${userInfo}`;
      case 'admin':
        return `Admin View${userInfo}`;
      default:
        return `Unknown View${userInfo}`;
    }
  };

  // Determine if user can add custom columns
  const canAddCustomColumns = () => {
    if (tableType === 'factory') return false;
    if (tableType === 'admin') return true;
    if (tableType === 'company' && user?.type === 'admin') return true;
    return false;
  };

  // Helper to get columns by group
  const getColumnsByGroup = (groupName: string) => {
    return columns.filter(col => columnGroups[col.key] === groupName);
  };

  // Helper to get group summary
  const getGroupSummary = () => {
    const groups = Array.from(new Set(Object.values(columnGroups))).filter(Boolean);
    return groups.map(groupName => ({
      name: groupName,
      columns: getColumnsByGroup(groupName),
      visibleCount: getColumnsByGroup(groupName).filter(col => columnVisibility[col.key]).length,
      totalCount: getColumnsByGroup(groupName).length,
      colors: getGroupColors(groupName)
    }));
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50/30 to-brand-indigo/5 dark:from-secondary-900 dark:via-secondary-800/50 dark:to-secondary-900">
      {/* Professional Header */}
      <header className="glass border-b border-secondary-200/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-brand-indigo rounded-2xl flex items-center justify-center shadow-medium">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-success-500 rounded-full border-2 border-white animate-pulse-soft"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white tracking-tight truncate">M88 Account Allocation</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                  <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                    {getTableTypeDisplayName(tableType)}
                  </span>
                  <span className="hidden sm:inline w-1 h-1 bg-secondary-400 rounded-full"></span>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">Enterprise Brand Management</span>
                  <span className="hidden sm:inline w-1 h-1 bg-secondary-400 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-soft"></div>
                    <span className="text-sm text-success-600 dark:text-success-400 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="btn-ghost p-2 sm:p-3"
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={onLogout}
                className="btn-ghost text-error-600 hover:text-error-700 hover:bg-error-50 p-2 sm:p-3"
                title="Log out"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Log out</span>
              </button>
              <button 
                onClick={handleRefresh}
                className="btn-secondary p-2 sm:p-3"
                title="Refresh data from database"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </button>
              {tableType !== 'factory' && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary shadow-glow hover:shadow-glow-lg p-2 sm:p-3"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Add Record</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Compact Column Groups Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-4 mb-3 sm:mb-4">
        <div className="card-elevated p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-secondary-900 dark:text-white">Column Groups</h2>
            <div className="flex items-center gap-1.5 text-xs text-secondary-500 dark:text-secondary-400">
              <div className="w-1.5 h-1.5 bg-success-500 rounded-full"></div>
              <span>Organize your data view</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {getGroupSummary()
              .filter(group => !(tableType === 'factory' && group.name === 'Flags'))
              .map(group => {
                const isCollapsed = collapsedGroups[group.name];
                return (
                  <button
                    key={group.name}
                    onClick={() => {
                      setCollapsedGroups(prev => ({
                        ...prev,
                        [group.name]: !prev[group.name]
                      }));
                    }}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                      isCollapsed 
                        ? `bg-secondary-50 text-secondary-600 border-secondary-200 hover:bg-secondary-100 hover:border-secondary-300` 
                        : `${group.colors.background} ${group.colors.text} ${group.colors.border} ${group.colors.hover} shadow-soft hover:shadow-medium`
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      isCollapsed 
                        ? 'bg-secondary-400' 
                        : group.colors.background.replace('bg-', 'bg-').replace('-50', '-500')
                    }`} />
                    <span className="text-xs font-semibold">{group.name}</span>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${
                      isCollapsed 
                        ? 'bg-white text-secondary-600' 
                        : 'bg-white/90 text-secondary-700 shadow-soft'
                    }`}>
                      {group.visibleCount}/{group.totalCount}
                    </div>
                    <div className={`text-xs font-medium transition-all duration-200 ${
                      isCollapsed ? 'text-secondary-500' : 'text-secondary-600'
                    }`}>
                      {isCollapsed ? 'Hidden' : 'Visible'}
                    </div>
                    <div className={`ml-0.5 transition-transform duration-200 ${
                      isCollapsed ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Search and Filters */}
        <div className="space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
          />
          
          {showFilters && (
            <FiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              getUniqueValues={getUniqueValues}
              columns={columns}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              onColumnUpdate={handleColumnUpdate}
              onAddCustomColumn={canAddCustomColumns() ? handleAddCustomColumn : undefined}
              onClose={() => setShowFilters(false)}
              userRole={user?.type} // Add this line
              onSetQuickView={setQuickView}
              quickView={quickView}
              groupLabels={columnGroups}
              collapsedGroups={collapsedGroups}
              onToggleGroup={(groupName) => {
                setCollapsedGroups(prev => ({
                  ...prev,
                  [groupName]: !prev[groupName]
                }));
              }}
            />
          )}
        </div>

        {/* Professional Filter Summary */}
        {(searchTerm || filters.status || filters.brand_classification || filters.terms_of_shipment) && (
          <div className="card border-warning-200 bg-warning-50/50 p-4 mb-6 animate-slide-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-warning-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-warning-800">Active Filters</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {searchTerm && (
                      <span className="badge-warning">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {filters.status && (
                      <span className="badge-warning">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.brand_classification && (
                      <span className="badge-warning">
                        Class: {filters.brand_classification}
                      </span>
                    )}
                    {filters.terms_of_shipment && (
                      <span className="badge-warning">
                        Terms: {filters.terms_of_shipment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ status: '', brand_classification: '', terms_of_shipment: '' });
                }}
                className="btn-ghost text-warning-600 hover:text-warning-700 hover:bg-warning-100"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Professional Data Table */}
        <div className="card-elevated overflow-hidden">
          <DataTable
            data={sortedData}
            columns={columns.filter(col => columnVisibility[col.key])}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={setEditingRecord}
            onDelete={(record) => handleDelete(record.id)}
            onColumnUpdate={handleColumnUpdate}
            onCellUpdate={handleCellUpdate}
            editableColumns={editableColumns}
            tableType={tableType}
            groupLabels={Object.fromEntries(columns.map(c => [c.key, columnGroups[c.key] || '']))}
            groupColors={GROUP_COLORS} // Pass the color configuration
          />
        </div>
      </main>

      {/* Modals */}
      <RecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(record: DataRecord | Omit<DataRecord, 'id'>) => {
          if ('id' in (record as DataRecord)) {
            return handleEnhancedSaveRecord(record as DataRecord);
          }
          return handleEnhancedAddRecord(record as Omit<DataRecord, 'id'>);
        }}
        columns={columns}
        title="Add New Record"
      />

      <RecordModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={(record: DataRecord | Omit<DataRecord, 'id'>) => handleEnhancedSaveRecord(record as DataRecord)}
        record={editingRecord}
        columns={columns}
        title="Edit Record"
      />
    </div>
  );
};

export default M88DatabaseUI;