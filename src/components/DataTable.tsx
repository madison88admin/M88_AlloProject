import { ArrowUpDown, Edit2, X, Database } from 'lucide-react';
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
}

export const DataTable = ({
  data,
  columns,
  sortConfig,
  onSort,
  onEdit,
  onDelete
}: DataTableProps) => {
  const visibleColumns = columns.slice(0, 7);

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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <tr className="border-b border-slate-200">
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  className="text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors duration-150 group"
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
              <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="odd:bg-slate-50/30 hover:bg-slate-50 transition-colors duration-150 group">
                {visibleColumns.map(col => (
                  <td key={col.key} className="py-4 px-6 text-sm">
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
                <td className="py-4 px-6 text-right">
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