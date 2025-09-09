import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { DataRecord, Column } from '../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DataRecord | Omit<DataRecord, 'id'>) => Promise<any> | void;
  record?: DataRecord | null;
  columns: Column[];
  title: string;
  userRole?: 'company' | 'factory' | 'admin';
}

// Utility function to normalize yes_blank values
const normalizeYesBlankValue = (value: any): string => {
  if (typeof value === 'string' && value.toLowerCase() === 'yes') {
    return 'Yes';
  }
  return '';
};

// Fields that company users cannot edit
const COMPANY_RESTRICTED_FIELDS = [
  'hz_pt_u_jump_senior_md',
  'hz_u_jump_shipping',
  'pt_ujump_shipping',
  'wuxi_jump_senior_md',
  'wuxi_shipping',
  'singfore_jump_senior_md',
  'singfore_shipping',
  'koreamel_jump_senior_md',
  'koreamel_shipping',
  'headsup_senior_md',
  'headsup_shipping',
  'fa_wuxi', 
  'fa_hz_u', 
  'fa_pt_uwu', 
  'fa_korea_m', 
  'fa_singfore', 
  'fa_heads_up',
  'wuxi_trims_coordinator',
  'wuxi_label_coordinator',
  'singfore_trims_coordinator',
  'singfore_label_coordinator',
  'headsup_trims_coordinator',
  'headsup_label_coordinator',
  'hz_pt_ujump_trims_coordinator',
  'hz_pt_ujump_label_coordinator',
  'koreamel_trims_coordinator',
  'koreamel_label_coordinator',
];

// Check if a field should be restricted for the current user
const isFieldRestricted = (columnKey: string, userRole?: string): boolean => {
  if (userRole === 'company') {
    return COMPANY_RESTRICTED_FIELDS.includes(columnKey);
  }
  return false;
};

export const RecordModal = ({
  isOpen,
  onClose,
  onSave,
  record,
  columns,
  title,
  userRole
}: RecordModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        // Normalize yes_blank values when loading existing record
        const normalizedData = { ...record };
        columns.forEach(col => {
          if (col.type === 'yes_blank') {
            normalizedData[col.key] = normalizeYesBlankValue(record[col.key]);
          }
        });
        setFormData(normalizedData);
      } else {
        const initialData: Record<string, any> = {};
        columns.forEach(col => {
          if (col.type === 'boolean') {
            initialData[col.key] = false;
          } else if (col.type === 'yes_blank') {
            initialData[col.key] = '';
          } else {
            initialData[col.key] = '';
          }
        });
        setFormData(initialData);
      }
    }
  }, [isOpen, record, columns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Normalize yes_blank values before saving
      const normalizedData = { ...formData };
      columns.forEach(col => {
        if (col.type === 'yes_blank') {
          normalizedData[col.key] = normalizeYesBlankValue(formData[col.key]);
        }
      });

      if (record) {
        await onSave({ ...normalizedData, id: record.id } as DataRecord);
      } else {
        await onSave(normalizedData as Omit<DataRecord, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save record:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-3xl">
        {/* Professional Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 bg-gradient-to-r from-secondary-50 to-secondary-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
              <p className="text-sm text-secondary-500">Fill in the details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Professional Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {columns
              .filter(col => !isFieldRestricted(col.key, userRole))
              .map(col => (
              <div key={col.key} className={`space-y-3 ${col.key === 'all_brand' ? 'md:col-span-2' : ''}`}>
                <label className="block text-sm font-semibold text-secondary-700">
                  {col.label}
                  {col.required && <span className="text-error-500 ml-1">*</span>}
                </label>
                
                {col.type === 'select' ? (
                  <select
                    value={formData[col.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                    className="input-field"
                    required={col.required}
                  >
                    <option value="">Select {col.label}</option>
                    {col.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : col.type === 'boolean' ? (
                  <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <input
                      type="checkbox"
                      checked={formData[col.key] || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.checked }))}
                      className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span className="text-sm font-medium text-secondary-700">Yes</span>
                  </div>
                ) : col.type === 'yes_blank' ? (
                  <div className="flex items-center gap-6 p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <label className="flex items-center cursor-pointer gap-3">
                      <input
                        type="radio"
                        name={col.key}
                        value=""
                        checked={formData[col.key] === '' || !formData[col.key]}
                        onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                        className="w-4 h-4 text-secondary-400 border-secondary-300 focus:ring-2 focus:ring-secondary-500/20"
                      />
                      <span className="text-sm font-medium text-secondary-600">Blank</span>
                    </label>
                    <label className="flex items-center cursor-pointer gap-3">
                      <input
                        type="radio"
                        name={col.key}
                        value="Yes"
                        checked={formData[col.key] === 'Yes'}
                        onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                        className="w-4 h-4 text-success-600 border-secondary-300 focus:ring-2 focus:ring-success-500/20"
                      />
                      <span className="text-sm font-medium text-secondary-600">Yes</span>
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData[col.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                    className="input-field"
                    required={col.required}
                    placeholder={`Enter ${col.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Professional Actions */}
          <div className="flex gap-4 pt-8 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 shadow-glow hover:shadow-glow-lg"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;