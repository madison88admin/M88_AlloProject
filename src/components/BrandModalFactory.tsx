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
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{brand}</h2>
              <p className="text-slate-400 text-sm">Contact Directory</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {assignedContacts.length > 0 ? (
            <>
              {/* Assigned Contacts */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-slate-600" />
                  <h3 className="text-base font-medium text-slate-900">
                    Assigned Contacts ({assignedContacts.length})
                  </h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {assignedContacts.map((field) => (
                    <div key={field.key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                        {field.label}
                      </div>
                      <div className="text-slate-900 font-medium">
                        {formatContactName(brandData[field.key])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unassigned Positions */}
              {unassignedContacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-slate-600" />
                    <h3 className="text-base font-medium text-slate-900">
                      Unassigned Positions ({unassignedContacts.length})
                    </h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {unassignedContacts.map((field) => (
                      <div key={field.key} className="bg-slate-50 rounded-lg p-4 border border-slate-200 opacity-60">
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                          {field.label}
                        </div>
                        <div className="text-slate-500 font-medium">
                          Not assigned
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
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Contacts Assigned</h3>
              <p className="text-slate-500 mb-8">
                This brand doesn't have any contact persons assigned yet.
              </p>
              
              <div className="mt-8">
                <h4 className="text-base font-medium text-slate-700 mb-4">Available Positions:</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {contactFields.map((field) => (
                    <div key={field.key} className="bg-slate-50 rounded-lg p-4 border border-slate-200 opacity-60">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                        {field.label}
                      </div>
                      <div className="text-slate-500 font-medium">
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