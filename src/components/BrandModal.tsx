import React from 'react';
import { X, Building, Users, Info } from 'lucide-react';
import type { DataRecord } from '../types';

interface BrandModalProps {
  brand: string;
  brandData: DataRecord;
  onClose: () => void;
}

const BrandModal: React.FC<BrandModalProps> = ({ brand, brandData, onClose }) => {
  const formatFieldName = (key: string): string => {
    if (key.startsWith('custom_')) {
      return key.replace('custom_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
  const fieldMappings: Record<string, string> = {
    all_brand: 'Brand Name',
    status: 'Status',
    brand_classification: 'Classification',
    lead_pbd: 'Lead PBD',
    support_pbd: 'Support PBD',
    td: 'Technical Director',
    nyo_planner: 'NYO Planner',
    indo_m88_md: 'Indo M88 MD',
    indo_m88_qa: 'Indo M88 QA',
    mlo_planner: 'MLO Planner',
    mlo_logistic: 'MLO Logistic',
    mlo_purchasing: 'MLO Purchasing',
    mlo_costing: 'MLO Costing',
    brand_visible_to_factory: 'BRAND VISIBLE TO FACTORY',
    terms_of_shipment: 'TERMS OF SHIPMENT',
    wuxi_moretti: 'WUXI MORETTI',
    hz_u_jump: 'PT U JUMP',
    hz_pt_u_jump_senior_md: 'HZ PT U JUMP SENIOR MD',
    hz_u_jump_shipping: 'HZ U JUMP SHIPPING',
    pt_ujump_shipping: 'PT UJUMP SHIPPING',
    fa_wuxi: 'FA WUXI',
    fa_hz: 'FA HZ U',
    fa_pt: 'FA PT UWU',
    fa_korea: 'FA KOREA M',
    fa_singfore: 'FA SINGFORE',
    fa_heads: 'FA HEADS UP',
    hz_pt_ujump_trims_coordinator: 'HZ PT UJUMP TRIMS COORDINATOR',
    hz_pt_ujump_label_coordinator: 'HZ PT UJUMP LABEL COORDINATOR',
    koreamel_trims_coordinator: 'KOREAMEL TRIMS COORDINATOR',
    koreamel_label_coordinator: 'KOREAMEL LABEL COORDINATOR',
    headsup_trims_coordinator: 'HEADSUP TRIMS COORDINATOR',
    headsup_label_coordinator: 'HEADSUP LABEL COORDINATOR',
    wuxi_trims_coordinator: 'WUXI TRIMS COORDINATOR',
    wuxi_label_coordinator: 'WUXI LABEL COORDINATOR',
    singfore_trims_coordinator: 'SINGFORE TRIMS COORDINATOR',
    singfore_label_coordinator: 'SINGFORE LABEL COORDINATOR',
  };
    
    return fieldMappings[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === '0' || value === 'N/A' || value === '-' || (typeof value === 'string' && value.trim() === '')) {
      return 'Not assigned';
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

  // Categorize fields
  const contactPersonFields = [
    'lead_pbd', 'support_pbd', 'td', 'nyo_planner', 'indo_m88_md', 
    'indo_m88_qa', 'mlo_planner', 'mlo_logistic', 'mlo_purchasing', 'mlo_costing'
  ];

  const basicInfoFields = ['all_brand', 'status', 'brand_classification', 'brand_visible_to_factory', 'terms_of_shipment'];

  const displayFields = Object.entries(brandData)
    .filter(([key]) => !['id', 'created_at', 'updated_at', 'custom_fields'].includes(key));

  const basicInfo = displayFields.filter(([key]) => basicInfoFields.includes(key));
  const contactInfo = displayFields.filter(([key]) => contactPersonFields.includes(key));
  const otherInfo = displayFields.filter(([key]) => 
    !basicInfoFields.includes(key) && 
    !contactPersonFields.includes(key) &&
    !key.includes('local') &&
    brandData[key] !== null && 
    brandData[key] !== undefined && 
    brandData[key] !== ''
  );

  const hasAnyData = basicInfo.length > 0 || contactInfo.length > 0 || otherInfo.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{brand}</h2>
              <p className="text-slate-400 text-sm">Brand Information</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {hasAnyData ? (
            <>
              {/* Basic Information */}
              {basicInfo.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-slate-600" />
                    <h3 className="text-base font-medium text-slate-900">
                      Basic Information ({basicInfo.length})
                    </h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {basicInfo.map(([key, value]) => (
                      <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                          {formatFieldName(key)}
                        </div>
                        <div className="text-slate-900 font-medium">
                          {key === 'status' && value ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                              value === 'Active' ? 'bg-green-100 text-green-800' :
                              value === 'Inactive' ? 'bg-red-100 text-red-800' :
                              value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {formatFieldValue(value)}
                            </span>
                          ) : key === 'brand_classification' && value ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                              value === 'Premium' ? 'bg-purple-100 text-purple-800' :
                              value === 'Standard' ? 'bg-blue-100 text-blue-800' :
                              value === 'Budget' ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {formatFieldValue(value)}
                            </span>
                          ) : (
                            formatFieldValue(value)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {contactInfo.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-slate-600" />
                    <h3 className="text-base font-medium text-slate-900">
                      Contact Persons
                    </h3>
                    <span className="text-sm text-slate-500">
                      ({contactInfo.filter(([key]) => {
                        const val = brandData[key];
                        return val && val !== '' && val !== null && val !== undefined && val !== '0' && val !== 'N/A' && val !== '-' && (typeof val !== 'string' || val.trim() !== '');
                      }).length} assigned, {contactInfo.filter(([key]) => {
                        const val = brandData[key];
                        return !val || val === '' || val === null || val === undefined || val === '0' || val === 'N/A' || val === '-' || (typeof val === 'string' && val.trim() === '');
                      }).length} available)
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {contactInfo.map(([key, value]) => {
                      const val = brandData[key];
                      const isAssigned = val && 
                        val !== '' && 
                        val !== null && 
                        val !== undefined &&
                        val !== '0' &&
                        val !== 'N/A' &&
                        val !== '-' &&
                        (typeof val !== 'string' || val.trim() !== '');
                      
                      return (
                        <div key={key} className={`rounded-lg p-4 border ${isAssigned ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-200 opacity-75'}`}>
                          <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                            {formatFieldName(key)}
                          </div>
                          <div className={`font-medium ${isAssigned ? 'text-slate-900' : 'text-slate-400'}`}>
                            {formatFieldValue(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Factory Information */}
              {otherInfo.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-slate-600" />
                    <h3 className="text-base font-medium text-slate-900">
                      Factory Information ({otherInfo.length})
                    </h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {otherInfo.map(([key, value]) => (
                      <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                          {formatFieldName(key)}
                          {key.startsWith('custom_') && (
                            <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                              custom
                            </span>
                          )}
                        </div>
                        <div className="text-slate-900 font-medium">
                          {formatFieldValue(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Information Available</h3>
              <p className="text-slate-500">
                No data is available for this brand.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandModal;