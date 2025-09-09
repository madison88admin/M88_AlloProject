import { useState, useMemo, useEffect } from 'react';
import { Plus, RefreshCw, X, ChevronDown, Filter, Activity } from 'lucide-react';

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
import UserLogs from './components/UserLogs';

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
    'factory_WuxiSingfore': ['fa_wuxi', 'fa_singfore', 'wuxi_jump_senior_md', 'wuxi_shipping', 'wuxi_trims_coordinator', 'wuxi_label_coordinator', 'singfore_jump_senior_md', 'singfore_shipping', 'singfore_trims_coordinator', 'singfore_label_coordinator'],
    'factory_PTuwuHzuUjump': ['fa_pt_uwu', 'fa_hz_u', 'hz_pt_u_jump_senior_md', 'hz_u_jump_shipping', 'pt_ujump_shipping', 'hz_pt_ujump_trims_coordinator', 'hz_pt_ujump_label_coordinator'],
    'factory_HeadsUp': ['fa_heads_up', 'headsup_senior_md', 'headsup_shipping', 'headsup_trims_coordinator', 'headsup_label_coordinator'],
    'factory_KoreaMel': ['fa_korea_m', 'koreamel_jump_senior_md', 'koreamel_shipping', 'koreamel_trims_coordinator', 'koreamel_label_coordinator']
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
  const [showUserLogs, setShowUserLogs] = useState(false);
  const [showInactiveRecords, setShowInactiveRecords] = useState(false);

  const {
    loading,
    error,
    loadData,
    handleSaveRecord,
    handleDeleteRecord,
    handleAddRecord,
    handleRefreshData,
    getUniqueValues,
    data // Add this to get the raw data
  } = useM88Data(user, showInactiveRecords);

  // Define base columns for all table types
  const baseCompanyColumns: Column[] = [
    { key: 'all_brand', label: 'All Brand', type: 'text', required: true, width: '150px' },
    { key: 'brand_visible_to_factory', label: 'Brands', type: 'text', width: '150px' },
    { key: 'brand_classification', label: 'Brand Classification', type: 'select', options: ['Top', 'Growth', 'Emerging', 'Maintain', 'Divest', 'Early Engagement', 'Growth/Divest'], width: '150px' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'In Development'], width: '150px' },
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
    { key: 'hz_u_jump_shipping', label: 'HZ U-JUMP Shipping', type: 'text', width: '150px' },
    { key: 'pt_ujump_shipping', label: 'PT UJUMP Shipping', type: 'text', width: '150px' },
    { key: 'wuxi_jump_senior_md', label: 'Wuxi Jump Senior MD', type: 'text', width: '180px' },
    { key: 'wuxi_shipping', label: 'Wuxi Shipping', type: 'text', width: '150px' },
    { key: 'singfore_jump_senior_md', label: 'Singfore Jump Senior MD', type: 'text', width: '180px' },
    { key: 'singfore_shipping', label: 'Singfore Shipping', type: 'text', width: '150px' },
    { key: 'koreamel_jump_senior_md', label: 'KoreaMel Jump Senior MD', type: 'text', width: '180px' },
    { key: 'koreamel_shipping', label: 'KoreaMel Shipping', type: 'text', width: '150px' },
    { key: 'headsup_senior_md', label: 'HeadsUp Senior MD', type: 'text', width: '180px' },
    { key: 'headsup_shipping', label: 'HeadsUp Shipping', type: 'text', width: '150px' },
    { key: 'fa_wuxi', label: 'FA Wuxi(Wuxi)', type: 'text', width: '120px' },
    { key: 'fa_hz_u', label: 'FA HZ(HZ-U)', type: 'text', width: '120px' },
    { key: 'fa_pt_uwu', label: 'FA PT(PT-UWU)', type: 'text', width: '120px' },
    { key: 'fa_korea_m', label: 'FA Korea(Korea-M)', type: 'text', width: '120px' },
    { key: 'fa_singfore', label: 'FA Singfore(Singfore)', type: 'text', width: '120px' },
    { key: 'fa_heads_up', label: 'FA Heads(Heads Up)', type: 'text', width: '120px' },
    { key: 'wuxi_trims_coordinator', label: 'Wuxi Trims Coordinator', type: 'text', width: '180px' },
    { key: 'wuxi_label_coordinator', label: 'Wuxi Label Coordinator', type: 'text', width: '180px' },
    { key: 'singfore_trims_coordinator', label: 'Singfore Trims Coordinator', type: 'text', width: '180px' },
    { key: 'singfore_label_coordinator', label: 'Singfore Label Coordinator', type: 'text', width: '180px' },
    { key: 'headsup_trims_coordinator', label: 'HeadsUp Trims Coordinator', type: 'text', width: '180px' },
    { key: 'headsup_label_coordinator', label: 'HeadsUp Label Coordinator', type: 'text', width: '180px' },
    { key: 'hz_pt_ujump_trims_coordinator', label: 'HZ/PT U-JUMP Trims Coordinator', type: 'text', width: '200px' },
    { key: 'hz_pt_ujump_label_coordinator', label: 'HZ/PT U-JUMP Label Coordinator', type: 'text', width: '200px' },
    { key: 'koreamel_trims_coordinator', label: 'KoreaMel Trims Coordinator', type: 'text', width: '180px' },
    { key: 'koreamel_label_coordinator', label: 'KoreaMel Label Coordinator', type: 'text', width: '180px' },
  ];

  // Columns that should never be visible to any factory
  const alwaysExcludeForFactories = [
    'all_brand'
  ];

  const companyNonEditableKeys = [
      'fa_wuxi', 'fa_hz_u', 'fa_pt_uwu', 'fa_korea_m', 'fa_singfore', 'fa_heads_up',
 
      'hz_pt_u_jump_senior_md', 'hz_u_jump_shipping', 'pt_ujump_shipping',
      'wuxi_jump_senior_md', 'wuxi_shipping',
      'singfore_jump_senior_md', 'singfore_shipping',
      'koreamel_jump_senior_md', 'koreamel_shipping',
      'headsup_senior_md', 'headsup_shipping',
      'wuxi_trims_coordinator', 'wuxi_label_coordinator',
      'singfore_trims_coordinator', 'singfore_label_coordinator',
      'headsup_trims_coordinator', 'headsup_label_coordinator',
      'hz_pt_ujump_trims_coordinator', 'hz_pt_ujump_label_coordinator',
      'koreamel_trims_coordinator', 'koreamel_label_coordinator'
 //   'pt_ujump_local_md',
 //   'wuxi_local_md',
 //   'singfore_local_md',
 //   'koreamel_local_md',
 //   'headsup_local_md',

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
    
    // Debug logging (commented out for production)
    
    // All factory assignment, flag, and new factory-specific columns
    const allFactoryColumns = [
      'fa_wuxi', 'fa_hz_u', 'fa_pt_uwu', 'fa_korea_m', 'fa_singfore', 'fa_heads_up',
      'wuxi_moretti', 'hz_u_jump', 'pt_u_jump', 'korea_mel', 'singfore', 'heads_up',
      'hz_pt_u_jump_senior_md', 'hz_u_jump_shipping', 'pt_ujump_shipping',
      'wuxi_jump_senior_md', 'wuxi_shipping',
      'singfore_jump_senior_md', 'singfore_shipping',
      'koreamel_jump_senior_md', 'koreamel_shipping',
      'headsup_senior_md', 'headsup_shipping',
      'wuxi_trims_coordinator', 'wuxi_label_coordinator',
      'singfore_trims_coordinator', 'singfore_label_coordinator',
      'headsup_trims_coordinator', 'headsup_label_coordinator',
      'hz_pt_ujump_trims_coordinator', 'hz_pt_ujump_label_coordinator',
      'koreamel_trims_coordinator', 'koreamel_label_coordinator'
    ];
    
    const filteredColumns = baseCompanyColumns.filter(col => {
      // Exclude columns that should never be visible to factories
      if (alwaysExcludeForFactories.includes(col.key)) {
        return false;
      }
      
      // For factory-specific columns, only include if it belongs to this factory
      if (allFactoryColumns.includes(col.key)) {
        return factorySpecificColumns.includes(col.key);
      }
      
      // Include all other columns (standard columns like contact person, etc.)
      return true;
    });
    
    
    return filteredColumns;
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
    let baseColumns;
    switch (tableType) {
      case 'company':
        baseColumns = companyColumnOrder; // Base columns + custom columns (visibility based on user type)
        break;
      case 'factory':
        // Use factory-specific columns based on logged-in user
        baseColumns = user?.username ? getFactoryColumns(user.username) : factoryColumnOrder;
        break;
      case 'admin':
        baseColumns = adminColumnOrder; // All columns + custom columns
        break;
      default:
        baseColumns = companyColumnOrder;
    }


    // Update status column options based on showInactiveRecords toggle
    return baseColumns.map(col => {
      if (col.key === 'status' && (tableType === 'company' || tableType === 'admin')) {
        return {
          ...col,
          options: showInactiveRecords ? ['Active', 'In Development', 'Inactive'] : ['Active', 'In Development']
        };
      }
      return col;
    });
  }, [tableType, companyColumnOrder, factoryColumnOrder, adminColumnOrder, user?.username, showInactiveRecords]);

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
    hz_u_jump_shipping: 'Factory Assignment',
    pt_ujump_shipping: 'Factory Assignment',
    wuxi_jump_senior_md: 'Factory Assignment',
    wuxi_shipping: 'Factory Assignment',
    singfore_jump_senior_md: 'Factory Assignment',
    singfore_shipping: 'Factory Assignment',
    koreamel_jump_senior_md: 'Factory Assignment',
    koreamel_shipping: 'Factory Assignment',
    headsup_senior_md: 'Factory Assignment',
    headsup_shipping: 'Factory Assignment',
    fa_wuxi: 'Factory Assignment',
    fa_hz_u: 'Factory Assignment',
    fa_pt_uwu: 'Factory Assignment',
    fa_korea_m: 'Factory Assignment',
    fa_singfore: 'Factory Assignment',
    fa_heads_up: 'Factory Assignment',
    wuxi_trims_coordinator: 'Factory Assignment',
    wuxi_label_coordinator: 'Factory Assignment',
    singfore_trims_coordinator: 'Factory Assignment',
    singfore_label_coordinator: 'Factory Assignment',
    headsup_trims_coordinator: 'Factory Assignment',
    headsup_label_coordinator: 'Factory Assignment',
    hz_pt_ujump_trims_coordinator: 'Factory Assignment',
    hz_pt_ujump_label_coordinator: 'Factory Assignment',
    koreamel_trims_coordinator: 'Factory Assignment',
    koreamel_label_coordinator: 'Factory Assignment'
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

  // Enhanced data processing to flatten custom fields and apply factory restrictions
  // 
  // FACTORY RESTRICTIONS IMPLEMENTATION:
  // - Factory users only see brands where their specific FA column(s) match their factory name(s)
  // - For single factories: only records where their FA column matches (e.g., fa_wuxi = "Wuxi")
  // - For merged factories: records where ANY of their FA columns match (e.g., fa_wuxi = "Wuxi" OR fa_singfore = "Singfore")
  // - The brand_visible_to_factory field is populated with all_brand only for records assigned to the current factory
  // - Records not assigned to the current factory are completely filtered out from the view
  // - This ensures factory users only see and can edit data relevant to their specific factory(ies)
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply factory-specific filtering for factory users
    if (tableType === 'factory' && user?.username) {
      const factorySpecificColumns = getFactorySpecificColumns(user.username);
      
      // Get all FA columns for this factory
      const faColumns = factorySpecificColumns.filter(col => col.startsWith('fa_'));
      
      if (faColumns.length > 0) {
        // Map FA columns to factory names
        const faToFactoryMap: Record<string, string> = {
          'fa_wuxi': 'Wuxi',
          'fa_hz_u': 'HZ-U', 
          'fa_pt_uwu': 'PT-UWU',
          'fa_korea_m': 'Korea-M',
          'fa_singfore': 'Singfore',
          'fa_heads_up': 'Heads Up'
        };
        
        // For merged factories, check multiple FA columns
        if (user.username === 'factory_WuxiSingfore') {
          // Show records where either fa_wuxi = "Wuxi" OR fa_singfore = "Singfore"
          filtered = filtered.filter(row => {
            const wuxiValue = row['fa_wuxi'];
            const singforeValue = row['fa_singfore'];
            return wuxiValue === 'Wuxi' || singforeValue === 'Singfore';
          });
        } else if (user.username === 'factory_PTuwuHzuUjump') {
          // Show records where either fa_pt_uwu = "PT-UWU" OR fa_hz_u = "HZ-U"
          filtered = filtered.filter(row => {
            const ptUwuValue = row['fa_pt_uwu'];
            const hzUValue = row['fa_hz_u'];
            return ptUwuValue === 'PT-UWU' || hzUValue === 'HZ-U';
          });
        } else {
          // For single factories, check their specific FA column
          const faColumn = faColumns[0]; // Take the first FA column
          const factoryName = faToFactoryMap[faColumn];
          
          if (factoryName) {
            filtered = filtered.filter(row => {
              const faValue = row[faColumn];
              return faValue === factoryName;
            });
          }
        }
      }
    }

    // Conditionally exclude records with Inactive status based on toggle
    if (!showInactiveRecords) {
      filtered = filtered.filter(row => {
        const statusValue = String(row.status ?? '').trim().toLowerCase();
        return statusValue !== 'inactive';
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => row[key] === value);
      }
    });

    return filtered.map(record => {
      const processedRecord = { ...record };
      
      // For factory users, populate brand_visible_to_factory with all_brand for records assigned to their factory
      if (tableType === 'factory' && user?.username) {
        const factorySpecificColumns = getFactorySpecificColumns(user.username);
        const faColumns = factorySpecificColumns.filter(col => col.startsWith('fa_'));
        
        if (faColumns.length > 0) {
          const faToFactoryMap: Record<string, string> = {
            'fa_wuxi': 'Wuxi',
            'fa_hz_u': 'HZ-U', 
            'fa_pt_uwu': 'PT-UWU',
            'fa_korea_m': 'Korea-M',
            'fa_singfore': 'Singfore',
            'fa_heads_up': 'Heads Up'
          };
          
          // For merged factories, check multiple FA columns
          if (user.username === 'factory_WuxiSingfore') {
            const wuxiValue = record['fa_wuxi'];
            const singforeValue = record['fa_singfore'];
            
            // If this record is assigned to either Wuxi or Singfore, show the brand name
            if (wuxiValue === 'Wuxi' || singforeValue === 'Singfore') {
              processedRecord.brand_visible_to_factory = record.all_brand;
            } else {
              // If not assigned to either factory, don't show the brand
              processedRecord.brand_visible_to_factory = '';
            }
          } else if (user.username === 'factory_PTuwuHzuUjump') {
            const ptUwuValue = record['fa_pt_uwu'];
            const hzUValue = record['fa_hz_u'];
            
            // If this record is assigned to either PT-UWU or HZ-U, show the brand name
            if (ptUwuValue === 'PT-UWU' || hzUValue === 'HZ-U') {
              processedRecord.brand_visible_to_factory = record.all_brand;
            } else {
              // If not assigned to either factory, don't show the brand
              processedRecord.brand_visible_to_factory = '';
            }
          } else {
            // For single factories, check their specific FA column
            const faColumn = faColumns[0];
            const factoryName = faToFactoryMap[faColumn];
            const faValue = record[faColumn];
            
            // If this record is assigned to the current factory, show the brand name
            if (faValue === factoryName) {
              processedRecord.brand_visible_to_factory = record.all_brand;
            } else {
              // If not assigned to this factory, don't show the brand
              processedRecord.brand_visible_to_factory = '';
            }
          }
        }
      }
      
      // Flatten custom_fields into the main record object
      if (record.custom_fields && typeof record.custom_fields === 'object') {
        Object.entries(record.custom_fields).forEach(([key, value]) => {
          processedRecord[`custom_${key}`] = value;
        });
      }
      
      return processedRecord;
    });
  }, [data, searchTerm, filters, showInactiveRecords, tableType, user?.username]);

  // Initialize column visibility when columns change  
  useEffect(() => {
    setColumnVisibility(() => {
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
      if (!currentRecord) {
        return;
      }

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

      // Check if this is a factory column
      const isFactory = isFactoryColumn(columnKey);

      // Apply FA assignments if this is a factory column
      const finalRecord = isFactory 
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
        // For company users, include FA columns but mark them as read-only
        const editable = columns
          .filter(col => !companyNonEditableKeys.includes(col.key))
          .map(col => col.key);
        
        // Add FA columns as read-only (they'll be visible but not editable)
        const faColumns = ['fa_wuxi', 'fa_hz_u', 'fa_pt_uwu', 'fa_korea_m', 'fa_singfore', 'fa_heads_up'];
        
        // Return only the editable columns (FA columns will be handled separately in DataTable)
        return editable;
      }
    } 
    
    if (type === 'factory') {
      // Get factory-specific columns that this factory can edit
      const factorySpecificColumns = user?.username ? getFactorySpecificColumns(user.username) : [];
      
      const editable = columns
        .filter(col => {
          // Allow editing if it's not in the non-editable list
          if (!factoryNonEditableKeys.includes(col.key)) {
            return true;
          }
          // Allow editing if it's a factory-specific column for this factory
          if (factorySpecificColumns.includes(col.key)) {
            return true;
          }
          return false;
        })
        .map(col => col.key);
      return editable;
    }
  
    return [];
  };
  
  const editableColumns = getEditableColumns(tableType);

  // Get table type display name with user context
  const getTableTypeDisplayName = (type: 'company' | 'factory' | 'admin') => {
    let userInfo = '';
    if (user) {
      // Special handling for merged factory accounts
      if (type === 'factory') {
        if (user.username === 'factory_WuxiSingfore') {
          userInfo = ` (Wuxi & Singfore)`;
        } else if (user.username === 'factory_PTuwuHzuUjump') {
          userInfo = ` (PT-U & HZ-U UJump)`;
        } else {
          userInfo = ` (${user.name})`;
        }
      } else {
        userInfo = ` (${user.name})`;
      }
    }
    
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
    <div 
      className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50/30 to-brand-indigo/5 dark:from-secondary-900 dark:via-secondary-800/50 dark:to-secondary-900 relative"
    >
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url(/everest.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(3px)'
        }}
      ></div>
      {/* Enhanced Professional Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg shadow-2xl border-b border-white/20" style={{ backgroundColor: 'rgba(61, 117, 163, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
              <div className="relative">
                <img 
                  src="/m88-whitelogo.png" 
                  alt="M88 Logo" 
                  className="h-28 w-40 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center"><span class="text-white font-bold text-sm">M88</span></div>';
                    }
                  }}
                />
              </div>
              <div className="hidden sm:flex items-center gap-3 text-sm whitespace-nowrap flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-100">
                    {getTableTypeDisplayName(tableType)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
                    <span className="text-green-300 font-medium">Connected</span>
                  </div>
                </div>
              </div>
              <div className="sm:hidden flex items-center min-w-0 flex-1">
                <h1 className="text-lg font-bold text-white tracking-tight truncate">Account Allocation</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 justify-end h-full flex-shrink-0">
              <button
                onClick={onLogout}
                className="text-red-200 hover:text-red-100 hover:bg-red-600/20 p-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10"
                title="Log out"
              >
                <X className="w-4 h-4" />
                <span className="hidden lg:inline">Log out</span>
              </button>
              <button 
                onClick={handleRefresh}
                className="bg-blue-600 text-white hover:bg-blue-500 p-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10"
                title="Refresh data from database"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden lg:inline">Refresh</span>
              </button>
              {tableType !== 'factory' && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl p-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">Add Record</span>
                </button>
              )}
              {tableType === 'admin' && (
                <button 
                  onClick={() => setShowUserLogs(true)}
                  className="bg-purple-600 text-white hover:bg-purple-500 shadow-lg hover:shadow-xl p-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10"
                  title="View User Activity Logs"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden lg:inline">Activity Logs</span>
                </button>
              )}
              {(tableType === 'company' || tableType === 'admin') && (
                <button 
                  onClick={() => setShowInactiveRecords(!showInactiveRecords)}
                  className={`${showInactiveRecords 
                    ? 'bg-orange-600 text-white hover:bg-orange-500'
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                  } shadow-lg hover:shadow-xl p-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10`}
                  title={showInactiveRecords ? "Hide inactive records" : "Show inactive records"}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${showInactiveRecords ? 'bg-white' : 'bg-gray-300'}`}></div>
                  </div>
                  <span className="hidden lg:inline">
                    {showInactiveRecords ? 'Hide Inactive' : 'Show Inactive'}
                  </span>
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
          <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2">
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
                    className={`group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border-2 transition-all duration-300 whitespace-nowrap backdrop-blur-sm ${
                      isCollapsed 
                        ? `bg-white/60 text-gray-600 border-gray-200 hover:bg-white/80 hover:border-gray-300 shadow-lg` 
                        : `${group.colors.background} ${group.colors.text} ${group.colors.border} ${group.colors.hover} shadow-xl hover:shadow-2xl transform hover:scale-105`
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 shadow-sm ${
                      isCollapsed 
                        ? 'bg-gray-400' 
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
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
            columns={(() => {
              const visibleColumns = columns.filter(col => columnVisibility[col.key]);
              return visibleColumns;
            })()}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={setEditingRecord}
            onDelete={(record) => handleDelete(record.id)}
            onColumnUpdate={handleColumnUpdate}
            onCellUpdate={handleCellUpdate}
            editableColumns={editableColumns}
            tableType={tableType}
            factoryType={tableType === 'factory' ? user?.username : undefined}
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
        userRole={user?.type}
      />

      <RecordModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={(record: DataRecord | Omit<DataRecord, 'id'>) => handleEnhancedSaveRecord(record as DataRecord)}
        record={editingRecord}
        columns={columns}
        title="Edit Record"
        userRole={user?.type}
      />

      {/* User Logs Modal - Only for Admin */}
      {tableType === 'admin' && (
        <UserLogs
          isOpen={showUserLogs}
          onClose={() => setShowUserLogs(false)}
        />
      )}
    </div>
  );
};

export default M88DatabaseUI;