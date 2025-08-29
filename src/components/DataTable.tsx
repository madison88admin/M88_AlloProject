import { ArrowUpDown, Edit2, X, Database, Trash2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
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
  editableColumns?: string[];
}

// Utility functions for Yes/Blank handling
const normalizeYesBlankValue = (value: any): string => {
  if (!value || value === '' || value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value).toLowerCase().trim();
  if (stringValue === 'yes') {
    return 'Yes';
  }
  
  return '';
};

// Helper function to get row value (handles custom fields)
const getRowValue = (row: DataRecord, columnKey: string) => {
  if (columnKey.startsWith('custom_')) {
    // For custom fields, check if it's already flattened or in custom_fields object
    const flattenedValue = row[columnKey];
    if (flattenedValue !== undefined) {
      return flattenedValue;
    }
    
    // Fallback to custom_fields object
    const customKey = columnKey.replace('custom_', '');
    return row.custom_fields?.[customKey];
  }
  
  return row[columnKey];
};

// Yes/Blank Cell Component
const YesBlankCell = ({ 
  value, 
  onUpdate, 
  isEditable = true 
}: { 
  value: any; 
  onUpdate: (newValue: string) => void;
  isEditable?: boolean;
}) => {
  const normalizedValue = normalizeYesBlankValue(value);
  
  const handleToggle = () => {
    if (!isEditable) return;
    const newValue = normalizedValue === 'Yes' ? '' : 'Yes';
    onUpdate(newValue);
  };

  if (!isEditable) {
    return (
      <span 
        className={`inline-flex items-center justify-center w-full h-8 text-sm font-medium rounded cursor-not-allowed ${
          normalizedValue === 'Yes' 
            ? 'text-green-700 bg-green-50 border border-green-200' 
            : 'text-gray-500'
        }`}
      >
        {normalizedValue || '—'}
      </span>
    );
  }
  

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center w-full h-8 text-sm font-medium rounded transition-all duration-200 border ${
        normalizedValue === 'Yes'
          ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
          : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
      }`}
      title={`Click to ${normalizedValue === 'Yes' ? 'clear' : 'set to Yes'}`}
    >
      {normalizedValue || '—'}
    </button>
  );
};

export const DataTable = ({
  data,
  columns,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onColumnUpdate,
  onCellUpdate,
  editableColumns = columns.map(col => col.key),
}: DataTableProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{rowId: number, columnKey: string} | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    e.stopPropagation();
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', columnKey);
    
    // Add a slight delay to allow the drag to register properly
    setTimeout(() => {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.transform = 'rotate(-5deg)';
      dragImage.style.opacity = '0.8';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    
    if (!draggedColumn || !onColumnUpdate || draggedColumn === targetColumnKey) {
      return;
    }

    const draggedIndex = columns.findIndex(col => col.key === draggedColumn);
    const targetIndex = columns.findIndex(col => col.key === targetColumnKey);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newColumns = [...columns];
    const [draggedCol] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedCol);

    onColumnUpdate(newColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const renderCellContent = (row: DataRecord, col: Column) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === col.key;
    const isEditable = editableColumns.includes(col.key);
    
    // Get the value using our helper function
    const cellValue = getRowValue(row, col.key);
    
    // Handle editing state for yes_blank fields specially
    if (isEditing && col.type === 'yes_blank') {
      return (
        <select
          ref={inputRef as any}
          defaultValue={cellValue === 'Yes' || cellValue === 'yes' ? 'Yes' : ''}
          className="bg-white border border-blue-500 rounded px-2 py-1 text-sm w-full"
          onBlur={(e) => handleCellUpdate(row.id, col.key, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellUpdate(row.id, col.key, (e.target as HTMLSelectElement).value);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          autoFocus
        >
          <option value="">Blank</option>
          <option value="Yes">Yes</option>
        </select>
      );
    }
    
    // Handle editing state for other field types
    if (isEditing && col.type !== 'yes_blank') {
      // Handle different input types for editing
      if (col.type === 'select' && col.options) {
        return (
          <select
            ref={inputRef as any}
            defaultValue={cellValue || ''}
            className="bg-white border border-blue-500 rounded px-2 py-1 text-sm w-full"
            onBlur={(e) => handleCellUpdate(row.id, col.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellUpdate(row.id, col.key, (e.target as HTMLSelectElement).value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            autoFocus
          >
            <option value="">Select...</option>
            {col.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else if (col.type === 'boolean') {
        return (
          <select
            ref={inputRef as any}
            defaultValue={cellValue ? 'true' : 'false'}
            className="bg-white border border-blue-500 rounded px-2 py-1 text-sm w-full"
            onBlur={(e) => handleCellUpdate(row.id, col.key, e.target.value === 'true')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellUpdate(row.id, col.key, (e.target as HTMLSelectElement).value === 'true');
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            autoFocus
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      } else {
        return (
          <input
            ref={inputRef}
            type="text"
            defaultValue={cellValue || ''}
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
    }

    // Handle different column types for display
    switch (col.type) {
      case 'yes_blank':
        return (
          <YesBlankCell
            value={cellValue}
            onUpdate={(newValue) => handleCellUpdate(row.id, col.key, newValue)}
            isEditable={isEditable}
          />
        );

      case 'select':
        // Handle array values from custom fields
        if (Array.isArray(cellValue)) {
          return (
            <div className="flex flex-wrap gap-1">
              {cellValue.map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {String(item)}
                </span>
              ))}
            </div>
          );
        }
        
        // Render special badges for certain select fields
        if (col.key === 'status') {
          return <StatusBadge status={String(cellValue ?? '')} />;
        } else if (col.key === 'brand_classification') {
          return <ClassificationBadge classification={String(cellValue ?? '')} />;
        }
        
        // Handle regular select fields - make them interactive for editable columns
        if (isEditable && col.options) {
          return (
            <select
              value={cellValue || ''}
              onChange={(e) => handleCellUpdate(row.id, col.key, e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              {col.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }
        
        return (
          <span className={`${cellValue ? 'text-slate-900' : 'text-slate-400'}`}>
            {cellValue || '—'}
          </span>
        );

      case 'boolean':
        if (isEditable) {
          return (
            <button
              onClick={() => handleCellUpdate(row.id, col.key, !cellValue)}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-not-allowed ${
                cellValue 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cellValue ? 'Yes' : 'No'}
            </button>
          );
        }
        return (
          <div 
  className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-not-allowed ${
    cellValue 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-slate-100 text-slate-600'
  }`}
>
  {cellValue ? 'Yes' : 'No'}
</div>

        );

      default:
        // Handle complex objects - display as JSON string or formatted
        if (typeof cellValue === 'object' && cellValue !== null) {
          return (
            <span 
              className={`text-slate-600 text-xs ${isEditable ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed'} px-2 py-1 rounded`}
              title={JSON.stringify(cellValue, null, 2)}
              onClick={isEditable ? () => handleCellEdit(row.id, col.key, cellValue) : undefined}
            >
              {JSON.stringify(cellValue).length > 50 
                ? `${JSON.stringify(cellValue).substring(0, 50)}...` 
                : JSON.stringify(cellValue)
              }
            </span>
          );
        }
        
        // Text fields
        return (
          <span 
            className={`${cellValue ? 'text-slate-900' : 'text-slate-400'} ${isEditable ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed'} px-2 py-1 rounded`}
            onClick={isEditable ? () => handleCellEdit(row.id, col.key, cellValue) : undefined}
          >
            {cellValue || '—'}
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
                    draggable={onColumnUpdate !== undefined}
                    onDragStart={(e) => handleDragStart(e, col.key)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.key)}
                    className={`text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-all duration-150 group whitespace-nowrap min-w-[150px] relative ${
                      draggedColumn === col.key ? 'opacity-50 bg-blue-50' : ''
                    } ${
                      dragOverColumn === col.key && draggedColumn !== col.key ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    } ${
                      onColumnUpdate ? 'select-none' : ''
                    } ${
                      col.custom ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {onColumnUpdate && (
                        <div 
                          className="drag-handle opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded"
                          title="Drag to reorder column"
                        >
                          <GripVertical className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 flex-1" onClick={() => onSort(col.key)}>
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
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-blue-600 flex items-center gap-1 flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (col.custom) {
                                setEditingColumn(col.key);
                              }
                            }}
                          >
                            {col.label}
                            {col.custom && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">custom</span>
                            )}
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
                      
                      {onColumnUpdate && col.custom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteColumn(col.key);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all"
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
                    <td key={col.key} className={`py-4 px-6 text-sm whitespace-nowrap min-w-[150px] border-r border-slate-100 last:border-r-0 ${col.custom ? 'bg-purple-50/30' : ''}`}>
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