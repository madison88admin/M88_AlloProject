import { ChevronDown, Eye, EyeOff, Settings, Plus, Trash2, X, AlertTriangle, GripVertical } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import type { Filters, Column, ColumnVisibility } from '../types';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  getUniqueValues: (key: string) => string[];
  columns: Column[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  onColumnUpdate?: (columns: Column[]) => void;
  onAddCustomColumn?: (columnData: { name: string; type: 'text' | 'select' | 'boolean'; options?: string[] }) => Promise<void>;
  onClose?: () => void;
  userRole?: string; // Add userRole prop
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
  onAddCustomColumn,
  onClose,
  userRole // Destructure userRole
}: FiltersPanelProps) => {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'select' | 'boolean'>('text');
  const [newColumnOptions, setNewColumnOptions] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  
  // Drag and drop state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null
  });
  
  const dragItemRef = useRef<HTMLDivElement>(null);
  const dragOverItemRef = useRef<HTMLDivElement>(null);

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

  const addColumn = async () => {
    if (!newColumnName.trim() || userRole === 'factory') return; // Prevent factory users from adding columns
    
    setIsAddingColumn(true);

    try {
      // Check for duplicate column names
      const existingColumn = columns.find(col => 
        col.label.toLowerCase() === newColumnName.toLowerCase()
      );
      
      if (existingColumn) {
        alert('A column with this name already exists. Please choose a different name.');
        return;
      }

      const columnData = {
        name: newColumnName,
        type: newColumnType,
        options: newColumnType === 'select' ? newColumnOptions.filter(opt => opt.trim()) : undefined,
      };

      // Use the enhanced handler from app.tsx if available, otherwise fall back to local handler
      if (onAddCustomColumn) {
        await onAddCustomColumn(columnData);
      } else if (onColumnUpdate) {
        // Fallback to local column management (legacy behavior)
        const baseKey = newColumnName.toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        
        let columnKey = baseKey;
        let counter = 1;
        while (columns.find(col => col.key === columnKey)) {
          columnKey = `${baseKey}_${counter}`;
          counter++;
        }

        const newColumn: Column = {
          key: columnKey,
          label: newColumnName,
          type: newColumnType,
          options: columnData.options,
          width: '150px',
          custom: true
        };

        const updatedColumns = [...columns, newColumn];
        onColumnUpdate(updatedColumns);

        // Make the new column visible by default
        onColumnVisibilityChange({
          ...columnVisibility,
          [columnKey]: true
        });
      }

      // Reset form
      setNewColumnName('');
      setNewColumnType('text');
      setNewColumnOptions([]);
      setShowAddColumn(false);
      setShowWarning(false);

    } catch (error) {
      console.error('Error adding custom column:', error);
      alert('Failed to add custom column. Please try again.');
    } finally {
      setIsAddingColumn(false);
    }
  };

  const isSystemColumn = (columnKey: string) => {
    return systemColumns.includes(columnKey);
  };

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
                      {getUniqueValues(key).map(value => (
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
                {/* Only show Add Column button for non-factory users */}
                {userRole !== 'factory' && (onColumnUpdate || onAddCustomColumn) && (
                  <button
                    onClick={() => {
                      setShowAddColumn(true);
                      setShowWarning(!onAddCustomColumn); // Only show warning for local-only columns
                    }}
                    className="text-sm text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Column
                  </button>
                )}
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
                  {columns.map((col, index) => (
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
                      {userRole !== 'factory' && (onColumnUpdate || onAddCustomColumn) && !isSystemColumn(col.key) && (
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

        {/* Add Column Modal - Only show for non-factory users */}
        {userRole !== 'factory' && showAddColumn && (onColumnUpdate || onAddCustomColumn) && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Add New Column</h3>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName('');
                    setNewColumnType('text');
                    setNewColumnOptions([]);
                    setShowWarning(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showWarning && !onAddCustomColumn && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Local Storage Warning</p>
                      <p className="text-amber-700 mt-1">
                        This column will only exist locally and won't be saved to the database. 
                        For permanent columns, you'll need to modify your database schema.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {onAddCustomColumn && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Custom Field</p>
                      <p className="text-blue-700 mt-1">
                        This column will be saved as a custom field in your database and can be reordered by dragging.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Column Name *
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter column name"
                    disabled={isAddingColumn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Column Type
                  </label>
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as 'text' | 'select' | 'boolean')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isAddingColumn}
                  >
                    <option value="text">Text</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                  </select>
                </div>

                {newColumnType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newColumnOptions.join(', ')}
                      onChange={(e) => setNewColumnOptions(
                        e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                      )}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Option 1, Option 2, Option 3"
                      disabled={isAddingColumn}
                    />
                    {newColumnOptions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {newColumnOptions.map((option, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={addColumn}
                    disabled={!newColumnName.trim() || isAddingColumn || userRole === 'factory'}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {isAddingColumn ? 'Adding...' : 'Add Column'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnName('');
                      setNewColumnType('text');
                      setNewColumnOptions([]);
                      setShowWarning(false);
                    }}
                    disabled={isAddingColumn}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;