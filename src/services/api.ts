import type { DataRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

// Simulate API delay for better UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store the working table name globally after discovery
let WORKING_TABLE_NAME = 'M88-NEWDATA';
let TABLE_DISCOVERED = false;
let TABLE_COLUMNS: string[] = [];

// Function to discover the correct table name
const discoverTableName = async (): Promise<string> => {
  const possibleTableNames = [
    'M88-NEWDATA',
    //'M88-Account_Allocation',
    //'m88_account_allocation', 
    //'M88_Account_Allocation',
    //'m88-account-allocation',
    //'M88AccountAllocation'
  ];
  
  for (const tableName of possibleTableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (data && !error) {
        WORKING_TABLE_NAME = tableName;
        TABLE_DISCOVERED = true;
        return tableName;
      }
    } catch (err) {
      // Table not found, try next one
    }
  }
  
  TABLE_DISCOVERED = true;
  return WORKING_TABLE_NAME;
};

// Function to discover table columns
const discoverTableColumns = async (): Promise<string[]> => {
  if (TABLE_COLUMNS.length > 0) {
    return TABLE_COLUMNS;
  }
  
  try {
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .select('*')
      .limit(1);
    
    if (data && data.length > 0) {
      TABLE_COLUMNS = Object.keys(data[0]);
      return TABLE_COLUMNS;
    }
  } catch (_err) {
    // Error discovering columns
  }
  
  return [];
};

// Main function to fetch M88 data
export const fetchM88Data = async (): Promise<DataRecord[]> => {
  try {
    // Ensure table is discovered
    if (!TABLE_DISCOVERED) {
      await discoverTableName();
    }
    
    // Discover columns if not already done
    await discoverTableColumns();
    
    // Add small delay for better UX
    await delay(300);
    
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    
    if (!data) {
      return [];
    }
    
    // Process the data to ensure proper typing
    const processedData: DataRecord[] = data.map((record: any) => {
      // Ensure custom_fields is properly handled
      if (record.custom_fields && typeof record.custom_fields === 'string') {
        try {
          record.custom_fields = JSON.parse(record.custom_fields);
        } catch {
          record.custom_fields = {};
        }
      }
      
      return record as DataRecord;
    });
    
    return processedData;
  } catch (error) {
    throw new Error(`Failed to fetch M88 data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to update a record
export const updateM88Record = async (record: DataRecord): Promise<DataRecord> => {
  try {
    // Ensure table is discovered
    if (!TABLE_DISCOVERED) {
      await discoverTableName();
    }
    
    const { data: existingRecords, error: findError } = await supabase
      .from(WORKING_TABLE_NAME)
      .select('id')
      .eq('id', record.id);
    
    if (findError) {
      throw new Error(`Failed to check existing record: ${findError.message}`);
    }
    
    let updateData: any = { ...record };
    
    // Handle custom_fields properly
    if (updateData.custom_fields && typeof updateData.custom_fields === 'object') {
      updateData.custom_fields = JSON.stringify(updateData.custom_fields);
    }
    
    let response;
    if (existingRecords && existingRecords.length > 0) {
      // Record exists, update it
      const { data, error } = await supabase
        .from(WORKING_TABLE_NAME)
        .update(updateData)
        .eq('id', record.id)
        .select()
        .single();
      
      response = { data, error };
    } else {
      // Record doesn't exist, try to find by all_brand as fallback
      const { data: brandRecords, error: _brandError } = await supabase
        .from(WORKING_TABLE_NAME)
        .select('id')
        .eq('all_brand', record.all_brand);
      
      if (brandRecords && brandRecords.length > 0) {
        // Update by all_brand
        const { data, error } = await supabase
          .from(WORKING_TABLE_NAME)
          .update(updateData)
          .eq('all_brand', record.all_brand)
          .select()
          .single();
        
        response = { data, error };
      } else {
        throw new Error('Record not found for update');
      }
    }
    
    if (response.error) {
      throw new Error(`Failed to update record: ${response.error.message}`);
    }
    
    // Process the response to ensure proper typing
    let updatedRecord = response.data;
    if (updatedRecord.custom_fields && typeof updatedRecord.custom_fields === 'string') {
      try {
        updatedRecord.custom_fields = JSON.parse(updatedRecord.custom_fields);
      } catch {
        updatedRecord.custom_fields = {};
      }
    }
    
    return updatedRecord as DataRecord;
  } catch (error) {
    throw new Error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to update a record by ID only
export const updateM88RecordById = async (record: DataRecord): Promise<DataRecord> => {
  try {
    // Ensure table is discovered
    if (!TABLE_DISCOVERED) {
      await discoverTableName();
    }
    
    let updateData: any = { ...record };
    
    // Handle custom_fields properly
    if (updateData.custom_fields && typeof updateData.custom_fields === 'object') {
      updateData.custom_fields = JSON.stringify(updateData.custom_fields);
    }
    
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .update(updateData)
      .eq('id', record.id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }
    
    // Process the response to ensure proper typing
    let updatedRecord = data;
    if (updatedRecord.custom_fields && typeof updatedRecord.custom_fields === 'string') {
      try {
        updatedRecord.custom_fields = JSON.parse(updatedRecord.custom_fields);
      } catch {
        updatedRecord.custom_fields = {};
      }
    }
    
    return updatedRecord as DataRecord;
  } catch (error) {
    throw new Error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to create a new record
export const createM88Record = async (record: Omit<DataRecord, 'id'>): Promise<DataRecord> => {
  try {
    // Ensure table is discovered
    if (!TABLE_DISCOVERED) {
      await discoverTableName();
    }
    
    let insertData: any = { ...record };
    
    // Handle custom_fields properly
    if (insertData.custom_fields && typeof insertData.custom_fields === 'object') {
      insertData.custom_fields = JSON.stringify(insertData.custom_fields);
    }
    
    const { data, error } = await supabase
      .from(WORKING_TABLE_NAME)
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }
    
    // Process the response to ensure proper typing
    let createdRecord = data;
    if (createdRecord.custom_fields && typeof createdRecord.custom_fields === 'string') {
      try {
        createdRecord.custom_fields = JSON.parse(createdRecord.custom_fields);
      } catch {
        createdRecord.custom_fields = {};
      }
    }
    
    return createdRecord as DataRecord;
  } catch (error) {
    throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to delete a record
export const deleteM88Record = async (id: number): Promise<void> => {
  try {
    // Ensure table is discovered
    if (!TABLE_DISCOVERED) {
      await discoverTableName();
    }
    
    // First, try to find the record to get its all_brand for logging
    const { data: _recordToDelete, error: findError } = await supabase
      .from(WORKING_TABLE_NAME)
      .select('all_brand')
      .eq('id', id)
      .single();
    
    if (findError) {
      // If record not found by ID, try to find by all_brand as fallback
      const { data: _fallbackData, error: fallbackError } = await supabase
        .from(WORKING_TABLE_NAME)
        .delete()
        .eq('all_brand', `Record-${id}`)
        .select();
      
      if (fallbackError) {
        throw new Error(`Failed to delete record: ${fallbackError.message}`);
      }
    } else {
      // Record found by ID, delete it
      const { error } = await supabase
        .from(WORKING_TABLE_NAME)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete record: ${error.message}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to delete record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};