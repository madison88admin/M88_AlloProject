import { ArrowUpDown, Edit2, X, Database, Plus, Trash2 } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingColumn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingColumn]);

  // Use all columns passed from parent (filtered by visibility in App.tsx)
  const visibleColumns = columns;

  const updateColumnName = (columnKey: string, newName: string) => {
    if (!onColumnUpdate) return;
    // Only update the label, never the key
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, label: newName } : col
    );
    onColumnUpdate(updatedColumns);
    setEditingColumn(null);
  };

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
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full border-collapse">
                     <thead className="sticky top-0 bg-white z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <tr className="border-b border-slate-200">
              <th className="w-12 p-2 border border-slate-300 bg-slate-200 text-slate-600 font-medium text-center">
                #
              </th>
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  className="p-2 border border-slate-300 bg-slate-100 text-left font-medium text-slate-700 relative group"
                  style={{ width: col.width || '150px' }}
                >
                  <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-2 flex-1">
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
                     </div>
                     
                  </div>
                </th>
              ))}
                 <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 w-32 border border-slate-300 bg-slate-100 sticky right-0 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                   Actions
                 </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
                         {data.map((row, rowIndex) => (
               <tr key={row.id} className={`hover:bg-slate-50 transition-colors duration-150 group ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="p-2 border border-slate-300 bg-slate-50 text-center text-slate-600 font-medium relative group">
                  <div className="flex items-center justify-center">
                    <span>{rowIndex + 1}</span>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                {visibleColumns.map(col => (
                  <td key={col.key} className="p-2 border border-slate-300 hover:bg-blue-50 cursor-pointer">
                    <div className="text-sm">
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
                    </div>
                  </td>
                ))}
                                 <td className={`py-4 px-6 text-right border border-slate-300 sticky right-0 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
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
  );
};

export default DataTable;