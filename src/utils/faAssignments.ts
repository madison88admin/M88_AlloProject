// utils/faAssignments.ts
import type { DataRecord } from '../types';

interface FAMapping {
  factoryColumn: string;
  faColumn: string;
  faName: string;
}

const FA_MAPPINGS: FAMapping[] = [
  { factoryColumn: 'wuxi_moretti', faColumn: 'fa_wuxi', faName: 'Wuxi' },
  { factoryColumn: 'hz_u_jump', faColumn: 'fa_hz_u', faName: 'HZ-U' },
  { factoryColumn: 'pt_u_jump', faColumn: 'fa_pt_uwu', faName: 'PT-UWU' },
  { factoryColumn: 'korea_mel', faColumn: 'fa_korea_m', faName: 'Korea-M' },
  { factoryColumn: 'singfore', faColumn: 'fa_singfore', faName: 'Singfore' },
  { factoryColumn: 'heads_up', faColumn: 'fa_heads_up', faName: 'Heads Up' }
];

export const updateFAAssignments = (data: DataRecord): DataRecord => {
  const updatedData = { ...data };
  
  FA_MAPPINGS.forEach(({ factoryColumn, faColumn, faName }) => {
    const factoryValue = updatedData[factoryColumn];
    
    if (factoryValue === 'Yes') {
      updatedData[faColumn] = faName;
    } else if (factoryValue === '' || factoryValue === '—' || !factoryValue) {
      updatedData[faColumn] = '';
    }
  });
  
  return updatedData;
};

export const isFactoryColumn = (columnKey: string): boolean => {
  return FA_MAPPINGS.some(mapping => mapping.factoryColumn === columnKey);
};