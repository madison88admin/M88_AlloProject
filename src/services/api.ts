import type { DataRecord } from '../types';
import { mockData } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate database operations with localStorage for persistence
const STORAGE_KEY = 'm88_database_records';

const getStoredData = (): DataRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
  return mockData;
};

const setStoredData = (data: DataRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const fetchM88Data = async (): Promise<DataRecord[]> => {
  await delay(1000); // Simulate network delay
  return getStoredData();
};

export const updateM88Record = async (record: DataRecord): Promise<DataRecord> => {
  await delay(500);
  const data = getStoredData();
  const index = data.findIndex(r => r.id === record.id);
  if (index === -1) {
    throw new Error('Record not found');
  }
  data[index] = record;
  setStoredData(data);
  return record;
};

export const createM88Record = async (record: Omit<DataRecord, 'id'>): Promise<DataRecord> => {
  await delay(500);
  const data = getStoredData();
  const newRecord = {
    ...(record as DataRecord),
    id: Math.max(...data.map(r => r.id), 0) + 1
  } as DataRecord;
  data.push(newRecord);
  setStoredData(data);
  return newRecord;
};

export const deleteM88Record = async (id: number): Promise<void> => {
  await delay(500);
  const data = getStoredData();
  const filteredData = data.filter(r => r.id !== id);
  setStoredData(filteredData);
};