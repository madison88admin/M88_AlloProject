export function parseCSVData(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Filter out empty headers and create column definitions
  const columns = headers
    .map((header, index) => ({
      id: `col${index}`,
      name: header || `Column ${index + 1}`,
      type: 'text' as const,
      width: getColumnWidth(header)
    }))
    .filter(col => col.name && col.name !== '');

  // Parse data rows
  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
    const cells: { [columnId: string]: any } = {};
    
    columns.forEach((column, colIndex) => {
      const value = values[colIndex] || '';
      cells[column.id] = {
        id: `cell${rowIndex}-${column.id}`,
        value: value,
        type: 'text'
      };
    });

    return {
      id: `row${rowIndex}`,
      cells
    };
  }).filter(row => {
    // Filter out empty rows
    return Object.values(row.cells).some((cell: any) => cell.value && cell.value.trim() !== '');
  });

  return { columns, rows };
}

function getColumnWidth(header: string): number {
  // Set appropriate widths based on column content
  const headerLower = header.toLowerCase();
  
  if (headerLower.includes('brand') || headerLower.includes('name')) return 180;
  if (headerLower.includes('status') || headerLower.includes('classification')) return 120;
  if (headerLower.includes('planner') || headerLower.includes('md')) return 140;
  if (headerLower.includes('shipping') || headerLower.includes('logistic')) return 130;
  if (headerLower.includes('email') || headerLower.includes('purchasing')) return 160;
  if (headerLower.includes('terms')) return 100;
  if (headerLower.includes('allocation') || headerLower.includes('factory')) return 90;
  
  return 120; // default width
}