import { useState, useEffect, useMemo } from 'react';
import type { DataRecord, Filters, Analytics } from '../types';
import { fetchM88Data, updateM88Record, createM88Record, deleteM88Record } from '../services/api';

export const useM88Data = () => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      console.log('=== Hook Debug: Starting loadData ===');
      setLoading(true);
      setError(null);
      console.log('Calling fetchM88Data...');
      const records = await fetchM88Data();
      setData(records);
      console.log('Data state updated');
    } catch (err) {
      console.error('Error in loadData hook:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveRecord = async (record: DataRecord) => {
    try {
      const updatedRecord = await updateM88Record(record);
      setData(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      return updatedRecord;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      await deleteM88Record(id);
      setData(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const handleAddRecord = async (newRecord: Omit<DataRecord, 'id'>) => {
    try {
      const createdRecord = await createM88Record(newRecord);
      setData(prev => [...prev, createdRecord]);
      return createdRecord;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add record');
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = (searchTerm: string, filters: Filters) => {
    return useMemo(() => {
      let filtered = data;

      // Always exclude records with Inactive status
      filtered = filtered.filter(row => {
        const statusValue = String(row.status ?? '').trim().toLowerCase();
        return statusValue !== 'inactive';
      });

      if (searchTerm) {
        filtered = filtered.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filtered = filtered.filter(row => row[key] === value);
        }
      });

      return filtered;
    }, [data, searchTerm, filters]);
  };

  const getAnalytics = (filteredData: DataRecord[]): Analytics => {
    return useMemo(() => {
      const total = data.length;
      const active = data.filter(r => r.status === 'Active').length;
      const topTier = data.filter(r => r.brand_classification === 'Top').length;
      const filtered = filteredData.length;

      return { total, active, topTier, filtered };
    }, [data, filteredData]);
  };

  const getUniqueValues = (key: string): string[] => {
    // For status field, use predefined options to avoid duplicates
    if (key === 'status') {
      return ['Active', 'In Development'];
    }
    
    // For other fields, extract unique values from data with normalization
    const uniqueValues = [...new Set(
      data.map(row => {
        const value = row[key];
        if (!value) return null;
        
        // Normalize the value: trim whitespace, handle case variations
        const normalized = String(value).trim();
        
        // Special handling for status-like fields
        if (key === 'status' || key.includes('status')) {
          const lower = normalized.toLowerCase();
          if (lower.includes('active')) return 'Active';
          if (lower.includes('development') || lower.includes('deploy')) return 'In Development';
        }
        
        return normalized;
      }).filter((value): value is string => Boolean(value))
    )].sort();
    
    return uniqueValues;
  };

  return {
    data,
    loading,
    error,
    loadData,
    handleSaveRecord,
    handleDeleteRecord,
    handleAddRecord,
    handleRefreshData,
    getFilteredData,
    getAnalytics,
    getUniqueValues
  };
};