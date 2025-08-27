import { ArrowUpDown, Edit2, X, Database, Trash2, ChevronLeft, ChevronRight, Search, Filter, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { DataRecord, Column, SortConfig } from '../types';
import { StatusBadge } from './StatusBadge';
import { ClassificationBadge } from './ClassificationBadge';

interface DataTableProps {
  data: DataRecord[];
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  onEdit: (row: DataRecord) => void;
  onDelete: (record: DataRecord) => void;
  onColumnUpdate?: (columns: Column[]) => void;
  onCellUpdate?: (rowId: number, columnKey: string, newValue: any) => void;
}

// Define dropdown options
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' }
];

const CLASSIFICATION_OPTIONS = [
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
  { value: 'basic', label: 'Basic' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'budget', label: 'Budget' },
  { value: 'enterprise', label: 'Enterprise' }
];

export const DataTable = ({
  data,
  columns,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onColumnUpdate,
  onCellUpdate
}: DataTableProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{rowId: number, columnKey: string} | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{rowId: number, columnKey: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  useEffect(() => {
    if (editingColumn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingColumn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleColumns = columns;
  const currentData = data;

  const updateColumnName = (columnKey: string, newName: string) => {
    if (!onColumnUpdate) return;
    
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, label: newName } : col
    );
    onColumnUpdate(updatedColumns);
    setEditingColumn(null);
  };

  const handleCellEdit = (rowId: number, columnKey: string, currentValue: any) => {
    // For status and brand_classification, show dropdown instead of text input
    if (columnKey === 'status' || columnKey === 'brand_classification') {
      setOpenDropdown({ rowId, columnKey });
    } else {
      setEditingCell({ rowId, columnKey });
    }
  };

  const handleCellUpdate = (rowId: number, columnKey: string, newValue: any) => {
    if (onCellUpdate) {
      onCellUpdate(rowId, columnKey, newValue);
    }
    setEditingCell(null);
  };

  const handleDropdownSelect = (rowId: number, columnKey: string, value: string) => {
    if (onCellUpdate) {
      onCellUpdate(rowId, columnKey, value);
    }
    setOpenDropdown(null);
  };

  const renderDropdown = (row: DataRecord, col: Column) => {
    const isOpen = openDropdown?.rowId === row.id && openDropdown?.columnKey === col.key;
    const options = col.key === 'status' ? STATUS_OPTIONS : CLASSIFICATION_OPTIONS;
    const currentValue = row[col.key] || '';

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => handleCellEdit(row.id, col.key, currentValue)}
          className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
        >
          <span className="flex-1">
            {col.key === 'status' ? (
              <StatusBadge status={String(currentValue)} />
            ) : (
              <ClassificationBadge classification={String(currentValue)} />
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-slate-600`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownSelect(row.id, col.key, option.value)}
                  className={`w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-150 border-b border-slate-100 last:border-b-0 group ${
                    currentValue === option.value ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {col.key === 'status' ? (
                      <StatusBadge status={option.value} />
                    ) : (
                      <ClassificationBadge classification={option.value} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCellContent = (row: DataRecord, col: Column) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === col.key;
    
    if (isEditing) {
      return (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            defaultValue={row[col.key] || ''}
            className="w-full bg-white border-2 border-blue-500 rounded-lg px-3 py-2 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            onBlur={(e) => handleCellUpdate(row.id, col.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellUpdate(row.id, col.key, (e.target as HTMLInputElement).value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            autoFocus
          />
          <div className="absolute inset-0 rounded-lg bg-blue-500/5 -z-10 animate-pulse"></div>
        </div>
      );
    }

    if (col.key === 'status' || col.key === 'brand_classification') {
      return renderDropdown(row, col);
    } else if (col.type === 'boolean') {
      return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          row[col.key] 
            ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border border-slate-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${row[col.key] ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
          {row[col.key] ? 'Yes' : 'No'}
        </div>
      );
    } else {
      return (
        <div 
          className={`${row[col.key] ? 'text-slate-800' : 'text-slate-400'} cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-3 py-2 rounded-lg transition-all duration-200 group relative`}
          onClick={() => handleCellEdit(row.id, col.key, row[col.key])}
        >
          <span className="relative z-10">{row[col.key] || '—'}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 rounded-lg transition-all duration-200"></div>
        </div>
      );
    }
  };

  const deleteColumn = (columnKey: string) => {
    if (!onColumnUpdate) return;
    
    const updatedColumns = columns.filter(col => col.key !== columnKey);
    onColumnUpdate(updatedColumns);
  };

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <Database className="w-10 h-10 text-slate-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Search className="w-3 h-3 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">No records found</h3>
        <p className="text-slate-500 max-w-md leading-relaxed">Try adjusting your search terms or filters to discover the data you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          {/* Enhanced Scroll Controls */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <h3 className="text-lg font-semibold text-slate-800">Data Table</h3>
              <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded-full border">
                {currentData.length} records
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={scrollLeft}
                className="group relative w-11 h-11 bg-white border-2 border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600"
                title="Scroll left"
                disabled={!showLeftScroll}
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-600/0 group-hover:from-blue-500/20 group-hover:to-indigo-600/20 rounded-xl transition-all duration-300"></div>
              </button>
              
              <button
                onClick={scrollRight}
                className="group relative w-11 h-11 bg-white border-2 border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600"
                title="Scroll right"
                disabled={!showRightScroll}
              >
                <ChevronRight className="w-5 h-5 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-600/0 group-hover:from-blue-500/20 group-hover:to-indigo-600/20 rounded-xl transition-all duration-300"></div>
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="overflow-auto max-h-[650px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400"
            style={{ scrollbarWidth: 'thin' }}
          >
            <table className="w-full min-w-max">
              <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100/50 z-30 shadow-sm backdrop-blur-sm">
                <tr className="border-b border-slate-200">
                  {visibleColumns.map(col => (
                    <th
                      key={col.key}
                      className="text-left py-5 px-6 text-sm font-bold text-slate-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group whitespace-nowrap min-w-[160px] relative"
                      onClick={() => onSort(col.key)}
                    >
                      <div className="flex items-center gap-3">
                        {editingColumn === col.key ? (
                          <input
                            ref={inputRef}
                            type="text"
                            defaultValue={col.label}
                            className="bg-white border-2 border-blue-500 rounded-lg px-3 py-2 text-sm w-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            onBlur={(e) => updateColumnName(col.key, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateColumnName(col.key, (e.target as HTMLInputElement).value);
                              } else if (e.key === 'Escape') {
                                setEditingColumn(null);
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                            onClick={() => setEditingColumn(col.key)}
                          >
                            <span className="font-semibold">{col.label}</span>
                            <ArrowUpDown 
                              className={`w-4 h-4 transition-all duration-200 ${
                                sortConfig.key === col.key ? 'opacity-100 text-blue-600' : 'opacity-0 group-hover:opacity-100'
                              } ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSort(col.key);
                              }}
                            />
                          </span>
                        )}
                        {onColumnUpdate && (
                          <button
                            onClick={() => deleteColumn(col.key)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                            title="Delete column"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-200 ${
                        sortConfig.key === col.key ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></div>
                    </th>
                  ))}
                  <th className="text-right py-5 px-6 text-sm font-bold text-slate-700 w-40 min-w-[160px] sticky right-0 bg-gradient-to-l from-slate-50 to-slate-100/50 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] backdrop-blur-sm z-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className={`transition-all duration-200 group border-b border-slate-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 ${
                      hoveredRow === row.id ? 'shadow-lg shadow-blue-500/10' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {visibleColumns.map(col => (
                      <td key={col.key} className="py-4 px-6 text-sm whitespace-nowrap min-w-[160px] max-w-[200px] border-r border-slate-100/50 last:border-r-0 relative">
                        {renderCellContent(row, col)}
                      </td>
                    ))}
                    <td className="py-4 px-6 text-right w-40 min-w-[160px] sticky right-0 bg-white group-hover:bg-gradient-to-l group-hover:from-blue-50/50 group-hover:to-indigo-50/30 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] border-l border-slate-200 z-10">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(row)}
                          className="group/btn p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                        </button>
                        <button
                          onClick={() => onDelete(row)}
                          className="group/btn p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
                          title="Delete"
                        >
                          <X className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;