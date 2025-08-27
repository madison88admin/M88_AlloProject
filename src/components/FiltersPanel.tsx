import { ChevronDown, Eye, EyeOff, Settings } from 'lucide-react';
import { useState } from 'react';
import type { Filters, Column, ColumnVisibility } from '../types';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  getUniqueValues: (key: string) => string[];
  columns: Column[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
}

export const FiltersPanel = ({
  filters,
  onFiltersChange,
  getUniqueValues,
  columns,
  columnVisibility,
  onColumnVisibilityChange
}: FiltersPanelProps) => {
  const [showColumnSettings, setShowColumnSettings] = useState(false);

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

  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6 space-y-6">
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
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  columnVisibility[col.key] ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
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
  );
};

export default FiltersPanel;