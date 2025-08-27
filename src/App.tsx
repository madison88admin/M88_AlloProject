import { useState, useMemo, useEffect } from 'react';
import { Plus, Download, Building2, RefreshCw } from 'lucide-react';

import type { Column, SortConfig, Filters, DataRecord, ColumnVisibility } from './types';
import { useM88Data } from './hooks/useM88data';
import { updateFAAssignments, isFactoryColumn } from './utils/faAssignments';

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
  //const factoryColumns: Column[] = companyColumns.filter(col => col.key !== 'all_brand');

  const excludeKeys = [
    'all_brand',
    'fa_wuxi',
    'fa_hz',
    'fa_pt',
    'fa_korea',
    'fa_singfore',
    'fa_heads'
  ];
  
  const factoryColumns: Column[] = companyColumns.filter(
    col => !excludeKeys.includes(col.key)
  );
  

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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await handleDeleteRecord(id);
    } catch (err) {
      alert('Failed to delete record. Please try again.');
    }
  };

  // Handle individual cell updates with FA assignment logic
  const handleCellUpdate = async (rowId: number, columnKey: string, newValue: any) => {
    try {
      // Find the current record
      const currentRecord = sortedData.find(record => record.id === rowId);
      if (!currentRecord) return;

      // Update the specific field
      const updatedRecord = { ...currentRecord, [columnKey]: newValue };

      // Apply FA assignments if this is a factory column
      const finalRecord = isFactoryColumn(columnKey) 
        ? updateFAAssignments(updatedRecord)
        : updatedRecord;

      // Save to database using the existing hook
      await handleSaveRecord(finalRecord);
      
    } catch (err) {
      alert('Failed to update record. Please try again.');
      console.error('Error updating record:', err);
    }
  };

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
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*
          <AnalyticsCard
            title="Total Records"
            value={analytics.total}
            icon={<Database className="w-5 h-5" />}
            color="blue"
          />
          <AnalyticsCard
            title="Active Brands"
            value={analytics.active}
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
          />
          <AnalyticsCard
            title="Filtered Results"
            value={analytics.filtered}
            icon={<Users className="w-5 h-5" />}
            color="amber"
          />
          */}
        </div>

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