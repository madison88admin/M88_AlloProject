export interface Cell {
  id: string;
  value: string | number;
  type: 'text' | 'number';
}

export interface Row {
  id: string;
  cells: { [columnId: string]: Cell };
}

export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number';
  width: number;
}

export interface SpreadsheetData {
  columns: Column[];
  rows: Row[];
}