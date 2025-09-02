import React from 'react';
import type { DataRecord } from '../types';

interface BrandModalProps {
  brand: string;
  brandData: DataRecord;
  onClose: () => void;
}

const BrandModal: React.FC<BrandModalProps> = ({ brand, brandData, onClose }) => {
  // Helper function to format field names for display
  const formatFieldName = (key: string): string => {
    // Handle custom fields
    if (key.startsWith('custom_')) {
      return key.replace('custom_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Common field mappings
    const fieldMappings: Record<string, string> = {
      all_brand: 'Brand',
      status: 'Status',
      brand_classification: 'Brand Classification',
      lead_pbd: 'Lead PBD',
      support_pbd: 'Support PBD',
      td: 'TD',
      nyo_planner: 'NYO Planner',
      indo_m88_md: 'Indo M88 MD',
      m88_qa: 'M88 QA',
      mlo_planner: 'MLO Planner',
      mlo_logistic: 'MLO Logistic',
      mlo_purchasing: 'MLO Purchasing',
      mlo_costing: 'MLO Costing',
    };
    
    return fieldMappings[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format field values for display
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  };

  // Filter out system fields and empty values
  const displayFields = Object.entries(brandData)
    .filter(([key, value]) => {
      // Skip system fields
      if (['id', 'created_at', 'updated_at'].includes(key)) {
        return false;
      }
      
      // Skip custom_fields object if it exists (we'll show flattened custom fields instead)
      if (key === 'custom_fields') {
        return false;
      }
      
      return true;
    })
    .sort(([keyA], [keyB]) => {
      // Sort to show important fields first
      const importantFields = ['all_brand', 'status', 'brand_classification'];
      const aIndex = importantFields.indexOf(keyA);
      const bIndex = importantFields.indexOf(keyB);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return keyA.localeCompare(keyB);
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-blue-200 text-2xl font-bold transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-2">{brand}</h2>
          <p className="text-blue-100 opacity-90">Brand Details</p>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-4">
            {displayFields.map(([key, value]) => (
              <div key={key} className="border-b border-slate-100 pb-3 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <span className="font-medium text-slate-700 text-sm uppercase tracking-wide">
                    {formatFieldName(key)}
                  </span>
                  <div className="text-right sm:text-left sm:max-w-md">
                    {/* Special handling for different field types */}
                    {key === 'status' && value ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        value === 'Active' ? 'bg-green-100 text-green-800' :
                        value === 'Inactive' ? 'bg-red-100 text-red-800' :
                        value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {formatFieldValue(value)}
                      </span>
                    ) : key === 'brand_classification' && value ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        value === 'Premium' ? 'bg-purple-100 text-purple-800' :
                        value === 'Standard' ? 'bg-blue-100 text-blue-800' :
                        value === 'Budget' ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {formatFieldValue(value)}
                      </span>
                    ) : key.includes('_pbd') || key === 'td' || key.includes('planner') || key.includes('mlo') || key.includes('m88') ? (
                      // Contact person fields - make them stand out
                      <span className="text-blue-700 font-medium">
                        {formatFieldValue(value)}
                      </span>
                    ) : key.startsWith('custom_') ? (
                      // Custom fields - highlight them
                      <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                        <span className="text-purple-800 font-medium">
                          {formatFieldValue(value)}
                        </span>
                        <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                          custom
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-900">
                        {formatFieldValue(value)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {displayFields.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-4">📄</div>
              <p>No additional details available for this brand.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandModal;