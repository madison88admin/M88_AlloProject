import { Search, Filter, RefreshCw } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  recordCount: number;
  onRefresh: () => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onToggleFilters,
  showFilters,
  recordCount,
  onRefresh
}: SearchBarProps) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search brands, status, classification..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-16 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all duration-200 text-slate-900 placeholder-slate-500 shadow-sm"
        />
        {searchTerm && (
          <button
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl border font-medium transition-all duration-200 ${
            showFilters 
              ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>{recordCount} records found</span>
      <div className="flex items-center gap-4">
        <button 
          onClick={onRefresh}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  </div>
);


export default SearchBar;