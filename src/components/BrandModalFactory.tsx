import React from 'react';
import { X, Building, Users } from 'lucide-react';
import type { DataRecord } from '../types';

interface BrandModalFactoryProps {
  brand: string;
  brandData: DataRecord;
  factoryType?: string; // Factory type for filtering (e.g., 'factory_WuxiSingfore', 'factory_PTuwuHzuUjump')
  onClose: () => void;
}

const BrandModalFactory: React.FC<BrandModalFactoryProps> = ({ brand, brandData, factoryType, onClose }) => {
  const formatContactName = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === '0' || value === 'N/A' || value === '-' || (typeof value === 'string' && value.trim() === '')) {
      return 'Not assigned';
    }
    return String(value);
  };

  const contactFields = [
    { key: 'lead_pbd', label: 'Lead PBD' },
    { key: 'support_pbd', label: 'Support PBD' },
    { key: 'td', label: 'Technical Director' },
    { key: 'nyo_planner', label: 'NYO Planner' },
    { key: 'indo_m88_md', label: 'Indo M88 MD' },
    { key: 'indo_m88_qa', label: 'Indo M88 QA' },
    { key: 'mlo_planner', label: 'MLO Planner' },
    { key: 'mlo_logistic', label: 'MLO Logistic' },
    { key: 'mlo_purchasing', label: 'MLO Purchasing' },
    { key: 'mlo_costing', label: 'MLO Costing' },
  ];

  // Function to get factory contacts based on available data
  const getFactoryContactsForBrand = () => {
    // Map factory usernames to their specific columns (matching App.tsx factoryColumnMap)
    const factoryColumnMap: Record<string, string[]> = {
      'factory_WuxiSingfore': ['fa_wuxi', 'fa_singfore', 'wuxi_jump_senior_md', 'wuxi_shipping', 'wuxi_trims_coordinator', 'wuxi_label_coordinator', 'singfore_jump_senior_md', 'singfore_shipping', 'singfore_trims_coordinator', 'singfore_label_coordinator'],
      'factory_PTuwuHzuUjump': ['fa_pt_uwu', 'fa_hz_u', 'hz_pt_u_jump_senior_md', 'hz_u_jump_shipping', 'pt_ujump_shipping', 'hz_pt_ujump_trims_coordinator', 'hz_pt_ujump_label_coordinator'],
      'factory_HeadsUp': ['fa_heads_up', 'headsup_senior_md', 'headsup_shipping', 'headsup_trims_coordinator', 'headsup_label_coordinator'],
      'factory_KoreaMel': ['fa_korea_m', 'koreamel_jump_senior_md', 'koreamel_shipping', 'koreamel_trims_coordinator', 'koreamel_label_coordinator']
    };


    const allFactoryContacts = [
      // HZ PT U Jump related
      { key: 'hz_pt_ujump_trims_coordinator', label: 'HZ PT U Jump Trims Coordinator' },
      { key: 'hz_pt_ujump_label_coordinator', label: 'HZ PT U Jump Label Coordinator' },
      { key: 'hz_pt_u_jump_senior_md', label: 'HZ PT U Jump Senior MD' },
      { key: 'hz_u_jump_shipping', label: 'HZ U Jump Shipping' },
      { key: 'pt_ujump_shipping', label: 'PT U Jump Shipping' },
      { key: 'fa_pt_uwu', label: 'FA PT UWU' },
      { key: 'fa_hz_u', label: 'FA HZ U' },
      
      // Wuxi related
      { key: 'wuxi_trims_coordinator', label: 'Wuxi Trims Coordinator' },
      { key: 'wuxi_label_coordinator', label: 'Wuxi Label Coordinator' },
      { key: 'wuxi_jump_senior_md', label: 'Wuxi Jump Senior MD' },
      { key: 'wuxi_shipping', label: 'Wuxi Shipping' },
      { key: 'fa_wuxi', label: 'FA Wuxi' },
      
      // Singfore related
      { key: 'singfore_trims_coordinator', label: 'Singfore Trims Coordinator' },
      { key: 'singfore_label_coordinator', label: 'Singfore Label Coordinator' },
      { key: 'singfore_jump_senior_md', label: 'Singfore Jump Senior MD' },
      { key: 'singfore_shipping', label: 'Singfore Shipping' },
      { key: 'fa_singfore', label: 'FA Singfore' },
      
      // Korea Mel related
      { key: 'koreamel_trims_coordinator', label: 'Korea Mel Trims Coordinator' },
      { key: 'koreamel_label_coordinator', label: 'Korea Mel Label Coordinator' },
      { key: 'koreamel_jump_senior_md', label: 'Korea Mel Jump Senior MD' },
      { key: 'koreamel_shipping', label: 'Korea Mel Shipping' },
      { key: 'fa_korea_m', label: 'FA Korea M' },
      
      // Heads Up related
      { key: 'headsup_trims_coordinator', label: 'Heads Up Trims Coordinator' },
      { key: 'headsup_label_coordinator', label: 'Heads Up Label Coordinator' },
      { key: 'headsup_senior_md', label: 'Heads Up Senior MD' },
      { key: 'headsup_shipping', label: 'Heads Up Shipping' },
      { key: 'fa_heads_up', label: 'FA Heads Up' },
    ];

    // Use the passed factoryType prop to determine which contacts to show
    if (factoryType && factoryColumnMap[factoryType]) {
      const allowedKeys = factoryColumnMap[factoryType];
      const filtered = allFactoryContacts.filter(contact => 
        allowedKeys.includes(contact.key)
      );
      return filtered;
    }
    
    // Fallback: return all factory contacts that have data
    return allFactoryContacts.filter(contact => 
      brandData[contact.key] !== undefined
    );
  };

  const factoryContactFields = getFactoryContactsForBrand();
  


  const assignedContacts = contactFields.filter(field => {
    const value = brandData[field.key];
    return value && 
           value !== '' && 
           value !== null && 
           value !== undefined &&
           value !== '0' &&
           value !== 'N/A' &&
           value !== '-' &&
           (typeof value !== 'string' || value.trim() !== '');
  });

  const unassignedContacts = contactFields.filter(field => {
    const value = brandData[field.key];
    return !value || 
           value === '' || 
           value === null || 
           value === undefined ||
           value === '0' ||
           value === 'N/A' ||
           value === '-' ||
           (typeof value === 'string' && value.trim() === '');
  });

  const assignedFactoryContacts = factoryContactFields.filter(field => {
    const value = brandData[field.key];
    return value && 
           value !== '' && 
           value !== null && 
           value !== undefined &&
           value !== '0' &&
           value !== 'N/A' &&
           value !== '-' &&
           (typeof value !== 'string' || value.trim() !== '');
  });


  const unassignedFactoryContacts = factoryContactFields.filter(field => {
    const value = brandData[field.key];
    return !value || 
           value === '' || 
           value === null || 
           value === undefined ||
           value === '0' ||
           value === 'N/A' ||
           value === '-' ||
           (typeof value === 'string' && value.trim() === '');
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl w-full">
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-success-600 to-success-700 px-6 py-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-soft">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{brand}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-soft"></div>
                <p className="text-white/90 text-sm font-medium">Contact Directory</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Professional Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {contactFields.length > 0 || factoryContactFields.length > 0 ? (
            <>
              {/* All Contacts - Assigned and Unassigned */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Contacts
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {assignedContacts.length} assigned, {unassignedContacts.length} available
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contactFields.map((field) => {
                    const value = brandData[field.key];
                    const isAssigned = value && 
                      value !== '' && 
                      value !== null && 
                      value !== undefined &&
                      value !== '0' &&
                      value !== 'N/A' &&
                      value !== '-' &&
                      (typeof value !== 'string' || value.trim() !== '');
                    
                    return (
                      <div key={field.key} className={`p-5 border-secondary-200 ${isAssigned ? 'card-interactive' : 'bg-secondary-50 opacity-75'}`}>
                        <div className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                          {field.label}
                        </div>
                        <div className={`font-semibold text-base ${isAssigned ? 'text-secondary-900' : 'text-secondary-400'}`}>
                          {formatContactName(brandData[field.key])}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Factory Contacts Section - Show right after Assigned Contacts */}
              {factoryContactFields.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-brand-purple/10 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-brand-purple" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        Factory Information
                      </h3>
                      <p className="text-sm text-secondary-500">
                        {assignedFactoryContacts.length} assigned, {unassignedFactoryContacts.length} available
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {factoryContactFields.length > 0 ? factoryContactFields.map((field) => {
                      const value = brandData[field.key];
                      const isAssigned = value && 
                        value !== '' && 
                        value !== null && 
                        value !== undefined &&
                        value !== '0' &&
                        value !== 'N/A' &&
                        value !== '-' &&
                        (typeof value !== 'string' || value.trim() !== '');
                      
                      return (
                        <div key={field.key} className={`p-5 border-brand-purple/20 ${isAssigned ? 'card-interactive' : 'bg-brand-purple/5 opacity-75'}`}>
                          <div className="text-xs font-semibold text-brand-purple/70 uppercase tracking-wider mb-3">
                            {field.label}
                          </div>
                          <div className={`font-semibold text-base ${isAssigned ? 'text-secondary-900' : 'text-brand-purple/50'}`}>
                            {isAssigned ? formatContactName(brandData[field.key]) : 'Not assigned'}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="col-span-full p-8 text-center bg-brand-purple/5 rounded-xl border border-brand-purple/20">
                        <div className="text-brand-purple/60 font-medium">
                          No factory contacts found for this brand
                        </div>
                        <div className="text-sm text-brand-purple/40 mt-2">
                          Brand: {brand}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </>
          ) : null}


          {/* Show empty state only if no contacts at all */}
          {contactFields.length === 0 && factoryContactFields.length === 0 ? (
            /* Professional Empty State */
            <div className="text-center py-20">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-3xl flex items-center justify-center shadow-soft mx-auto">
                  <Users className="w-10 h-10 text-secondary-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center">
                  <span className="text-warning-600 text-xs font-bold">0</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">No Contacts Assigned</h3>
              <p className="text-secondary-500 mb-8 max-w-md mx-auto leading-relaxed">
                This brand doesn't have any contact persons assigned yet. Contact assignments help organize responsibilities and communication.
              </p>
              
              <div className="mt-12">
                <h4 className="text-lg font-semibold text-secondary-700 mb-6">Available Positions</h4>
                
                {/* Regular Contact Positions */}
                <div className="mb-8">
                  <h5 className="text-md font-medium text-secondary-600 mb-4">General Contacts</h5>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
                  {contactFields.map((field) => (
                    <div key={field.key} className="bg-secondary-50 rounded-xl p-4 border border-secondary-200 opacity-75">
                      <div className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                        {field.label}
                      </div>
                      <div className="text-secondary-400 font-medium">
                        Available
                      </div>
                    </div>
                  ))}
                </div>
                </div>

                {/* Factory Contact Positions */}
                {factoryContactFields.length > 0 && (
                  <div>
                    <h5 className="text-md font-medium text-secondary-600 mb-4">Factory Contacts</h5>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
                      {factoryContactFields.map((field) => (
                        <div key={field.key} className="bg-brand-purple/5 rounded-xl p-4 border border-brand-purple/20 opacity-75">
                          <div className="text-xs font-semibold text-brand-purple/60 uppercase tracking-wider mb-3">
                            {field.label}
                          </div>
                          <div className="text-brand-purple/50 font-medium">
                            Available
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BrandModalFactory;