import type { UserLog } from '../types/logs';

class LoggingService {
  private logs: UserLog[] = [];
  private readonly STORAGE_KEY = 'm88_user_logs';

  constructor() {
    this.loadLogsFromStorage();
  }

  private loadLogsFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
      this.logs = [];
    }
  }

  private saveLogsToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  log(
    userId: string,
    username: string,
    userType: 'company' | 'factory' | 'admin',
    action: UserLog['action'],
    entity: UserLog['entity'],
    details: UserLog['details'] = {}
  ): void {
    const log: UserLog = {
      id: this.generateLogId(),
      userId,
      username,
      userType,
      action,
      entity,
      entityId: details.recordId?.toString(),
      entityName: details.recordName || details.columnName,
      details: {
        ...details,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
      },
      timestamp: this.getCurrentTimestamp(),
      createdAt: this.getCurrentTimestamp(),
    };

    this.logs.unshift(log); // Add to beginning for chronological order
    
    // Keep only last 1000 logs to prevent storage bloat
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    this.saveLogsToStorage();
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
    }
  }

  private getClientIP(): string {
    // In a real application, you'd get this from the server
    // For now, we'll use a placeholder
    return '127.0.0.1';
  }

  getLogs(limit?: number): UserLog[] {
    return limit ? this.logs.slice(0, limit) : this.logs;
  }

  getLogsByUser(userId: string): UserLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  getLogsByAction(action: UserLog['action']): UserLog[] {
    return this.logs.filter(log => log.action === action);
  }

  getLogsByEntity(entity: UserLog['entity']): UserLog[] {
    return this.logs.filter(log => log.entity === entity);
  }

  getLogsByDateRange(startDate: string, endDate: string): UserLog[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  searchLogs(searchTerm: string): UserLog[] {
    const term = searchTerm.toLowerCase();
    return this.logs.filter(log => 
      log.username.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      log.entityName?.toLowerCase().includes(term) ||
      log.details.recordName?.toLowerCase().includes(term) ||
      log.details.columnName?.toLowerCase().includes(term)
    );
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogsToStorage();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const loggingService = new LoggingService();

// Helper functions for common logging scenarios
export const logUserAction = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin',
  action: UserLog['action'],
  entity: UserLog['entity'],
  details: UserLog['details'] = {}
) => {
  loggingService.log(userId, username, userType, action, entity, details);
};

export const logRecordCreate = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin',
  recordId: number,
  recordName: string
) => {
  logUserAction(userId, username, userType, 'CREATE', 'RECORD', {
    recordId,
    recordName,
  });
};

export const logRecordUpdate = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin',
  recordId: number,
  recordName: string,
  field: string,
  oldValue: any,
  newValue: any
) => {
  logUserAction(userId, username, userType, 'UPDATE', 'RECORD', {
    recordId,
    recordName,
    field,
    oldValue,
    newValue,
  });
};

export const logRecordDelete = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin',
  recordId: number,
  recordName: string
) => {
  logUserAction(userId, username, userType, 'DELETE', 'RECORD', {
    recordId,
    recordName,
  });
};

export const logUserLogin = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin'
) => {
  logUserAction(userId, username, userType, 'LOGIN', 'USER');
};

export const logUserLogout = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin'
) => {
  logUserAction(userId, username, userType, 'LOGOUT', 'USER');
};

export const logSearch = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin',
  searchTerm: string
) => {
  logUserAction(userId, username, userType, 'SEARCH', 'SYSTEM', {
    searchTerm,
  });
};

export const logFilter = (
  userId: string,
  username: string,
  userType: 'company' | 'factory' | 'admin',
  filterType: string,
  filterValue: any
) => {
  logUserAction(userId, username, userType, 'FILTER', 'SYSTEM', {
    filterType,
    newValue: filterValue,
  });
};
