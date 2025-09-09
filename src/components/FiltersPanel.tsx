import { ChevronDown, Eye, EyeOff, Settings, Trash2, X, GripVertical } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { Filters, Column, ColumnVisibility } from '../types';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  getUniqueValues: (key: string) => string[];
  columns: Column[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  onColumnUpdate?: (columns: Column[]) => void;
  onClose?: () => void;
  userRole?: string; // Add userRole prop
  groupLabels?: Record<string, string>;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

export const FiltersPanel = ({
  filters,
  onFiltersChange,
  getUniqueValues,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  onColumnUpdate,
  onClose,
  userRole, // Destructure userRole
  groupLabels
}: FiltersPanelProps) => {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  // Drag and drop state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null
  });
  
  // const dragItemRef = useRef<HTMLDivElement>(null);
  // const dragOverItemRef = useRef<HTMLDivElement>(null);

  // Core system columns that shouldn't be deleted
  const systemColumns = ['id', 'all_brand', 'brand_visible_to_factory', 'brand_classification', 'status', 'terms_of_shipment'];

  const toggleColumnVisibility = (columnKey: string) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    });
  };

  const toggleAllColumns = (visible: boolean) => {
    const newVisibility: ColumnVisibility = {};
    columns.forEach(col => {
      newVisibility[col.key] = visible;
    });
    onColumnVisibilityChange(newVisibility);
  };

  const deleteColumn = (columnKey: string) => {
    if (!onColumnUpdate || userRole === 'factory') return; // Prevent factory users from deleting columns
    
    // Prevent deletion of system columns
    if (systemColumns.includes(columnKey)) {
      alert('This is a core system column and cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the "${columns.find(c => c.key === columnKey)?.label}" column? This action cannot be undone.`)) {
      return;
    }
    
    const updatedColumns = columns.filter(col => col.key !== columnKey);
    
    // Remove from visibility as well
    const updatedVisibility = { ...columnVisibility };
    delete updatedVisibility[columnKey];
    onColumnVisibilityChange(updatedVisibility);
    
    onColumnUpdate(updatedColumns);
  };


  const isSystemColumn = (columnKey: string) => {
    return systemColumns.includes(columnKey);
  };

  // Filter columns for factory users to exclude 'Flags' group
  const visibleColumns = userRole === 'factory' && groupLabels
    ? columns.filter(col => groupLabels[col.key] !== 'Flags')
    : columns;

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (userRole === 'factory') return; // Prevent factory users from dragging
    
    setDragState({
      isDragging: true,
      draggedIndex: index,
      dragOverIndex: null
    });
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, [userRole]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (userRole === 'factory') return; // Prevent factory users from drag operations
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverIndex: index
    }));
  }, [userRole]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset dragOverIndex if we're leaving the entire item, not just a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({
        ...prev,
        dragOverIndex: null
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    if (userRole === 'factory') return; // Prevent factory users from dropping
    
    e.preventDefault();
    
    const { draggedIndex } = dragState;
    
    if (draggedIndex === null || draggedIndex === dropIndex || !onColumnUpdate) {
      return;
    }

    // Create new column order
    const newColumns = [...columns];
    const draggedColumn = newColumns[draggedIndex];
    
    // Remove dragged item
    newColumns.splice(draggedIndex, 1);
    
    // Insert at new position
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    // Update columns
    onColumnUpdate(newColumns);
    
    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null
    });
  }, [dragState, columns, onColumnUpdate, userRole]);

  const getDragClassName = (index: number) => {
    const { isDragging, draggedIndex, dragOverIndex } = dragState;
    
    let className = "flex items-center gap-2 p-3 rounded-lg border transition-all group ";
    
    // Add cursor based on user role
    if (userRole !== 'factory' && onColumnUpdate) {
      className += 'cursor-move ';
    } else {
      className += 'cursor-default ';
    }
    
    if (columnVisibility[columns[index]?.key]) {
      className += 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm ';
    } else {
      className += 'bg-slate-50 border-slate-200 hover:border-slate-300 ';
    }
    
    // Add drag states (only for non-factory users)
    if (userRole !== 'factory' && isDragging && draggedIndex === index) {
      className += 'ring-2 ring-blue-400 shadow-lg ';
    }
    
    if (userRole !== 'factory' && isDragging && dragOverIndex === index && draggedIndex !== index) {
      className += 'border-blue-400 bg-blue-50 ';
    }
    
    return className;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Filters & Column Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Data Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Data Filters</h3>
              <button 
                onClick={() => onFiltersChange({ status: '', brand_classification: '', terms_of_shipment: '' })}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries({
                status: 'Status',
                brand_classification: 'Classification',
                terms_of_shipment: 'Shipment Terms'
              }).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{label}</label>
                  <div className="relative">
                    <select
                      value={filters[key as keyof Filters]}
                      onChange={(e) => onFiltersChange({ ...filters, [key]: e.target.value })}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 text-slate-900 transition-all duration-200"
                    >
                      <option value="">All {label}</option>
                      {getUniqueValues(key)
                        .filter(v => key !== 'status' || String(v).trim().toLowerCase() !== 'inactive')
                        .map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column Visibility Controls */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Column Management
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllColumns(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Show All
                </button>
                <button
                  onClick={() => toggleAllColumns(false)}
                  className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Hide All
                </button>
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {showColumnSettings ? 'Hide' : 'Show'} Settings
                </button>
              </div>
            </div>

            {showColumnSettings && (
              <div className="space-y-3">
                {/* Only show drag instruction for non-factory users */}
                {userRole !== 'factory' && onColumnUpdate && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Drag columns to reorder them in the table</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-4">

                  {visibleColumns.map((col, index) => (
                    <div
                      key={col.key}
                      draggable={userRole !== 'factory' && !!onColumnUpdate} // Only allow dragging for non-factory users
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={getDragClassName(index)}
                      style={{ 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                    >
                      {/* Only show drag handle for non-factory users */}
                      {userRole !== 'factory' && onColumnUpdate && (
                        <GripVertical 
                          className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" 
                          onMouseDown={(e) => e.preventDefault()}
                        />
                      )}
                      
                      <div 
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onClick={() => toggleColumnVisibility(col.key)}
                      >
                        {columnVisibility[col.key] ? (
                          <Eye className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium truncate ${
                          columnVisibility[col.key] ? 'text-slate-900' : 'text-slate-500'
                        }`} title={col.label}>
                          {col.label}
                        </span>
                        <div className="flex gap-1">
                          {isSystemColumn(col.key) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="System column" />
                          )}
                          {col.custom && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Custom column" />
                          )}
                        </div>
                      </div>
                      
                      {/* Only show delete button for non-factory users */}
                      {userRole !== 'factory' && onColumnUpdate && !isSystemColumn(col.key) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteColumn(col.key);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all flex-shrink-0"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-600 mt-4">
              <span>
                {Object.values(columnVisibility).filter(Boolean).length} of {columns.length} columns visible
              </span>
              <span className="text-slate-400">|</span>
              <span>
                {Object.values(columnVisibility).filter(v => !v).length} hidden
              </span>
              <span className="text-slate-400">|</span>
              <span>
                {columns.filter(col => col.custom || !isSystemColumn(col.key)).length} custom columns
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FiltersPanel;