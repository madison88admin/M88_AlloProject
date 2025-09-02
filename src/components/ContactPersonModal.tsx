import React from 'react';
import { X, User, Building } from 'lucide-react';

interface ContactPersonModalProps {
  name: string;
  details: { brand: string; position: string }[];
  onClose: () => void;
}

const positionLabels: Record<string, string> = {
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
};

const ContactPersonModal: React.FC<ContactPersonModalProps> = ({ name, details, onClose }) => {
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
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{name}</h2>
              <p className="text-slate-400 text-sm">Contact Person Details</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {details.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-4 h-4 text-slate-600" />
                <h3 className="text-base font-medium text-slate-900">
                  Brand Assignments ({details.length})
                </h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {details.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                      Brand: {item.brand}
                    </div>
                    <div className="text-slate-900 font-medium">
                      {positionLabels[item.position] || item.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Assignments Found</h3>
              <p className="text-slate-500">
                This contact person has no brand assignments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPersonModal;