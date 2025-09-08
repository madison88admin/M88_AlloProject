import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  X as XIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const allLogs = loggingService.getLogs();

  // Refresh logs when modal opens and periodically while open
  useEffect(() => {
    if (isOpen) {
      // Refresh immediately when modal opens
      setRefreshTrigger(prev => prev + 1);
      
      // Set up periodic refresh every 5 seconds while modal is open
      const interval = setInterval(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 5000);
      
      // Cleanup interval when modal closes
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
  }, [allLogs, searchTerm, filters, refreshTrigger]);

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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    // Helper function to add a new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('User Activity Logs Report', margin, yPosition);
    yPosition += 15;

    // Report info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleString();
    const totalLogs = allLogs.length;
    const filteredCount = filteredLogs.length;
    
    doc.text(`Generated: ${reportDate}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total Logs: ${totalLogs} | Filtered Results: ${filteredCount}`, margin, yPosition);
    yPosition += 15;

    // Add a line
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    if (filteredLogs.length === 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('No activity logs found matching the current filters.', margin, yPosition);
    } else {
      // Log entries
      filteredLogs.forEach((log, index) => {
        checkNewPage(30); // Reserve space for each log entry

        // Log number and timestamp
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const logNumber = `#${index + 1}`;
        const { date, time } = formatTimestamp(log.timestamp);
        doc.text(`${logNumber} - ${date} ${time}`, margin, yPosition);
        yPosition += 8;

        // Action and User Type
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const actionText = `Action: ${log.action}`;
        const userTypeText = `User Type: ${log.userType}`;
        const entityText = `Resource: ${log.entity || 'N/A'}`;
        
        doc.text(actionText, margin, yPosition);
        doc.text(userTypeText, margin + 60, yPosition);
        doc.text(entityText, margin + 120, yPosition);
        yPosition += 6;

        // User ID
        doc.text(`User ID: ${log.userId}`, margin, yPosition);
        yPosition += 6;

        // Description
        const description = log.details.recordName || log.details.columnName || log.details.searchTerm || `${log.action} ${log.entity}`;
        yPosition = addWrappedText(`Description: ${description}`, margin, yPosition, contentWidth, 9);
        yPosition += 8;

        // Add separator line
        if (index < filteredLogs.length - 1) {
          doc.setLineWidth(0.2);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 5;
        }
      });
    }

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      doc.text('Generated by M88 Account Allocation System', margin, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `user-activity-logs-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      loggingService.clearLogs();
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const refreshLogs = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large w-full flex flex-col bg-white dark:bg-slate-800 shadow-2xl border-0 animate-fade-in-up">
        {/* Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800/80">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                User Activity Logs
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {filteredLogs.length} of {allLogs.length} total logs
                </span>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Real-time monitoring
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportLogs} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 text-sm" 
              title="Export logs as PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button 
              onClick={clearLogs} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium rounded-xl border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-sm" 
              title="Clear all logs"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button 
              onClick={onClose} 
              className="inline-flex items-center justify-center w-10 h-10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200" 
              title="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Professional Filter Section */}
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filter & Search</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Search Logs</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Action Type</label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Resource Type</label>
              <select
                value={filters.entity || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value || undefined }))}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
              >
                <option value="">All Resource Type</option>
                <option value="RECORD">Record</option>
                <option value="COLUMN">Column</option>
                <option value="USER">User</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                  className="flex-1 px-3 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                  className="flex-1 px-3 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Log Entries Section */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50/30 dark:bg-slate-800/30">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Activity Logs Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                No activity logs match your current filters. Try adjusting your search criteria or date range.
              </p>
            </div>
          ) : (
            <>
              {/* Professional Header Bar */}
              <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {filteredLogs.length} Activity Log{filteredLogs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span>Click any log for detailed information</span>
                  </div>
                </div>
              </div>
              
              {/* Log Entries */}
              <div className="p-6 space-y-3">
                {filteredLogs.map((log, index) => {
                  const { date, time } = formatTimestamp(log.timestamp);
                  return (
                    <div
                      key={log.id}
                      className="group bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 hover:shadow-lg hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 animate-stagger"
                      onClick={() => setSelectedLog(log)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Action Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            {getActionIcon(log.action)}
                          </div>
                        </div>
                        
                        {/* Log Content */}
                        <div className="flex-1 min-w-0">
                          {/* Action and User Type Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getUserTypeColor(log.userType)}`}>
                              {log.userType}
                            </span>
                            {log.entity && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {log.entity}
                              </span>
                            )}
                          </div>
                          
                          {/* Description */}
                          <div className="text-sm text-slate-700 dark:text-slate-300 mb-4 break-words leading-relaxed">
                            {log.details.recordName || log.details.columnName || log.details.searchTerm || `${log.action} ${log.entity}`}
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[150px] sm:max-w-none font-medium">
                                {log.userId}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-medium">{date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-medium">{time}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Arrow */}
                        <div className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 rotate-[-90deg]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {selectedLog && (
          <div className="modal-overlay">
            <div className="modal-content max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 shadow-2xl border-0">
              {/* Professional Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800/80">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                    {getActionIcon(selectedLog.action)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedLog.action} Activity
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {selectedLog.entity || 'System'}
                      </span>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatTimestamp(selectedLog.timestamp).date} at {formatTimestamp(selectedLog.timestamp).time}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)} 
                  className="inline-flex items-center justify-center w-10 h-10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 self-start sm:self-auto"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Professional Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Key Information Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">User Information</label>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">User ID</span>
                        <p className="text-sm text-slate-900 dark:text-white break-all font-mono">{selectedLog.userId}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">User Type</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(selectedLog.userType)}`}>
                            {selectedLog.userType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Activity Details</label>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Action</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(selectedLog.action)}`}>
                            {selectedLog.action}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Resource</span>
                        <p className="text-sm text-slate-900 dark:text-white font-medium">{selectedLog.entity || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description Card */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Activity Description</label>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                      {selectedLog.details.recordName || selectedLog.details.columnName || selectedLog.details.searchTerm || `${selectedLog.action} ${selectedLog.entity}`}
                    </p>
                  </div>
                </div>
                
                {/* Additional Details Card */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Additional Information</label>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words font-mono">
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
