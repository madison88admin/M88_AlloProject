import { ArrowUpDown, Edit2, X, Database, Trash2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { DataRecord, Column, SortConfig } from '../types';
import ContactPersonModal from './ContactPersonModal';
import BrandModal from './BrandModal';
import BrandModalFactory from './BrandModalFactory';

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
  tableType?: 'company' | 'factory' | 'admin';
  groupLabels?: Record<string, string>;
  groupColors?: Record<string, {
    background: string;
    border: string;
    text: string;
    hover: string;
    headerBg: string;
    cellBg: string;
  }>;
}

// Consistent color scheme
const defaultGroupColors: Record<string, {
  background: string;
  border: string;
  text: string;
  hover: string;
  headerBg: string;
  cellBg: string;
}> = {
  company: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    hover: 'hover:bg-blue-100',
    headerBg: 'bg-blue-100',
    cellBg: 'bg-blue-25'
  },
  factory: {
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    hover: 'hover:bg-emerald-100',
    headerBg: 'bg-emerald-100',
    cellBg: 'bg-emerald-25'
  },
  admin: {
    background: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    hover: 'hover:bg-purple-100',
    headerBg: 'bg-purple-100',
    cellBg: 'bg-purple-25'
  },
  default: {
    background: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-900',
    hover: 'hover:bg-slate-100',
    headerBg: 'bg-slate-100',
    cellBg: 'bg-slate-25'
  }
};

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
    const flattenedValue = row[columnKey];
    if (flattenedValue !== undefined) {
      return flattenedValue;
    }
    
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
      <div className="w-full flex items-center justify-center">
        <span 
          className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md cursor-not-allowed ${
            normalizedValue === 'Yes' 
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
              : 'text-slate-500 bg-slate-50 border border-slate-200'
          }`}
        >
          {normalizedValue || '—'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <button
        onClick={handleToggle}
        className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 border ${
          normalizedValue === 'Yes'
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
        }`}
        title={`Click to ${normalizedValue === 'Yes' ? 'clear' : 'set to Yes'}`}
      >
        {normalizedValue || '—'}
      </button>
    </div>
  );
};

const contactPersonColumns = [
  'lead_pbd', 'support_pbd', 'td', 'nyo_planner', 'indo_m88_md', 'indo_m88_qa',
  'mlo_planner', 'mlo_logistic', 'mlo_purchasing', 'mlo_costing'
];

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
  tableType,
  groupLabels = {},
  groupColors: propGroupColors = {}
}: DataTableProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{rowId: number, columnKey: string} | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState<{ brand: string; position: string }[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedBrandData, setSelectedBrandData] = useState<DataRecord | null>(null);

  // Merge provided group colors with defaults
  const groupColors = { ...defaultGroupColors, ...propGroupColors };

  // Determine if actions column should be shown
  const showActionsColumn = tableType !== 'factory';

  // Helper function to get group colors for a column
  const getColumnColors = (columnKey: string) => {
    const groupName = groupLabels[columnKey];
    return groupColors[groupName] || groupColors.default;
  };

  // Parse a width string like '150px' to a number of pixels (default 150)
  const parseWidthPx = (width?: string): number => {
    if (!width) return 150;
    const match = /([0-9]+)px/.exec(width.trim());
    return match ? parseInt(match[1], 10) : 150;
  };

  useEffect(() => {
    if (editingColumn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingColumn]);

  // Use all columns passed from parent (filtered by visibility in App.tsx)
  const visibleColumns = columns;

  // Compute sticky left offsets for the first columns (freeze key brand columns)
  const stickyLeftCount = tableType === 'factory' ? 1 : 2;
  const leftOffsets: number[] = [];
  const stickyWidths: number[] = [];
  {
    let acc = 0;
    for (let i = 0; i < Math.min(stickyLeftCount, visibleColumns.length); i++) {
      const width = parseWidthPx(visibleColumns[i]?.width);
      leftOffsets[i] = acc;
      stickyWidths[i] = width;
      acc += width;
    }
  }
  const totalStickyWidth = leftOffsets[stickyLeftCount - 1] + (stickyWidths[stickyLeftCount - 1] || 0);

  // Helper function to get consistent background color for frozen section
  const getFrozenBgColor = (rowIndex: number, isHeader: boolean = false) => {
    if (isHeader) {
      return '#ffffff'; // Always white for headers
    }
    return rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
  };

  const updateColumnName = (columnKey: string, newName: string) => {
    if (!onColumnUpdate) return;
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, label: newName } : col
    );
    onColumnUpdate(updatedColumns);
    setEditingColumn(null);
  };

  const handleCellEdit = (rowId: number, columnKey: string) => {
    setEditingCell({ rowId, columnKey });
  };

  const handleCellUpdate = (rowId: number, columnKey: string, newValue: any) => {
    if (onCellUpdate) {
      onCellUpdate(rowId, columnKey, newValue);
    }
    setEditingCell(null);
  };

  const handleContactClick = (name: string) => {
    // Filter out contact persons with "-" names (blank entries)
    if (!name || name === '-' || name.trim() === '') {
      return; // Don't open modal for blank entries
    }
  
    const details: { brand: string; position: string }[] = [];
    data.forEach(row => {
      contactPersonColumns.forEach(col => {
        const contactPersonName = row[col];
        // Only include entries where the contact person name is not "-" or blank
        if (contactPersonName && 
            String(contactPersonName).toLowerCase() === name.toLowerCase() &&
            contactPersonName !== '-') {
          details.push({ 
            brand: row.all_brand, 
            position: col 
          });
        }
      });
    });
    
    // Only open modal if we have valid details
    if (details.length > 0) {
      setSelectedContact(name);
      setContactDetails(details);
    }
  };

  const handleBrandClick = (brandName: string) => {
    let brandRow;
    
    if (tableType === 'factory') {
      // For factory table, find by brand_visible_to_factory
      brandRow = data.find(row => row.brand_visible_to_factory === brandName);
    } else {
      // For other tables, find by all_brand
      brandRow = data.find(row => row.all_brand === brandName);
    }
    
    if (brandRow) {
      setSelectedBrand(brandName);
      setSelectedBrandData(brandRow);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    e.stopPropagation();
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', columnKey);
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
    const cellValue = getRowValue(row, col.key);
    
    // Handle editing state for yes_blank fields specially
    if (isEditing && col.type === 'yes_blank') {
      return (
        <div className="px-2">
          <select
            ref={inputRef as any}
            defaultValue={cellValue === 'Yes' || cellValue === 'yes' ? 'Yes' : ''}
            className="w-full bg-white border-2 border-blue-500 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-0"
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
        </div>
      );
    }
    
    // Handle editing state for other field types
    if (isEditing && col.type !== 'yes_blank') {
      if (col.type === 'select' && col.options) {
        return (
          <div className="px-2">
            <select
              ref={inputRef as any}
              defaultValue={cellValue || ''}
              className="w-full bg-white border-2 border-blue-500 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-0"
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
          </div>
        );
      } else if (col.type === 'boolean') {
        return (
          <div className="px-2">
            <select
              ref={inputRef as any}
              defaultValue={cellValue ? 'true' : 'false'}
              className="w-full bg-white border-2 border-blue-500 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-0"
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
          </div>
        );
      } else {
        return (
          <div className="px-2">
            <input
              ref={inputRef}
              type="text"
              defaultValue={cellValue || ''}
              className="w-full bg-white border-2 border-blue-500 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-0"
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
          </div>
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
        if (Array.isArray(cellValue)) {
          return (
            <div className="flex flex-wrap gap-1 px-2 py-1">
              {cellValue.map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 whitespace-nowrap"
                >
                  {String(item)}
                </span>
              ))}
            </div>
          );
        }
        
        if (isEditable && col.options) {
          return (
            <div className="px-2 py-1">
              <select
                value={cellValue || ''}
                onChange={(e) => handleCellUpdate(row.id, col.key, e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {col.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          );
        }
        
        return (
          <div className="px-2 py-1">
            <span className={`${cellValue ? 'text-slate-900' : 'text-slate-400'}`}>
              {cellValue || '—'}
            </span>
          </div>
        );

      case 'boolean':
        const buttonClass = `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          cellValue 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-slate-100 text-slate-600'
        }`;
        
        if (isEditable) {
          return (
            <div className="px-2 py-1 flex justify-center">
              <button
                onClick={() => handleCellUpdate(row.id, col.key, !cellValue)}
                className={`${buttonClass} transition-colors duration-200 hover:opacity-80`}
              >
                {cellValue ? 'Yes' : 'No'}
              </button>
            </div>
          );
        }
        
        return (
          <div className="px-2 py-1 flex justify-center">
            <div className={buttonClass}>
              {cellValue ? 'Yes' : 'No'}
            </div>
          </div>
        );

      default:
        // Handle complex objects
        if (typeof cellValue === 'object' && cellValue !== null) {
          return (
            <div className="px-2 py-1">
              <span 
                className={`text-slate-600 text-xs ${isEditable ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed'} px-2 py-1 rounded truncate block`}
                title={JSON.stringify(cellValue, null, 2)}
                onClick={isEditable ? () => handleCellEdit(row.id, col.key) : undefined}
              >
                {JSON.stringify(cellValue).length > 30 
                  ? `${JSON.stringify(cellValue).substring(0, 30)}...` 
                  : JSON.stringify(cellValue)
                }
              </span>
            </div>
          );
        }
        
              // Special handling for brand columns - different columns for different table types
        const brandColumnKey = tableType === 'factory' ? 'brand_visible_to_factory' : 'all_brand';
        if (col.key === brandColumnKey && cellValue) {
          return (
            <div className="px-2 py-1">
              <button
                className="text-blue-700 underline hover:text-blue-900 font-medium transition-colors duration-200"
                onClick={() => handleBrandClick(cellValue)}
                type="button"
              >
                {cellValue}
              </button>
            </div>
          );
        }

        // Contact person columns
        if (contactPersonColumns.includes(col.key)) {
          if (tableType === 'factory') {
            return (
              <div className="px-2 py-1">
                <span className="text-slate-900">
                  {cellValue || '—'}
                </span>
              </div>
            );
          }

          return (
            <div className="px-2 py-1">
              <button
                className="text-blue-700 underline hover:text-blue-900 font-medium transition-colors duration-200"
                onClick={() => handleContactClick(cellValue)}
                type="button"
              >
                {cellValue || '—'}
              </button>
            </div>
          );
        }

        // Editable text fields
        if (isEditable && (col.type === 'text' || !col.type)) {
          const factoryEditableColumns = ['hz_pt_u_jump_senior_md', 'pt_ujump_local_md', 'hz_u_jump_shipping', 'pt_ujump_shipping'];
          
          if (tableType === 'factory' && factoryEditableColumns.includes(col.key)) {
            return (
              <div className="px-2 py-1">
                <span 
                  className="text-slate-900 cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded transition-colors duration-200"
                  onClick={() => handleCellEdit(row.id, col.key)}
                >
                  {cellValue || '—'}
                </span>
              </div>
            );
          }

          if (tableType !== 'factory') {
            return (
              <div className="px-2 py-1">
                <span 
                  className="text-slate-900 cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded transition-colors duration-200"
                  onClick={() => handleCellEdit(row.id, col.key)}
                >
                  {cellValue || '—'}
                </span>
              </div>
            );
          }
        }

        // Default: just render value
        return (
          <div className="px-2 py-1">
            <span className="text-slate-900">{cellValue || '—'}</span>
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Scroll Controls */}
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
          className="overflow-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          style={{ scrollbarWidth: 'thin' }}
        >
          <table className="w-full min-w-max">
            <thead className="sticky top-0 z-50 bg-white shadow-sm">
              {/* Group header row */}
              {Object.keys(groupLabels).length > 0 && (
                <tr className="border-b border-slate-200">
                  {(() => {
                    const cells: JSX.Element[] = [];
                    let i = 0;
                    while (i < visibleColumns.length) {
                      const col = visibleColumns[i];
                      const label = groupLabels[col.key] || '';
                      const colors = getColumnColors(col.key);
                      const isSticky = i < stickyLeftCount;

                      let span = 1;
                      let j = i + 1;
                      while (
                        j < visibleColumns.length &&
                        (groupLabels[visibleColumns[j].key] || '') === label
                      ) {
                        span++;
                        j++;
                      }

                      cells.push(
                        <th
                          key={`grp-${i}`}
                          colSpan={span}
                          className={`text-center py-3 px-4 text-xs font-bold uppercase tracking-wide whitespace-nowrap border-r border-slate-200 last:border-r-0 ${colors.text} ${colors.headerBg} ${
                            isSticky ? 'sticky z-50' : ''
                          }`}
                          style={isSticky ? { 
                            left: leftOffsets[i], 
                            backgroundColor: getFrozenBgColor(-1, true),
                            boxShadow: i === stickyLeftCount - 1 ? '2px 0 4px -2px rgba(0,0,0,0.15)' : 'none'
                          } : {}}
                        >
                          {label}
                        </th>
                      );

                      i = j;
                    }
                    return cells;
                  })()}
                  {showActionsColumn && (
                    <th className="w-32 py-3 px-4 text-center text-xs font-bold uppercase tracking-wide text-slate-700 bg-slate-100 border-l-2 border-slate-300 sticky right-0 z-50" 
                        style={{ backgroundColor: getFrozenBgColor(-1, true), boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.15)' }}>
                      Actions
                    </th>
                  )}
                </tr>
              )}

              {/* Main header row */}
              <tr className="border-b-2 border-slate-200">
                {visibleColumns.map((col, colIndex) => {
                  const colors = getColumnColors(col.key);
                  const isSticky = colIndex < stickyLeftCount;
                  const isLastSticky = colIndex === stickyLeftCount - 1;

                  return (
                    <th
                      key={col.key}
                      draggable={onColumnUpdate !== undefined}
                      onDragStart={(e) => handleDragStart(e, col.key)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, col.key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.key)}
                      className={`text-left py-4 px-4 text-sm font-semibold cursor-pointer transition-all duration-150 group whitespace-nowrap min-w-[150px] border-r border-slate-200 ${colors.headerBg} ${colors.text}
                        ${draggedColumn === col.key ? 'opacity-50 bg-blue-100' : ''}
                        ${dragOverColumn === col.key && draggedColumn !== col.key ? 'bg-blue-200 border-l-4 border-blue-600' : ''}
                        ${onColumnUpdate ? 'select-none' : ''}
                        ${isSticky ? 'sticky z-50' : ''}
                        ${isLastSticky ? 'border-r-2 border-slate-300' : ''}
                      `}
                      style={isSticky ? { 
                        left: leftOffsets[colIndex], 
                        width: col.width || '150px',
                        backgroundColor: getFrozenBgColor(-1, true),
                        boxShadow: isLastSticky ? '2px 0 4px -2px rgba(0,0,0,0.15)' : 'none'
                      } : { width: col.width || '150px' }}
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
                              className="bg-white border-2 border-blue-500 rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-0"
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
                              className="cursor-pointer hover:text-blue-600 flex items-center gap-1 flex-1 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (col.custom) {
                                  setEditingColumn(col.key);
                                }
                              }}
                            >
                              {col.label}
                              {col.custom && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                                  custom
                                </span>
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
                  );
                })}
                {showActionsColumn && (
                  <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700 w-32 sticky right-0 z-50 border-l-2 border-slate-300" 
                      style={{ 
                        backgroundColor: getFrozenBgColor(-1, true),
                        boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.15)'
                      }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-200">
              {data.map((row, rowIndex) => (
                <tr 
                  key={row.id} 
                  className="group transition-all duration-150 hover:bg-blue-50/50"
                >
                  {visibleColumns.map((col, colIndex) => {
                    const colors = getColumnColors(col.key);
                    const isSticky = colIndex < stickyLeftCount;
                    const isLastSticky = colIndex === stickyLeftCount - 1;
                    
                    return (
                      <td
                        key={col.key}
                        className={`text-sm border-r border-slate-200 transition-all duration-150 ${
                          col.custom ? 'bg-purple-50/20' : ''
                        } ${
                          isSticky ? 'sticky z-40' : ''
                        } ${
                          isLastSticky ? 'border-r-2 border-slate-300' : ''
                        }`}
                        style={isSticky ? { 
                          left: leftOffsets[colIndex], 
                          width: col.width || '150px',
                          backgroundColor: getFrozenBgColor(rowIndex),
                          boxShadow: isLastSticky ? '2px 0 4px -2px rgba(0,0,0,0.1)' : 'none'
                        } : { width: col.width || '150px' }}
                      >
                        <div className="py-3 min-h-[3rem] flex items-center">
                          {renderCellContent(row, col)}
                        </div>
                      </td>
                    );
                  })}
                  
                  {showActionsColumn && (
                    <td 
                      className="text-center sticky right-0 z-40 border-l-2 border-slate-300"
                      style={{ 
                        backgroundColor: getFrozenBgColor(rowIndex),
                        boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="py-3 min-h-[3rem] flex items-center justify-center">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Contact Person Modal */}
      {selectedContact && (
        <ContactPersonModal
          name={selectedContact}
          details={contactDetails}
          onClose={() => setSelectedContact(null)}
        />
      )}
      
      {/* Brand Modal - Conditional rendering based on tableType */}
      {selectedBrand && selectedBrandData && (
        <>
          {tableType === 'factory' ? (
            <BrandModalFactory
              brand={selectedBrand}
              brandData={selectedBrandData}
              onClose={() => {
                setSelectedBrand(null);
                setSelectedBrandData(null);
              }}
            />
          ) : (
            <BrandModal
              brand={selectedBrand}
              brandData={selectedBrandData}
              onClose={() => {
                setSelectedBrand(null);
                setSelectedBrandData(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;