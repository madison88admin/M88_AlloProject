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
}

// Utility function to normalize yes_blank values
const normalizeYesBlankValue = (value: any): string => {
  if (typeof value === 'string' && value.toLowerCase() === 'yes') {
    return 'Yes';
  }
  return '';
};

export const RecordModal = ({
  isOpen,
  onClose,
  onSave,
  record,
  columns,
  title
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {columns.map(col => (
              <div key={col.key} className={col.key === 'all_brand' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {col.label}
                  {col.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {col.type === 'select' ? (
                  <select
                    value={formData[col.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                    required={col.required}
                  >
                    <option value="">Select {col.label}</option>
                    {col.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : col.type === 'boolean' ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[col.key] || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="ml-2 text-sm text-slate-600">Yes</span>
                  </div>
                ) : col.type === 'yes_blank' ? (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={col.key}
                        value=""
                        checked={formData[col.key] === '' || !formData[col.key]}
                        onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                        className="w-4 h-4 text-slate-400 border-slate-300 focus:ring-2 focus:ring-slate-500/20"
                      />
                      <span className="ml-2 text-sm text-slate-600">Blank</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={col.key}
                        value="Yes"
                        checked={formData[col.key] === 'Yes'}
                        onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                        className="w-4 h-4 text-green-600 border-slate-300 focus:ring-2 focus:ring-green-500/20"
                      />
                      <span className="ml-2 text-sm text-slate-600">Yes</span>
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData[col.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [col.key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                    required={col.required}
                    placeholder={`Enter ${col.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
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