import { useState, useMemo } from 'react';
import { Plus, Download, Building2, Database, BarChart3, TrendingUp, Users, RefreshCw } from 'lucide-react';

import type { Column, SortConfig, Filters, DataRecord } from './types';
import { useM88Data } from './hooks/useM88data';

// Components
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { AnalyticsCard } from './components/AnalyticsCard';
import { SearchBar } from './components/SearchBar';
import { FiltersPanel } from './components/FiltersPanel';
import { DataTable } from './components/DataTable';
import { RecordModal } from './components/RecordModal';

const M88DatabaseUI = () => {
  const {
    loading,
    error,
    loadData,
    handleSaveRecord,
    handleDeleteRecord,
    handleAddRecord,
    handleRefreshData,
    getFilteredData,
    getAnalytics,
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

  const columns: Column[] = [
    { key: 'all_brand', label: 'Brand', type: 'text', required: true },
    { key: 'brand_visible_to_factory', label: 'Factory Brand', type: 'text' },
    { key: 'brand_classification', label: 'Classification', type: 'select', options: ['Top', 'Growth', 'Emerging', 'Maintain', 'Divest'] },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'In Development', 'On hold'] },
    { key: 'terms_of_shipment', label: 'Terms', type: 'select', options: ['FOB', 'LDP'] },
    { key: 'lead_pbd', label: 'Lead PBD', type: 'text' },
    { key: 'support_pbd', label: 'Support PBD', type: 'text' },
    // Additional columns from your database
    { key: 'td', label: 'TD', type: 'text' },
    { key: 'nyo_planner', label: 'NYO Planner', type: 'text' },
    { key: 'indo_m88_md', label: 'Indo M88 MD', type: 'text' },
    { key: 'm88_qa', label: 'M88 QA', type: 'text' },
    { key: 'mlo_planner', label: 'MLO Planner', type: 'text' },
    { key: 'mlo_logistic', label: 'MLO Logistic', type: 'text' },
    { key: 'mlo_purchasing', label: 'MLO Purchasing', type: 'text' },
    { key: 'mlo_costing', label: 'MLO Costing', type: 'text' },
    { key: 'wuxi_moretti', label: 'Wuxi Moretti', type: 'text' },
    { key: 'hz_u_jump', label: 'HZ U Jump', type: 'text' },
    { key: 'pt_u_jump', label: 'PT U Jump', type: 'text' },
    { key: 'korea_mel', label: 'Korea Mel', type: 'text' },
    { key: 'singfore', label: 'Singfore', type: 'text' },
    { key: 'heads_up', label: 'Heads Up', type: 'text' },
    { key: 'hz_pt_u_jump_senior_md', label: 'HZ PT U Jump Senior MD', type: 'text' },
    { key: 'pt_ujump_local_md', label: 'PT Ujump Local MD', type: 'text' },
    { key: 'hz_u_jump_shipping', label: 'HZ U Jump Shipping', type: 'text' },
    { key: 'pt_ujump_shipping', label: 'PT Ujump Shipping', type: 'text' },
    { key: 'fa_wuxi', label: 'FA Wuxi', type: 'text' },
    { key: 'fa_hz', label: 'FA HZ', type: 'text' },
    { key: 'fa_pt', label: 'FA PT', type: 'text' },
    { key: 'fa_korea', label: 'FA Korea', type: 'text' },
    { key: 'fa_singfore', label: 'FA Singfore', type: 'text' },
    { key: 'fa_heads', label: 'FA Heads', type: 'text' },
  ];

  const filteredData = getFilteredData(searchTerm, filters);
  const analytics = getAnalytics(filteredData);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            trend={{ value: 12, isUp: true }}
            color="emerald"
          />
          <AnalyticsCard
            title="Top Tier Brands"
            value={analytics.topTier}
            icon={<BarChart3 className="w-5 h-5" />}
            color="purple"
          />
          <AnalyticsCard
            title="Filtered Results"
            value={analytics.filtered}
            icon={<Users className="w-5 h-5" />}
            color="amber"
          />
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
            />
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
          <DataTable
            data={sortedData}
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={setEditingRecord}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Modals */}
      <RecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(record: DataRecord | Omit<DataRecord, 'id'>) => {
          if ('id' in (record as DataRecord)) {
            return handleSaveRecord(record as DataRecord);
          }
          return handleAddRecord(record as Omit<DataRecord, 'id'>);
        }}
        columns={columns}
        title="Add New Record"
      />

      <RecordModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={(record: DataRecord | Omit<DataRecord, 'id'>) => handleSaveRecord(record as DataRecord)}
        record={editingRecord}
        columns={columns}
        title="Edit Record"
      />
    </div>
  );
};

export default M88DatabaseUI;