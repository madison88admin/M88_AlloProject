import { ArrowUpDown, Edit2, X, Database, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onDelete: (record: DataRecord) => void; // Updated to accept full record
  onColumnUpdate?: (columns: Column[]) => void;
  onCellUpdate?: (rowId: number, columnKey: string, newValue: any) => void;
}

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

  // Show all data instead of paginated data
  const currentData = data;

  const updateColumnName = (columnKey: string, newName: string) => {
    if (!onColumnUpdate) return;
    // Only update the label, never the key
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, label: newName } : col
    );
    onColumnUpdate(updatedColumns);
    setEditingColumn(null);
  };

  const handleCellEdit = (rowId: number, columnKey: string, currentValue: any) => {
    setEditingCell({ rowId, columnKey });
  };

  const handleCellUpdate = (rowId: number, columnKey: string, newValue: any) => {
    if (onCellUpdate) {
      onCellUpdate(rowId, columnKey, newValue);
    }
    setEditingCell(null);
  };

  const renderCellContent = (row: DataRecord, col: Column) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === col.key;
    
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          defaultValue={row[col.key] || ''}
          className="bg-white border border-blue-500 rounded px-2 py-1 text-sm w-full"
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
      );
    }

    if (col.key === 'status') {
      return <StatusBadge status={String(row[col.key] ?? '')} />;
    } else if (col.key === 'brand_classification') {
      return <ClassificationBadge classification={String(row[col.key] ?? '')} />;
    } else if (col.type === 'boolean') {
      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
          row[col.key] 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-slate-100 text-slate-600'
        }`}>
          {row[col.key] ? 'Yes' : 'No'}
        </div>
      );
    } else {
      return (
        <span 
          className={`${row[col.key] ? 'text-slate-900' : 'text-slate-400'} cursor-pointer hover:bg-slate-100 px-2 py-1 rounded`}
          onClick={() => handleCellEdit(row.id, col.key, row[col.key])}
        >
          {row[col.key] || '—'}
        </span>
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
    <div className="relative">
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
          className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
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
              {data.map((row, index) => (
                <tr key={row.id} className="odd:bg-slate-50/30 hover:bg-blue-50/30 transition-all duration-150 group border-b border-slate-100 last:border-b-0">
                  {visibleColumns.map(col => (
                    <td key={col.key} className="py-4 px-6 text-sm whitespace-nowrap min-w-[150px] border-r border-slate-100 last:border-r-0">
                      {renderCellContent(row, col)}
                    </td>
                  ))}
                  <td className="py-4 px-6 text-right sticky right-0 bg-white shadow-[-2px_0_0_0_rgba(0,0,0,0.05)] group-hover:bg-blue-50/30 border-l border-slate-200">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
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
    </div>
  );
};

export default DataTable;