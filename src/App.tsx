import { useState, useMemo, useEffect } from 'react';
import { Plus, Download, Building2, RefreshCw } from 'lucide-react';

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
  type: 'company' | 'factory';
  name: string;
  department?: string | null;
  facility?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

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

const isValidYesBlankValue = (value: any): boolean => {
  if (!value || value === '' || value === null || value === undefined) {
    return true; // Blank is valid
  }
  
  const stringValue = String(value).toLowerCase().trim();
  return stringValue === 'yes';
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

const M88DatabaseUI = ({ tableType, onLogout, user }: { 
  tableType: 'company' | 'factory'; 
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

  // Define base columns for both table types
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
    { key: 'm88_qa', label: 'M88 QA', type: 'text', width: '120px' },
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

  const excludeKeys = [
    'all_brand',
    'fa_wuxi',
    'fa_hz',
    'fa_pt',
    'fa_korea',
    'fa_singfore',
    'fa_heads'
  ];
  
  const baseFactoryColumns: Column[] = baseCompanyColumns.filter(
    col => !excludeKeys.includes(col.key)
  );

  // Column order state - this will track the current order of columns
  const [companyColumnOrder, setCompanyColumnOrder] = useState<Column[]>(baseCompanyColumns);
  const [factoryColumnOrder, setFactoryColumnOrder] = useState<Column[]>(baseFactoryColumns);

  // Extract custom fields from data and update columns
  useEffect(() => {
    if (data && data.length > 0) {
      const detectedCustomColumns = getCustomFieldsFromData(data);
      setCustomColumns(detectedCustomColumns);
      
      // Update column orders with custom columns
      setCompanyColumnOrder(prev => {
        const baseColumns = prev.filter(col => !col.custom);
        return [...baseColumns, ...detectedCustomColumns];
      });
      
      setFactoryColumnOrder(prev => {
        const baseColumns = prev.filter(col => !col.custom);
        const filteredBase = baseColumns.filter(col => !excludeKeys.includes(col.key));
        return [...filteredBase, ...detectedCustomColumns];
      });
    }
  }, [data]);

  // Use correct columns based on tableType (now includes custom columns)
  const columns = tableType === 'company' ? companyColumnOrder : factoryColumnOrder;
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  // Handle column reordering
  const handleColumnUpdate = (newColumns: Column[]) => {
    if (tableType === 'company') {
      setCompanyColumnOrder(newColumns);
    } else {
      setFactoryColumnOrder(newColumns);
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
      columns.forEach((col, index) => {
        if (prev[col.key] !== undefined) {
          newVisibility[col.key] = prev[col.key];
        } else {
          if (tableType === 'company') {
            newVisibility[col.key] = true;
          } else {
            newVisibility[col.key] = true;
          }
        }
      });
      return newVisibility;
    });
  }, [columns, tableType]);

  // Reset column order when table type changes
  useEffect(() => {
    if (tableType === 'company') {
      setCompanyColumnOrder([...baseCompanyColumns, ...customColumns]);
    } else {
      setFactoryColumnOrder([...baseFactoryColumns, ...customColumns]);
    }
  }, [tableType, customColumns]);

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

  // Add custom column functionality
  const handleAddCustomColumn = async (columnData: { name: string; type: 'text' | 'select' | 'boolean' | 'yes_blank'; options?: string[] }) => {
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

    // Update column orders
    if (tableType === 'company') {
      setCompanyColumnOrder(prev => [...prev, newColumn]);
    } else {
      setFactoryColumnOrder(prev => [...prev, newColumn]);
    }

    // Make new column visible
    setColumnVisibility(prev => ({
      ...prev,
      [`custom_${customKey}`]: true
    }));

    // Initialize the custom field in existing records (optional)
    // You might want to batch update all records to include the new field
    // This depends on your business requirements
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

  // Add a helper to determine editable columns for factory
  const getEditableColumns = (type: 'company' | 'factory') => {
    const currentColumns = type === 'company' ? companyColumnOrder : factoryColumnOrder;
    if (type === 'company') return currentColumns.map(col => col.key);
    
    return currentColumns
      .filter(col =>
        col.key.startsWith('hz_pt_') ||
        col.key.startsWith('pt_') ||
        col.key.startsWith('hz_u_') ||
        col.key.startsWith('pt_u_') ||
        col.custom === true // Allow editing of all custom fields
      )
      .map(col => col.key);
  };
  const editableColumns = getEditableColumns(tableType);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadData} />;

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
                <p className="text-sm text-slate-600">Enterprise Brand Management System • Connected to Database</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 border border-red-200"
                title="Log out"
              >
                Log out
              </button>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                title="Refresh data from database"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Search and Filters */}
        <div className="space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            recordCount={processedData.length}
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
              onColumnUpdate={handleColumnUpdate}
              onAddCustomColumn={handleAddCustomColumn}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
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