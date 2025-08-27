import { ChevronDown, Eye, EyeOff, Settings, Plus, Trash2, X } from 'lucide-react';
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
  // filters,
  // onFiltersChange,
  // getUniqueValues,
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
    
    const updatedColumns = columns.filter(col => col.key !== columnKey);
    onColumnUpdate(updatedColumns);
  };

  const addColumn = () => {
    if (!newColumnName.trim() || !onColumnUpdate) return;

    const newColumn: Column = {
      key: `col_${Date.now()}`,
      label: newColumnName,
      type: newColumnType,
      options: newColumnType === 'select' ? newColumnOptions : undefined,
      width: '150px'
    };

    const updatedColumns = [...columns, newColumn];
    onColumnUpdate(updatedColumns);

    setNewColumnName('');
    setNewColumnType('text');
    setNewColumnOptions([]);
    setShowAddColumn(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
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
          {/* <div className="space-y-4">
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
          </div> */}

          {/* Column Visibility Controls */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Column Visibility
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
                    onClick={() => setShowAddColumn(true)}
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
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                {columns.map(col => (
                  <div
                    key={col.key}
                    className={`flex items-center gap-1 p-2 rounded-md border transition-all cursor-pointer ${
                      columnVisibility[col.key]
                        ? 'bg-white border-slate-200 hover:border-blue-300'
                        : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleColumnVisibility(col.key)}
                  >
                    <div className="flex items-center gap-1 flex-1">
                      {columnVisibility[col.key] ? (
                        <Eye className="w-3 h-3 text-blue-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-slate-400" />
                      )}
                      <span className={`text-xs font-medium truncate ${
                        columnVisibility[col.key] ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {col.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        columnVisibility[col.key] ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      {onColumnUpdate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteColumn(col.key);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
            </div>
          </div>
        </div>

        {/* Add Column Modal */}
        {showAddColumn && onColumnUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Column</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Column Name
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter column name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Column Type
                  </label>
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as 'text' | 'select' | 'boolean')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
                {newColumnType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newColumnOptions.join(', ')}
                      onChange={(e) => setNewColumnOptions(e.target.value.split(',').map(opt => opt.trim()).filter(Boolean))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={addColumn}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
                    }}
                    className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
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