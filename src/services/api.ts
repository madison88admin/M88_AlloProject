import type { DataRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

// Simulate API delay for better UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Table name in your Supabase database - based on the columns shown
const TABLE_NAME = 'M88-Account_Allocation'; // This should match your actual table name

export const fetchM88Data = async (): Promise<DataRecord[]> => {
  try {
    await delay(500); // Simulate network delay
    
    console.log('=== Database Connection Debug ===');
    console.log('Table name:', TABLE_NAME);
    console.log('Supabase client:', supabase);
    console.log('Environment check - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Environment check - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***SET***' : 'NOT SET');
    console.log('Fetching data from table:', TABLE_NAME);
    
    // First, let's check if the table exists and what tables are available
    console.log('Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    console.log('Available tables:', tables);
    console.log('Tables error:', tablesError);
    
    // Try different table name variations
    const possibleTableNames = [
      'M88-Account_Allocation',
      'm88_account_allocation',
      'M88_Account_Allocation',
      'm88-account-allocation',
      'M88AccountAllocation'
    ];
    
    let data = null;
    let error = null;
    let successfulTableName = null;
    
    for (const tableName of possibleTableNames) {
      console.log(`Trying table name: ${tableName}`);
      try {
        const result = await supabase
          .from(tableName)
          .select('*')
          .limit(1); // Just get one record to test
        
        console.log(`Result for ${tableName}:`, result);
        
        if (result.data && result.data.length > 0) {
          console.log(`✅ Found data in table: ${tableName}`);
          successfulTableName = tableName;
          break;
        }
      } catch (err) {
        console.log(`❌ Error with table ${tableName}:`, err);
      }
    }
    
    if (successfulTableName) {
      console.log(`Using successful table name: ${successfulTableName}`);
      const result = await supabase
        .from(successfulTableName)
        .select('*')
        .order('all_brand', { ascending: true });
      
      data = result.data;
      error = result.error;
    } else {
      console.log('❌ No working table name found, using original');
      const result = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('all_brand', { ascending: true });
      
      data = result.data;
      error = result.error;
    }

    console.log('Supabase response:', { data, error });
    console.log('Response data type:', typeof data);
    console.log('Response data length:', data?.length);
    console.log('Response data keys:', data ? Object.keys(data[0] || {}) : 'No data');

    if (error) {
      console.error('Error fetching data:', error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    console.log('Fetched data:', data);
    
    // If no id column exists, add a temporary id for the UI
    const dataWithIds = (data || []).map((record, index) => ({
      ...record,
      id: record.id || index + 1 // Use existing id or generate temporary one
    }));
    
    console.log('Data with IDs:', dataWithIds);
    console.log('=== End Debug ===');
    
    return dataWithIds;
  } catch (err) {
    console.error('Error in fetchM88Data:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to fetch data');
  }
};

export const updateM88Record = async (record: DataRecord): Promise<DataRecord> => {
  try {
    await delay(300);
    
    // Use all_brand as the identifier since id might not exist
    const identifier = record.id || record.all_brand;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        all_brand: record.all_brand,
        brand_visible_to_factory: record.brand_visible_to_factory,
        brand_classification: record.brand_classification,
        status: record.status,
        terms_of_shipment: record.terms_of_shipment,
        lead_pbd: record.lead_pbd,
        support_pbd: record.support_pbd,
        // Additional fields from your database schema
        td: record.td,
        nyo_planner: record.nyo_planner,
        indo_m88_md: record.indo_m88_md,
        m88_qa: record.m88_qa,
        mlo_planner: record.mlo_planner,
        mlo_logistic: record.mlo_logistic,
        mlo_purchasing: record.mlo_purchasing,
        mlo_costing: record.mlo_costing,
        wuxi_moretti: record.wuxi_moretti,
        hz_u_jump: record.hz_u_jump,
        pt_u_jump: record.pt_u_jump,
        korea_mel: record.korea_mel,
        singfore: record.singfore,
        heads_up: record.heads_up,
        hz_pt_u_jump_senior_md: record.hz_pt_u_jump_senior_md,
        pt_ujump_local_md: record.pt_ujump_local_md,
        hz_u_jump_shipping: record.hz_u_jump_shipping,
        pt_ujump_shipping: record.pt_ujump_shipping,
        fa_wuxi: record.fa_wuxi,
        fa_hz: record.fa_hz,
        fa_pt: record.fa_pt,
        fa_korea: record.fa_korea,
        fa_singfore: record.fa_singfore,
        fa_heads: record.fa_heads,
        updated_at: new Date().toISOString()
      })
      .eq('all_brand', record.all_brand) // Use all_brand as identifier
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Error in updateM88Record:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to update record');
  }
};

export const createM88Record = async (record: Omit<DataRecord, 'id'>): Promise<DataRecord> => {
  try {
    await delay(300);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        all_brand: record.all_brand,
        brand_visible_to_factory: record.brand_visible_to_factory,
        brand_classification: record.brand_classification,
        status: record.status,
        terms_of_shipment: record.terms_of_shipment,
        lead_pbd: record.lead_pbd,
        support_pbd: record.support_pbd,
        // Additional fields from your database schema
        td: record.td,
        nyo_planner: record.nyo_planner,
        indo_m88_md: record.indo_m88_md,
        m88_qa: record.m88_qa,
        mlo_planner: record.mlo_planner,
        mlo_logistic: record.mlo_logistic,
        mlo_purchasing: record.mlo_purchasing,
        mlo_costing: record.mlo_costing,
        wuxi_moretti: record.wuxi_moretti,
        hz_u_jump: record.hz_u_jump,
        pt_u_jump: record.pt_u_jump,
        korea_mel: record.korea_mel,
        singfore: record.singfore,
        heads_up: record.heads_up,
        hz_pt_u_jump_senior_md: record.hz_pt_u_jump_senior_md,
        pt_ujump_local_md: record.pt_ujump_local_md,
        hz_u_jump_shipping: record.hz_u_jump_shipping,
        pt_ujump_shipping: record.pt_ujump_shipping,
        fa_wuxi: record.fa_wuxi,
        fa_hz: record.fa_hz,
        fa_pt: record.fa_pt,
        fa_korea: record.fa_korea,
        fa_singfore: record.fa_singfore,
        fa_heads: record.fa_heads,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Error in createM88Record:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to create record');
  }
};

export const deleteM88Record = async (id: number): Promise<void> => {
  try {
    await delay(300);
    
    // Since we might not have an id column, we need to handle this differently
    // For now, we'll need to pass the all_brand instead of id
    console.warn('Delete operation requires all_brand identifier. Consider updating the interface.');
    
    // This is a temporary solution - you might want to update the interface
    // to pass all_brand instead of id for delete operations
    throw new Error('Delete operation not properly configured for tables without id column');
  } catch (err) {
    console.error('Error in deleteM88Record:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to delete record');
  }
};

// Function to reset data to original state (if needed)
export const resetToOriginalData = async (): Promise<void> => {
  // This would typically involve calling a database function or API endpoint
  // For now, we'll just reload the data from the database
  console.log('Reset functionality would be implemented here');
};

// Function to refresh data from database
export const refreshDataFromDatabase = async (): Promise<DataRecord[]> => {
  return await fetchM88Data();
};