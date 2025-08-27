// utils/faAssignments.ts
import type { DataRecord } from '../types';

interface FAMapping {
  factoryColumn: string;
  faColumn: string;
  faName: string;
}

const FA_MAPPINGS: FAMapping[] = [
  { factoryColumn: 'wuxi_moretti', faColumn: 'fa_wuxi', faName: 'Wuxi' },
  { factoryColumn: 'hz_u_jump', faColumn: 'fa_hz', faName: 'HZ-U' },
  { factoryColumn: 'pt_u_jump', faColumn: 'fa_pt', faName: 'PT-UWU' },
  { factoryColumn: 'korea_mel', faColumn: 'fa_korea', faName: 'Korea-M' },
  { factoryColumn: 'singfore', faColumn: 'fa_singfore', faName: 'Singfore' },
  { factoryColumn: 'heads_up', faColumn: 'fa_heads', faName: 'Heads Up' }
];

export const updateFAAssignments = (data: DataRecord): DataRecord => {
  const updatedData = { ...data };
  
  FA_MAPPINGS.forEach(({ factoryColumn, faColumn, faName }) => {
    if (updatedData[factoryColumn] === 'Yes') {
      updatedData[faColumn] = faName;
    } else if (updatedData[factoryColumn] === '' || updatedData[factoryColumn] === '—' || !updatedData[factoryColumn]) {
      updatedData[faColumn] = '';
    }
  });
  
  return updatedData;
};

export const isFactoryColumn = (columnKey: string): boolean => {
  return FA_MAPPINGS.some(mapping => mapping.factoryColumn === columnKey);
};