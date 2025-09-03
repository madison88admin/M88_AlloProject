import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  User, 
  Calendar,
  Clock,
  Database,
  Edit,
  Plus,
  X as XIcon
} from 'lucide-react';
import { loggingService } from '../services/loggingService';
import type { UserLog, LogFilters } from '../types/logs';

interface UserLogsProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserLogs: React.FC<UserLogsProps> = ({ isOpen, onClose }) => {
  const [filters, setFilters] = useState<LogFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<UserLog | null>(null);

  const allLogs = loggingService.getLogs();

  const filteredLogs = useMemo(() => {
    let logs = allLogs;

    if (searchTerm) {
      logs = loggingService.searchLogs(searchTerm);
    }

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }
    if (filters.entity) {
      logs = logs.filter(log => log.entity === filters.entity);
    }
    if (filters.dateFrom && filters.dateTo) {
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const fromDate = new Date(filters.dateFrom!);
        const toDate = new Date(filters.dateTo!);
        return logDate >= fromDate && logDate <= toDate;
      });
    }

    return logs;
  }, [allLogs, searchTerm, filters]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <XIcon className="w-4 h-4 text-red-600" />;
      case 'VIEW': return <Eye className="w-4 h-4 text-gray-600" />;
      case 'LOGIN': return <User className="w-4 h-4 text-green-600" />;
      case 'LOGOUT': return <User className="w-4 h-4 text-gray-600" />;
      case 'SEARCH': return <Search className="w-4 h-4 text-purple-600" />;
      case 'FILTER': return <Search className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VIEW': return 'bg-gray-100 text-gray-800';
      case 'LOGIN': return 'bg-green-100 text-green-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'SEARCH': return 'bg-purple-100 text-purple-800';
      case 'FILTER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'company': return 'bg-blue-100 text-blue-800';
      case 'factory': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const exportLogs = () => {
    const dataStr = loggingService.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      loggingService.clearLogs();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-6xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 bg-gradient-to-r from-secondary-50 to-secondary-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900">User Activity Logs</h2>
              <p className="text-sm text-secondary-500">
                {filteredLogs.length} of {allLogs.length} total logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportLogs} className="btn-secondary p-2" title="Export logs">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={clearLogs} className="btn-danger p-2" title="Clear all logs">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="btn-ghost p-2" title="Close">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-secondary-200 bg-secondary-50/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Action</label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                className="input-field"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="SEARCH">Search</option>
                <option value="FILTER">Filter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Entity</label>
              <select
                value={filters.entity || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value || undefined }))}
                className="input-field"
              >
                <option value="">All Entities</option>
                <option value="RECORD">Record</option>
                <option value="COLUMN">Column</option>
                <option value="USER">User</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                  className="input-field text-sm"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No logs found</h3>
              <p className="text-secondary-500">No activity logs match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp);
                return (
                  <div
                    key={log.id}
                    className="bg-white border border-secondary-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getActionIcon(log.action)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(log.userType)}`}>
                              {log.userType}
                            </span>
                          </div>
                          <div className="text-sm text-secondary-600">
                            {log.details.recordName || log.details.columnName || log.details.searchTerm || `${log.action} ${log.entity}`}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-secondary-500 mt-2">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{log.userId}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{time}</span>
                            </div>
                            {log.entity && (
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                <span>{log.entity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedLog && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <div className="flex items-center gap-3">
                  {getActionIcon(selectedLog.action)}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {selectedLog.action} - {selectedLog.entity || 'System'}
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {formatTimestamp(selectedLog.timestamp).date} at {formatTimestamp(selectedLog.timestamp).time}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="btn-ghost p-2">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">User ID</label>
                    <p className="text-sm text-secondary-900">{selectedLog.userId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">User Type</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(selectedLog.userType)}`}>
                      {selectedLog.userType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Action</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Entity</label>
                    <p className="text-sm text-secondary-900">{selectedLog.entity || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                  <p className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded-lg">
                    {selectedLog.details.recordName || selectedLog.details.columnName || selectedLog.details.searchTerm || `${selectedLog.action} ${selectedLog.entity}`}
                  </p>
                </div>
                
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Additional Details</label>
                    <div className="bg-secondary-50 p-3 rounded-lg">
                      <pre className="text-xs text-secondary-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogs;
