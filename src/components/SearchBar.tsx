import { Search, Filter, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onToggleFilters,
  showFilters,
}: SearchBarProps) => (
  <div className="space-y-6">
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search brands, status, classification, contacts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-12 pr-12 py-4 text-base shadow-soft focus:shadow-medium"
          />
          {searchTerm && (
            <button
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 p-1.5 rounded-lg hover:bg-secondary-100 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-secondary-500">
            Searching for: <span className="font-medium text-secondary-700">"{searchTerm}"</span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 font-semibold transition-all duration-300 ${
            showFilters 
              ? 'btn-primary shadow-glow' 
              : 'btn-secondary'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {showFilters && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-soft"></div>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default SearchBar;