import React from 'react';
import { X, Building, Users } from 'lucide-react';
import type { DataRecord } from '../types';

interface BrandModalFactoryProps {
  brand: string;
  brandData: DataRecord;
  onClose: () => void;
}

const BrandModalFactory: React.FC<BrandModalFactoryProps> = ({ brand, brandData, onClose }) => {
  const formatContactName = (value: any): string => {
    if (value === null || value === undefined || value === '') {
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

  const assignedContacts = contactFields.filter(field => 
    brandData[field.key] && 
    brandData[field.key] !== '' && 
    brandData[field.key] !== null && 
    brandData[field.key] !== undefined
  );

  const unassignedContacts = contactFields.filter(field => 
    !brandData[field.key] || 
    brandData[field.key] === '' || 
    brandData[field.key] === null || 
    brandData[field.key] === undefined
  );

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
          {assignedContacts.length > 0 ? (
            <>
              {/* Assigned Contacts */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Assigned Contacts
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {assignedContacts.length} contact{assignedContacts.length !== 1 ? 's' : ''} assigned to this brand
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {assignedContacts.map((field) => (
                    <div key={field.key} className="card-interactive p-5">
                      <div className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                        {field.label}
                      </div>
                      <div className="text-secondary-900 font-semibold text-base">
                        {formatContactName(brandData[field.key])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unassigned Positions */}
              {unassignedContacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        Unassigned Positions
                      </h3>
                      <p className="text-sm text-secondary-500">
                        {unassignedContacts.length} position{unassignedContacts.length !== 1 ? 's' : ''} available for assignment
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {unassignedContacts.map((field) => (
                      <div key={field.key} className="bg-secondary-50 rounded-xl p-4 border border-secondary-200 opacity-75">
                        <div className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                          {field.label}
                        </div>
                        <div className="text-secondary-400 font-medium">
                          Not assigned
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandModalFactory;