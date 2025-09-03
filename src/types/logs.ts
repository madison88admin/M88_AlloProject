export interface UserLog {
  id: string;
  userId: string;
  username: string;
  userType: 'company' | 'factory' | 'admin';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'FILTER' | 'SEARCH';
  entity: 'RECORD' | 'COLUMN' | 'USER' | 'SYSTEM';
  entityId?: string;
  entityName?: string;
  details: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    recordId?: number;
    recordName?: string;
    columnName?: string;
    searchTerm?: string;
    filterType?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  timestamp: string;
  createdAt: string;
}

export interface LogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface LogStats {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByUser: Record<string, number>;
  logsByEntity: Record<string, number>;
  recentActivity: UserLog[];
}
