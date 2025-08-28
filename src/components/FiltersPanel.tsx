import { ChevronDown, Eye, EyeOff, Settings, Plus, Trash2, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { Filters, Column, ColumnVisibility } from '../types';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  getUniqueValues: (key: string) => string[];
  columns: Column[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  onColumnUpdate?: (columns: Column[]) => void;
  onClose?: () => void;
}

export const FiltersPanel = ({
  filters,
  onFiltersChange,
  getUniqueValues,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  onColumnUpdate,
  onClose
}: FiltersPanelProps) => {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'select' | 'boolean'>('text');
  const [newColumnOptions, setNewColumnOptions] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Core system columns that shouldn't be deleted
  const systemColumns = ['id', 'all_brand', 'brand_visible_to_factory', 'brand_classification', 'status', 'terms_of_shipment'];

  const toggleColumnVisibility = (columnKey: string) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    });
  };

  const toggleAllColumns = (visible: boolean) => {
    const newVisibility: ColumnVisibility = {};
    columns.forEach(col => {
      newVisibility[col.key] = visible;
    });
    onColumnVisibilityChange(newVisibility);
  };

  const deleteColumn = (columnKey: string) => {
    if (!onColumnUpdate) return;
    
    // Prevent deletion of system columns
    if (systemColumns.includes(columnKey)) {
      alert('This is a core system column and cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the "${columns.find(c => c.key === columnKey)?.label}" column? This action cannot be undone.`)) {
      return;
    }
    
    const updatedColumns = columns.filter(col => col.key !== columnKey);
    
    // Remove from visibility as well
    const updatedVisibility = { ...columnVisibility };
    delete updatedVisibility[columnKey];
    onColumnVisibilityChange(updatedVisibility);
    
    onColumnUpdate(updatedColumns);
  };

  const addColumn = () => {
    if (!newColumnName.trim() || !onColumnUpdate) return;

    // Check for duplicate column names
    const existingColumn = columns.find(col => 
      col.label.toLowerCase() === newColumnName.toLowerCase()
    );
    
    if (existingColumn) {
      alert('A column with this name already exists. Please choose a different name.');
      return;
    }

    // Generate a unique key
    const baseKey = newColumnName.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    let columnKey = baseKey;
    let counter = 1;
    while (columns.find(col => col.key === columnKey)) {
      columnKey = `${baseKey}_${counter}`;
      counter++;
    }

    const newColumn: Column = {
      key: columnKey,
      label: newColumnName,
      type: newColumnType,
      options: newColumnType === 'select' ? newColumnOptions.filter(opt => opt.trim()) : undefined,
      width: '150px',
      custom: true // Mark as custom column
    };

    const updatedColumns = [...columns, newColumn];
    onColumnUpdate(updatedColumns);

    // Make the new column visible by default
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: true
    });

    // Reset form
    setNewColumnName('');
    setNewColumnType('text');
    setNewColumnOptions([]);
    setShowAddColumn(false);
    setShowWarning(false);
  };

  const isSystemColumn = (columnKey: string) => {
    return systemColumns.includes(columnKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Filters & Column Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Data Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Data Filters</h3>
              <button 
                onClick={() => onFiltersChange({ status: '', brand_classification: '', terms_of_shipment: '' })}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries({
                status: 'Status',
                brand_classification: 'Classification',
                terms_of_shipment: 'Shipment Terms'
              }).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{label}</label>
                  <div className="relative">
                    <select
                      value={filters[key as keyof Filters]}
                      onChange={(e) => onFiltersChange({ ...filters, [key]: e.target.value })}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 text-slate-900 transition-all duration-200"
                    >
                      <option value="">All {label}</option>
                      {getUniqueValues(key).map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column Visibility Controls */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Column Management
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllColumns(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Show All
                </button>
                <button
                  onClick={() => toggleAllColumns(false)}
                  className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Hide All
                </button>
                {onColumnUpdate && (
                  <button
                    onClick={() => {
                      setShowAddColumn(true);
                      setShowWarning(true);
                    }}
                    className="text-sm text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Column
                  </button>
                )}
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {showColumnSettings ? 'Hide' : 'Show'} Settings
                </button>
              </div>
            </div>

            {showColumnSettings && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-4">
                {columns.map(col => (
                  <div
                    key={col.key}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer group ${
                      columnVisibility[col.key]
                        ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleColumnVisibility(col.key)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {columnVisibility[col.key] ? (
                        <Eye className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium truncate ${
                        columnVisibility[col.key] ? 'text-slate-900' : 'text-slate-500'
                      }`} title={col.label}>
                        {col.label}
                      </span>
                      {isSystemColumn(col.key) && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" title="System column" />
                      )}
                    </div>
                    {onColumnUpdate && !isSystemColumn(col.key) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteColumn(col.key);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all flex-shrink-0"
                        title="Delete column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-600 mt-4">
              <span>
                {Object.values(columnVisibility).filter(Boolean).length} of {columns.length} columns visible
              </span>
              <span className="text-slate-400">|</span>
              <span>
                {Object.values(columnVisibility).filter(v => !v).length} hidden
              </span>
              <span className="text-slate-400">|</span>
              <span>
                {columns.filter(col => !isSystemColumn(col.key)).length} custom columns
              </span>
            </div>
          </div>
        </div>

        {/* Add Column Modal */}
        {showAddColumn && onColumnUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Add New Column</h3>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName('');
                    setNewColumnType('text');
                    setNewColumnOptions([]);
                    setShowWarning(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showWarning && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Database Warning</p>
                      <p className="text-amber-700 mt-1">
                        Custom columns are stored locally and won't be saved to the database. 
                        For permanent columns, you'll need to modify your Supabase table structure.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Column Name *
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter column name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Column Type
                  </label>
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as 'text' | 'select' | 'boolean')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                  </select>
                </div>

                {newColumnType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newColumnOptions.join(', ')}
                      onChange={(e) => setNewColumnOptions(
                        e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                      )}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                    {newColumnOptions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {newColumnOptions.map((option, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={addColumn}
                    disabled={!newColumnName.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnName('');
                      setNewColumnType('text');
                      setNewColumnOptions([]);
                      setShowWarning(false);
                    }}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;