import React, { useState, useEffect, useMemo } from 'react';
 import { Search, Plus, Edit2, Filter, X, Save, ArrowUpDown, Eye, Download } from 'lucide-react';
// import './App.css';

interface Column {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
}

interface DataRecord {
  id: number;
  [key: string]: any;
}

interface Filters {
  status: string;
  brand_classification: string;
  terms_of_shipment: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | '';
}

const M88DatabaseUI: React.FC = () => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    brand_classification: '',
    terms_of_shipment: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<DataRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [newRecord, setNewRecord] = useState<Partial<DataRecord>>({});

  // Column definitions based on your CSV structure
  const columns: Column[] = [
    { key: 'all_brand', label: 'Brand', type: 'text', required: true },
    { key: 'brand_visible_to_factory', label: 'Visible Brand', type: 'text' },
    { key: 'brand_classification', label: 'Classification', type: 'select', options: ['Top', 'Growth', 'Emerging', 'Maintain', 'Divest', 'Growth/Divest', 'Early Engagement'] },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'In Development', 'On hold'], required: true },
    { key: 'terms_of_shipment', label: 'Terms', type: 'select', options: ['FOB', 'LDP'] },
    { key: 'lead_pbd', label: 'Lead PBD', type: 'text' },
    { key: 'support_pbd', label: 'Support PBD', type: 'text' },
    { key: 'td', label: 'TD', type: 'text' },
    { key: 'nyo_planner', label: 'NYO Planner', type: 'text' },
    { key: 'indo_m88_md', label: 'Indo M88 MD', type: 'text' },
    { key: 'm88_qa', label: 'M88 QA', type: 'text' },
    { key: 'mlo_planner', label: 'MLO Planner', type: 'text' },
    { key: 'mlo_logistic', label: 'MLO Logistic', type: 'text' },
    { key: 'mlo_purchasing', label: 'MLO Purchasing', type: 'text' },
    { key: 'mlo_costing', label: 'MLO Costing', type: 'text' },
    { key: 'wuxi_moretti', label: 'Wuxi Moretti', type: 'boolean' },
    { key: 'hz_u_jump', label: 'HZ U Jump', type: 'boolean' },
    { key: 'pt_u_jump', label: 'PT U Jump', type: 'boolean' },
    { key: 'korea_mel', label: 'Korea MEL', type: 'boolean' },
    { key: 'singfore', label: 'Singapore', type: 'boolean' },
    { key: 'heads_up', label: 'Heads Up', type: 'boolean' },
    { key: 'hz_pt_u_jump_senior_md', label: 'HZ/PT Senior MD', type: 'text' },
    { key: 'pt_ujump_local_md', label: 'PT Local MD', type: 'text' },
    { key: 'hz_u_jump_shipping', label: 'HZ Shipping', type: 'text' },
    { key: 'pt_ujump_shipping', label: 'PT Shipping', type: 'text' },
    { key: 'fa_wuxi', label: 'FA Wuxi', type: 'text' },
    { key: 'fa_hz', label: 'FA HZ', type: 'text' },
    { key: 'fa_pt', label: 'FA PT', type: 'text' },
    { key: 'fa_korea', label: 'FA Korea', type: 'text' },
    { key: 'fa_singfore', label: 'FA Singapore', type: 'text' },
    { key: 'fa_heads', label: 'FA Heads', type: 'text' }
  ];

  // Initialize visible columns
  useEffect(() => {
    const initialVisible: Record<string, boolean> = {};
    columns.forEach(col => {
      initialVisible[col.key] = ['all_brand', 'brand_classification', 'status', 'terms_of_shipment', 'lead_pbd', 'support_pbd'].includes(col.key);
    });
    setVisibleColumns(initialVisible);
  }, []);

  // Parse CSV function
  const parseCSV = (csvText: string): DataRecord[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      const record: DataRecord = { id: index + 1 };
      headers.forEach((header, i) => {
        let value = values[i] || '';
        
        // Clean up the value
        if (value === '""' || value === '" "' || value === ' ') value = '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        // Convert boolean-like values
        if (['wuxi_moretti', 'hz_u_jump', 'pt_u_jump', 'korea_mel', 'singfore', 'heads_up'].includes(header)) {
          record[header] = value === 'Yes' || value === 'TRUE' || value === '1';
        } else {
          record[header] = value;
        }
      });
      
      return record;
    });
  };

  // Load data from CSV file in public folder
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/M88_Acc-Allocation_rows.csv');
        if (!response.ok) {
          throw new Error('Failed to load CSV file');
        }
        const csvContent = await response.text();
        const parsedData = parseCSV(csvContent);
        setData(parsedData);
        setFilteredData(parsedData);
      } catch (err) {
        setError('Failed to load CSV data: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = data;

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => row[key] === value);
      }
    });

    setFilteredData(filtered);
  }, [data, searchTerm, filters]);

  // Sorting functionality
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (row: DataRecord) => {
    setEditingRow({ ...row });
  };

  const handleSave = () => {
    if (editingRow) {
      setData(prev => prev.map(row => 
        row.id === editingRow.id ? editingRow : row
      ));
      setEditingRow(null);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setData(prev => prev.filter(row => row.id !== id));
    }
  };

  const handleAdd = () => {
    const id = Math.max(...data.map(r => r.id), 0) + 1;
    setData(prev => [...prev, { ...newRecord, id } as DataRecord]);
    setNewRecord({});
    setShowAddForm(false);
  };

  const getUniqueValues = (key: string): string[] => {
    return [...new Set(data.map(row => row[key]).filter(Boolean))].sort();
  };

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportToCSV = () => {
    const headers = columns.map(col => col.key).join(',');
    const rows = filteredData.map(row => 
      columns.map(col => {
        const value = row[col.key] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'M88_filtered_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function for status colors
  const getStatusColor = (status: string): string => {
    switch (status?.trim()) {
      case 'Active':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      case 'Inactive':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
      case 'In Development':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
      case 'On hold':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 max-w-md">
          <h3 className="font-medium">Error Loading Data</h3>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2">Make sure to place M88_Acc-Allocation_rows.csv in the public folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">M88 Account Allocation Database</h1>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {getUniqueValues('status').map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                <select
                  value={filters.brand_classification}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand_classification: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classifications</option>
                  {getUniqueValues('brand_classification').map(classification => (
                    <option key={classification} value={classification}>{classification}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
                <select
                  value={filters.terms_of_shipment}
                  onChange={(e) => setFilters(prev => ({ ...prev, terms_of_shipment: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Terms</option>
                  {getUniqueValues('terms_of_shipment').map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Column Visibility Controls */}
          <div className="mb-4">
            <details className="group">
              <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                <Eye className="w-4 h-4" />
                Show/Hide Columns ({Object.values(visibleColumns).filter(Boolean).length} of {columns.length} visible)
              </summary>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4 bg-gray-50 rounded-md">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={() => toggleColumnVisibility(col.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </details>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} records
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.filter(col => visibleColumns[col.key]).map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.filter(col => visibleColumns[col.key]).map(col => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">
                      {editingRow?.id === row.id ? (
                        col.type === 'select' ? (
                          <select
                            value={editingRow[col.key] || ''}
                            onChange={(e) => setEditingRow(prev => prev ? { ...prev, [col.key]: e.target.value } : null)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                          >
                            <option value="">--</option>
                            {col.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : col.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={editingRow[col.key] || false}
                            onChange={(e) => setEditingRow(prev => prev ? { ...prev, [col.key]: e.target.checked } : null)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={editingRow[col.key] || ''}
                            onChange={(e) => setEditingRow(prev => prev ? { ...prev, [col.key]: e.target.value } : null)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                          />
                        )
                      ) : (
                        <span>
                          {col.key === 'status' ? (
                            <span className={getStatusColor(row[col.key])}>
                              {row[col.key] || '-'}
                            </span>
                          ) : col.type === 'boolean' ? (
                            row[col.key] ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                No
                              </span>
                            )
                          ) : (
                            row[col.key] || '-'
                          )}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {editingRow?.id === row.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingRow(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New Record</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.slice(0, 10).map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col.label} {col.required && <span className="text-red-500">*</span>}
                  </label>
                  {col.type === 'select' ? (
                    <select
                      value={newRecord[col.key] || ''}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, [col.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">--</option>
                      {col.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : col.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={newRecord[col.key] || false}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, [col.key]: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={newRecord[col.key] || ''}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, [col.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return <M88DatabaseUI />;
};

export default App;