import { ArrowUpDown, Edit2, X, Database, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onDelete: (id: number) => void;
  onColumnUpdate?: (columns: Column[]) => void;
}

export const DataTable = ({
  data,
  columns,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onColumnUpdate
}: DataTableProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnType, setNewColumnType] = useState<'text' | 'select' | 'boolean'>('text');
  const [newColumnOptions, setNewColumnOptions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  useEffect(() => {
    if (editingColumn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingColumn]);

  // Use all columns passed from parent (filtered by visibility in App.tsx)
  const visibleColumns = columns;

  const updateColumnName = (columnKey: string, newName: string) => {
    if (!onColumnUpdate) return;
    
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, label: newName } : col
    );
    onColumnUpdate(updatedColumns);
    setEditingColumn(null);
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No records found</h3>
        <p className="text-slate-500 max-w-sm">Try adjusting your search terms or filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="relative">
        {/* Scroll Progress Bar - Moved to top */}
        <div className="mb-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
            style={{
              width: scrollContainerRef.current 
                ? `${(scrollContainerRef.current.scrollLeft / (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth)) * 100}%`
                : '0%'
            }}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Scroll Controls - Positioned at top of table */}
          <div className="flex items-center justify-center p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Scroll left"
                disabled={!showLeftScroll}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={scrollRight}
                className="w-10 h-10 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Scroll right"
                disabled={!showRightScroll}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
            style={{ scrollbarWidth: 'thin' }}
          >
            <table className="w-full min-w-max">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                <tr className="border-b border-slate-200">
                  {visibleColumns.map(col => (
                    <th
                      key={col.key}
                      className="text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors duration-150 group whitespace-nowrap min-w-[150px]"
                      onClick={() => onSort(col.key)}
                    >
                      <div className="flex items-center gap-2">
                        {editingColumn === col.key ? (
                          <input
                            ref={inputRef}
                            type="text"
                            defaultValue={col.label}
                            className="bg-white border border-blue-500 rounded px-2 py-1 text-sm w-full"
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
                            className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                            onClick={() => setEditingColumn(col.key)}
                          >
                            {col.label}
                            <ArrowUpDown 
                              className={`w-3 h-3 transition-all ${
                                sortConfig.key === col.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
                            className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 transition-all"
                            title="Delete column"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 w-32 sticky right-0 bg-white shadow-[-2px_0_0_0_rgba(0,0,0,0.05)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                  <tr key={row.id} className="odd:bg-slate-50/30 hover:bg-slate-50 transition-colors duration-150 group">
                    {visibleColumns.map(col => (
                      <td key={col.key} className="py-4 px-6 text-sm whitespace-nowrap min-w-[150px]">
                        {col.key === 'status' ? (
                          <StatusBadge status={String(row[col.key] ?? '')} />
                        ) : col.key === 'brand_classification' ? (
                          <ClassificationBadge classification={String(row[col.key] ?? '')} />
                        ) : col.type === 'boolean' ? (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            row[col.key] 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {row[col.key] ? 'Yes' : 'No'}
                          </div>
                        ) : (
                          <span className={`${row[col.key] ? 'text-slate-900' : 'text-slate-400'}`}>
                            {row[col.key] || '—'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-4 px-6 text-right sticky right-0 bg-white shadow-[-2px_0_0_0_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => onEdit(row)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(row.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Column Modal */}
        {showAddColumn && onColumnUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

        {/* Add Column Button */}
        {onColumnUpdate && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAddColumn(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;