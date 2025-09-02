import React from 'react';

interface ContactPersonModalProps {
  name: string;
  details: { brand: string; position: string }[];
  onClose: () => void;
}

const positionLabels: Record<string, string> = {
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

const ContactPersonModal: React.FC<ContactPersonModalProps> = ({ name, details, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">{name}</h2>
        <div className="mb-2 text-slate-700">Brands and Positions:</div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {details.length === 0 ? (
            <div className="text-slate-500">No brands or positions found.</div>
          ) : (
            details.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-100 py-2">
                <span className="font-medium text-slate-800">{item.brand}</span>
                <span className="text-slate-600">{positionLabels[item.position] || item.position}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPersonModal;
