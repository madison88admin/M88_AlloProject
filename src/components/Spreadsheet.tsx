import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { SpreadsheetData, Row, Column, Cell } from '../types/spreadsheet';
import { parseCSVData } from '../utils/csvParser';

const Spreadsheet: React.FC = () => {
  // Initialize with CSV data
  const initializeData = () => {
    const csvContent = `All Brand,Brand Visible to Factory,Brand Classification,STATUS,Terms of shipment,Lead PBD,Support PBD,TD,NYO PLANNER,Indo M88 MD,M88 QA,MLO PLANNER,MLO LOGISTIC,MLO PURCHASING,MLO COSTING,Wuxi Moretti,HZ U-JUMP,PT U-JUMP,Korea Mel,Singfore,Heads Up,HZ/PT U-JUMP Senior MD,PT UJUMP Local MD,HZ U-JUMP SHIPPING,PT UJUMP SHIPPING,FACTORY,ALLOCATION
YETI,YETI,,Inactive,FOB,,,,On hold,,REZA- Inactive,TBA,,TBA,,,,Yes,,,,Meli,0,0,0,PT-UWU,
VANS,VANS,Growth,Active,FOB,Brooke,-,Dylan,May,DENGELLEN,Addiar,Jennieviv,Edbert / Arianne,Shania,Aci,,,Yes,,,,Della,Nauroh,Susan,Siti,PT-UWU,
UNDER ARMOUR,UNDER ARMOUR,Growth,Active,FOB,Nicole,,Garrett,Jessie,ANITA,Rowena,Miguel,Arianne/Tim (APAC),Mary,Aci,,Yes,Yes,,,,Echo(China) / Rivan (Indo),0,Tiffany,Imas,HZ-U,PT-UWU
THE NORTH FACE,THE NORTH FACE,Growth,Active,FOB,Brooke,,Julia,Ron,ANITA,Iwan,Ron (Indo COO)/Glecie,Elaine/Jez,Maricar(Kai),Aci,,,Yes,,,,Fiona/ Nadira,0,Susan,Imas,PT-UWU,
SMARTWOOL,SMARTWOOL,Top,Active,FOB,Nicole,,Dylan,May,ANITA,Iwan,Jennieviv,Elaine/Liane,Pamela (SS),Aci,,Yes,Yes,,,,Della,Nauroh,Susan,Imas,HZ-U,PT-UWU
COLUMBIA,COLUMBIA,Top,Active,FOB,Ester,Janelle,Garrett,Dee,Dini,Rowena,Dee/Miguel,Edbert/Jenica,Mariane/Pamela (SS),Aci,,,Yes,,,,Deli,0,Alice,Imas,PT-UWU,
BURTON,BURTON,Top,Active,FOB,KB,Allie/Caroline,Julia,May,Jeza/Tia,Arief,Jennieviv,Jenica/Edbert/ELAINE (CEBU FTY ONLY),Maricon (Con),Aci,,Yes,Yes,,,,Eric,Mayas,Tiffany,Laida,HZ-U,PT-UWU
Arc'teryx,Arc'teryx,Top,Active,FOB,Ester,Janelle,Garrett,Trevin,Dini,Reza,Carmela/ Glecie,Elaine/Liane,Maricon (Con),Aci,,,Yes,,,,Eric,Meli,Susan,Siti,PT-UWU,
FJALL RAVEN,FJALL RAVEN,Top,Active,FOB,Nicole,Caroline,Julia,May,Jeza/Tia,Addiar,Carmela,Elaine/SARAH,Sarah (SS),Lovely,,Yes,Yes,,,,Cady,0,Tiffany,Laida,HZ-U,PT-UWU`;
    
    return parseCSVData(csvContent);
  };

  const [data, setData] = useState<SpreadsheetData>(initializeData());
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'number'>('text');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const updateCell = (rowId: string, columnId: string, value: string | number) => {
    setData(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId 
          ? {
              ...row,
              cells: {
                ...row.cells,
                [columnId]: {
                  ...row.cells[columnId],
                  value: value
                }
              }
            }
          : row
      )
    }));
  };

  const addRow = () => {
    const newRowId = `row${Date.now()}`;
    const newCells: { [columnId: string]: Cell } = {};
    
    data.columns.forEach(column => {
      newCells[column.id] = {
        id: `cell${newRowId}-${column.id}`,
        value: column.type === 'number' ? 0 : '',
        type: column.type
      };
    });

    const newRow: Row = {
      id: newRowId,
      cells: newCells
    };

    setData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const deleteRow = (rowId: string) => {
    setData(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId)
    }));
  };

  const addColumn = () => {
    if (!newColumnName.trim()) return;

    const newColumnId = `col${Date.now()}`;
    const newColumn: Column = {
      id: newColumnId,
      name: newColumnName,
      type: newColumnType,
      width: 150
    };

    setData(prev => ({
      columns: [...prev.columns, newColumn],
      rows: prev.rows.map(row => ({
        ...row,
        cells: {
          ...row.cells,
          [newColumnId]: {
            id: `cell${row.id}-${newColumnId}`,
            value: newColumnType === 'number' ? 0 : '',
            type: newColumnType
          }
        }
      }))
    }));

    setNewColumnName('');
    setShowAddColumn(false);
  };

  const deleteColumn = (columnId: string) => {
    setData(prev => ({
      columns: prev.columns.filter(col => col.id !== columnId),
      rows: prev.rows.map(row => {
        const { [columnId]: deletedCell, ...remainingCells } = row.cells;
        return {
          ...row,
          cells: remainingCells
        };
      })
    }));
  };

  const updateColumnName = (columnId: string, newName: string) => {
    setData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, name: newName } : col
      )
    }));
    setEditingColumn(null);
  };

  const handleCellClick = (rowId: string, columnId: string) => {
    setEditingCell({ rowId, columnId });
  };

  const handleCellSubmit = (rowId: string, columnId: string, value: string) => {
    const column = data.columns.find(col => col.id === columnId);
    const processedValue = column?.type === 'number' ? parseFloat(value) || 0 : value;
    updateCell(rowId, columnId, processedValue);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, columnId: string, value: string) => {
    if (e.key === 'Enter') {
      handleCellSubmit(rowId, columnId, value);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-blue-600" />
              Brand Management System
            </h1>
            <div className="flex gap-2">
              <button
                onClick={addRow}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-200px)]">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="w-12 p-2 border border-gray-300 bg-gray-200 text-gray-600 font-medium">
                  #
                </th>
                {data.columns.map((column) => (
                  <th
                    key={column.id}
                    className="p-2 border border-gray-300 bg-gray-100 text-left font-medium text-gray-700 relative group"
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center justify-between">
                      {editingColumn === column.id ? (
                        <input
                          type="text"
                          defaultValue={column.name}
                          className="bg-white border border-blue-500 rounded px-2 py-1 text-sm w-full"
                          onBlur={(e) => updateColumnName(column.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateColumnName(column.id, (e.target as HTMLInputElement).value);
                            } else if (e.key === 'Escape') {
                              setEditingColumn(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingColumn(column.id)}
                        >
                          {column.name}
                        </span>
                      )}
                      <button
                        onClick={() => deleteColumn(column.id)}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-300 bg-gray-50 text-center text-gray-600 font-medium relative group">
                    <div className="flex items-center justify-center">
                      <span>{rowIndex + 1}</span>
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  {data.columns.map((column) => {
                    const cell = row.cells[column.id];
                    const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === column.id;
                    
                    return (
                      <td
                        key={column.id}
                        className="p-0 border border-gray-300 hover:bg-blue-50 cursor-pointer"
                        onClick={() => !isEditing && handleCellClick(row.id, column.id)}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type={column.type === 'number' ? 'number' : 'text'}
                            defaultValue={cell?.value || ''}
                            className="w-full h-full p-2 border-2 border-blue-500 outline-none"
                            onBlur={(e) => handleCellSubmit(row.id, column.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, row.id, column.id, (e.target as HTMLInputElement).value)}
                          />
                        ) : (
                          <div className="p-2 min-h-[40px] flex items-center">
                            {cell?.value || ''}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddColumn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Column</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Name
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter column name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Type
                  </label>
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as 'text' | 'number')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={addColumn}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnName('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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

export default Spreadsheet;