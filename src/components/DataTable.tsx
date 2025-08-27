import { ArrowUpDown, Edit2, X, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DataRecord, Column, SortConfig } from '../types';
import { StatusBadge } from './StatusBadge';
import { ClassificationBadge } from './ClassificationBadge';
import { useState, useRef, useEffect } from 'react';

interface DataTableProps {
  data: DataRecord[];
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  onEdit: (row: DataRecord) => void;
  onDelete: (id: number) => void;
}

export const DataTable = ({
  data,
  columns,
  sortConfig,
  onSort,
  onEdit,
  onDelete
}: DataTableProps) => {
  const visibleColumns = columns; // Show all columns instead of limiting to 7
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

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
                      {col.label}
                      <ArrowUpDown className={`w-3 h-3 transition-all ${
                        sortConfig.key === col.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
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
    </div>
  );
};


export default DataTable;