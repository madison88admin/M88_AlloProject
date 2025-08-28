import type { DataRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

// Simulate API delay for better UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store the working table name globally after discovery
let WORKING_TABLE_NAME = 'M88-Account_Allocation';

// Function to discover the correct table name
const discoverTableName = async (): Promise<string> => {
  console.log('🔍 Discovering correct table name...');
  
  const possibleTableNames = [
    'M88-Account_Allocation',
    'm88_account_allocation', 
    'M88_Account_Allocation',
    'm88-account-allocation',
    'M88AccountAllocation'
  ];
  
  for (const tableName of possibleTableNames) {
    try {
      console.log(`🔍 Trying table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (data && !error) {
        console.log(`✅ Found working table: ${tableName}`);
        WORKING_TABLE_NAME = tableName;
        return tableName;
      }
    } catch (err) {
      console.log(`❌ Table ${tableName} failed:`, err);
    }
  }
  
  console.warn('⚠️ No working table found, using default');
  return WORKING_TABLE_NAME;
};

export const fetchM88Data = async (): Promise<DataRecord[]> => {
  try {
    await delay(500);
    console.log('=== Fetching M88 Data ===');
    
    // Discover the correct table name
    const tableName = await discoverTableName();
    
    // Fetch all columns including custom_fields
    const { data, error } = await supabase
      .from(tableName)
      .select('*') // Select all columns to include custom_fields if it exists
      .order('all_brand', { ascending: true });

    if (error) throw new Error(`Failed to fetch data: ${error.message}`);
    
    console.log('✅ Fetched data:', data?.length, 'records');
    
    // Log sample record to see structure
    if (data && data.length > 0) {
      console.log('📋 Sample record structure:', Object.keys(data[0]));
      if (data[0].custom_fields) {
        console.log('🎯 Custom fields detected:', data[0].custom_fields);
      }
    }
    
    return data || [];

  } catch (err) {
    console.error('❌ Error in fetchM88Data:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to fetch data');
  }
};

// Helper function to prepare update data from a record
const prepareUpdateData = (record: DataRecord) => {
  // Extract standard fields (excluding id, created_at, updated_at)
  const standardFields = {
    all_brand: record.all_brand,
    brand_visible_to_factory: record.brand_visible_to_factory,
    brand_classification: record.brand_classification,
    status: record.status,
    terms_of_shipment: record.terms_of_shipment,
    lead_pbd: record.lead_pbd,
    support_pbd: record.support_pbd,
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
  };

  // Include custom_fields if it exists
  if (record.custom_fields) {
    return {
      ...standardFields,
      custom_fields: record.custom_fields
    };
  }

  return standardFields;
};

export const updateM88Record = async (record: DataRecord): Promise<DataRecord> => {
  console.log('🔄 API: updateM88Record called with:', record);
  console.log('🔄 API: Using table name:', WORKING_TABLE_NAME);
  console.log('🔄 API: Record ID:', record.id);
  console.log('🔄 API: Record all_brand:', record.all_brand);
  
  try {
    await delay(300);
    
    // First, let's check if the record exists and what we should use as identifier
    console.log('🔍 API: Checking if record exists...');
    
    // Try to find the record first
    const { data: existingRecords, error: findError } = await supabase
      .from(WORKING_TABLE_NAME)
      .select('*')
      .eq('all_brand', record.all_brand);
    
    console.log('🔍 API: Existing records found:', existingRecords?.length);
    console.log('🔍 API: Find error:', findError);
    
    if (findError) {
      console.error('❌ API: Error finding record:', findError);
      throw new Error(`Failed to find record: ${findError.message}`);
    }
    
    if (!existingRecords || existingRecords.length === 0) {
      console.error('❌ API: No record found with all_brand:', record.all_brand);
      throw new Error(`No record found with brand name: ${record.all_brand}`);
    }
    
    // Prepare the update data including custom fields
    const updateData = prepareUpdateData(record);
    
    console.log('💾 API: Update data prepared:', updateData);
    
    // Perform the update
    console.log('💾 API: Executing update...');
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .update(updateData)
      .eq('all_brand', record.all_brand)
      .select()
      .single();

    console.log('💾 API: Update response:', { data, error });

    if (error) {
      console.error('❌ API: Update error:', error);
      throw new Error(`Failed to update record: ${error.message}`);
    }
    
    if (!data) {
      console.error('❌ API: No data returned from update');
      throw new Error('Update succeeded but no data returned');
    }

    console.log('✅ API: Record updated successfully:', data);
    
    // Return the updated record with the original ID preserved
    const updatedRecord = {
      ...data,
      id: record.id // Preserve the original ID
    };
    
    console.log('✅ API: Returning updated record:', updatedRecord);
    return updatedRecord;
    
  } catch (err) {
    console.error('❌ API: Error in updateM88Record:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to update record');
  }
};

// Alternative update function if you have a proper ID column
export const updateM88RecordById = async (record: DataRecord): Promise<DataRecord> => {
  console.log('🔄 API: updateM88RecordById called with:', record);
  
  try {
    await delay(300);
    
    const updateData = prepareUpdateData(record);
    
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .update(updateData)
      .eq('id', record.id) // Use ID if available
      .select()
      .single();

    if (error) {
      console.error('❌ Update by ID error:', error);
      throw new Error(`Failed to update record: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('❌ Error in updateM88RecordById:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to update record');
  }
};

export const createM88Record = async (record: Omit<DataRecord, 'id'>): Promise<DataRecord> => {
  try {
    await delay(300);
    console.log('➕ Creating new record:', record);
    
    // Prepare insert data including custom fields
    const insertData = {
      all_brand: record.all_brand,
      brand_visible_to_factory: record.brand_visible_to_factory,
      brand_classification: record.brand_classification,
      status: record.status,
      terms_of_shipment: record.terms_of_shipment,
      lead_pbd: record.lead_pbd,
      support_pbd: record.support_pbd,
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
      updated_at: new Date().toISOString(),
      ...(record.custom_fields && { custom_fields: record.custom_fields }) // Include custom fields if they exist
    };
    
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Create error:', error);
      throw new Error(`Failed to create record: ${error.message}`);
    }

    console.log('✅ Record created:', data);
    return data;
  } catch (err) {
    console.error('❌ Error in createM88Record:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to create record');
  }
};

export const deleteM88Record = async (id: number): Promise<void> => {
  try {
    await delay(300);
    console.log('🗑️ Deleting record with ID:', id);
    
    // First, find the record to get the all_brand for deletion
    const { data: recordToDelete, error: findError } = await supabase
      .from(WORKING_TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (findError) {
      console.error('❌ Error finding record to delete:', findError);
      throw new Error(`Failed to find record with ID ${id}: ${findError.message}`);
    }

    if (!recordToDelete) {
      throw new Error(`No record found with ID: ${id}`);
    }

    console.log('🗑️ Found record to delete:', recordToDelete.all_brand);

    // Delete using ID if your table supports it, otherwise fall back to all_brand
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Delete error:', error);
      // If ID-based deletion fails, try using all_brand as fallback
      console.log('🔄 Trying deletion with all_brand fallback...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from(WORKING_TABLE_NAME)
        .delete()
        .eq('all_brand', recordToDelete.all_brand)
        .select();

      if (fallbackError) {
        console.error('❌ Fallback delete error:', fallbackError);
        throw new Error(`Failed to delete record: ${fallbackError.message}`);
      }

      if (!fallbackData || fallbackData.length === 0) {
        throw new Error(`No record found with brand name: ${recordToDelete.all_brand}`);
      }

      console.log('✅ Record deleted successfully (fallback):', fallbackData);
      return;
    }

    if (!data || data.length === 0) {
      throw new Error(`No record found with ID: ${id}`);
    }

    console.log('✅ Record deleted successfully:', data);
  } catch (err) {
    console.error('❌ Error in deleteM88Record:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to delete record');
  }
};

export const refreshDataFromDatabase = async (): Promise<DataRecord[]> => {
  return await fetchM88Data();
};