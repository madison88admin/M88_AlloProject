import { ChevronDown } from 'lucide-react';
import type { Filters } from '../types';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  getUniqueValues: (key: string) => string[];
}

export const FiltersPanel = ({
  filters,
  onFiltersChange,
  getUniqueValues
}: FiltersPanelProps) => (
  <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
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
);


export default FiltersPanel;