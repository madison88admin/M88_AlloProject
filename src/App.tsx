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
    type: customFieldsTypes[key]?.type as 'text' | 'select' | 'boolean' || 'text',
    options: customFieldsTypes[key]?.options,
    width: '150px',
    custom: true
  }));
};

const M88DatabaseUI = ({ tableType, onLogout }: { tableType: 'company' | 'factory' | 'admin', onLogout: () => void }) => {
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

  // Factory excludes these keys from company columns
  const factoryExcludeKeys = [
    'all_brand',
    'fa_wuxi',
    'fa_hz',
    'fa_pt',
    'fa_korea',
    'fa_singfore',
    'fa_heads'
  ];
  
  const baseFactoryColumns: Column[] = baseCompanyColumns.filter(
    col => !factoryExcludeKeys.includes(col.key)
  );

  // Company includes custom columns but can't add new ones
  const baseCompanyColumnsWithCustom: Column[] = baseCompanyColumns;

  // Admin gets all columns including custom ones
  const baseAdminColumns: Column[] = baseCompanyColumns;

  // Column order state - this will track the current order of columns
  const [companyColumnOrder, setCompanyColumnOrder] = useState<Column[]>(baseCompanyColumnsWithCustom);
  const [factoryColumnOrder, setFactoryColumnOrder] = useState<Column[]>(baseFactoryColumns);
  const [adminColumnOrder, setAdminColumnOrder] = useState<Column[]>(baseAdminColumns);

  // Extract custom fields from data and update columns
  useEffect(() => {
    if (data && data.length > 0) {
      const detectedCustomColumns = getCustomFieldsFromData(data);
      setCustomColumns(detectedCustomColumns);
      
      // Update column orders with custom columns based on table type
      // Company: base columns + custom columns (can see but not add)
      setCompanyColumnOrder([...baseCompanyColumnsWithCustom, ...detectedCustomColumns]);
      
      // Factory: base factory columns only (NO custom columns)
      setFactoryColumnOrder(baseFactoryColumns);
      
      // Admin: all base columns + custom columns
      setAdminColumnOrder([...baseAdminColumns, ...detectedCustomColumns]);
    }
  }, [data]);

  // Use correct columns based on tableType
  const columns = useMemo(() => {
    switch (tableType) {
      case 'company':
        return companyColumnOrder; // Base columns + custom columns (can see but not add)
      case 'factory':
        return factoryColumnOrder; // Factory columns only (NO custom columns)
      case 'admin':
        return adminColumnOrder; // All columns + custom columns
      default:
        return companyColumnOrder;
    }
  }, [tableType, companyColumnOrder, factoryColumnOrder, adminColumnOrder]);

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

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
      columns.forEach((col, index) => {
        if (prev[col.key] !== undefined) {
          newVisibility[col.key] = prev[col.key];
        } else {
          newVisibility[col.key] = true;
        }
      });
      return newVisibility;
    });
  }, [columns, tableType]);

  // Reset column order when table type changes
  useEffect(() => {
    switch (tableType) {
      case 'company':
        setCompanyColumnOrder([...baseCompanyColumnsWithCustom, ...customColumns]); // Can see custom columns
        break;
      case 'factory':
        setFactoryColumnOrder(baseFactoryColumns); // No custom columns for factory
        break;
      case 'admin':
        setAdminColumnOrder([...baseAdminColumns, ...customColumns]);
        break;
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
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [processedData, sortConfig]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await handleDeleteRecord(id);
    } catch (err) {
      alert('Failed to delete record. Please try again.');
    }
  };

  // Enhanced cell update handler for custom fields
  const handleCellUpdate = async (rowId: number, columnKey: string, newValue: any) => {
    try {
      const currentRecord = sortedData.find(record => record.id === rowId);
      if (!currentRecord) return;

      let updatedRecord = { ...currentRecord };

      if (columnKey.startsWith('custom_')) {
        // Handle custom field updates
        const customKey = columnKey.replace('custom_', '');
        const currentCustomFields = updatedRecord.custom_fields || {};
        
        updatedRecord = {
          ...updatedRecord,
          custom_fields: {
            ...currentCustomFields,
            [customKey]: newValue
          }
        };
      } else {
        // Handle regular field updates
        updatedRecord[columnKey] = newValue;
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

  // Add custom column functionality - ONLY for admin
  const handleAddCustomColumn = async (columnData: { name: string; type: 'text' | 'select' | 'boolean'; options?: string[] }) => {
    if (tableType !== 'admin') {
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

    // Update column orders - only admin gets custom columns
    setAdminColumnOrder(prev => [...prev, newColumn]);
    // Company and factory orders stay the same (no custom columns)

    // Make new column visible
    setColumnVisibility(prev => ({
      ...prev,
      [`custom_${customKey}`]: true
    }));
  };

  // Enhanced save record handler that applies FA assignments
  const handleEnhancedSaveRecord = async (record: DataRecord) => {
    try {
      const recordWithFAUpdates = updateFAAssignments(record);
      return await handleSaveRecord(recordWithFAUpdates);
    } catch (err) {
      throw err;
    }
  };

  // Enhanced add record handler that applies FA assignments  
  const handleEnhancedAddRecord = async (record: Omit<DataRecord, 'id'>) => {
    try {
      const recordWithFAUpdates = updateFAAssignments(record as DataRecord);
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

  // Add a helper to determine editable columns based on table type
  const getEditableColumns = (type: 'company' | 'factory' | 'admin') => {
    const currentColumns = columns;
    
    if (type === 'admin') {
      // Admin can edit all columns
      return currentColumns.map(col => col.key);
    } else if (type === 'company') {
      // Company can edit all their visible columns (including custom columns)
      return currentColumns.map(col => col.key);
    } else if (type === 'factory') {
      // Factory can edit specific columns (NO custom fields)
      return currentColumns
        .filter(col =>
          col.key.startsWith('hz_pt_') ||
          col.key.startsWith('pt_') ||
          col.key.startsWith('hz_u_') ||
          col.key.startsWith('pt_u_')
          // Removed custom column editing for factory
        )
        .map(col => col.key);
    }
    
    return [];
  };
  const editableColumns = getEditableColumns(tableType);

  // Get table type display name
  const getTableTypeDisplayName = (type: 'company' | 'factory' | 'admin') => {
    switch (type) {
      case 'company':
        return 'Company View';
      case 'factory':
        return 'Factory View';
      case 'admin':
        return 'Admin View';
      default:
        return 'Unknown View';
    }
  };

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
                <p className="text-sm text-slate-600">
                  {getTableTypeDisplayName(tableType)} • Enterprise Brand Management System • Connected to Database
                </p>
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
              onAddCustomColumn={tableType === 'admin' ? handleAddCustomColumn : undefined} // Only admin can add columns
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