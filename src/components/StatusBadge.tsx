export interface StatusBadgeProps {
    status: string;
  }
  
  export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const variants = {
      'Active': 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
      'Inactive': 'bg-slate-500/10 text-slate-700 border-slate-200/50',
      'In Development': 'bg-amber-500/10 text-amber-700 border-amber-200/50',
      'On hold': 'bg-red-500/10 text-red-700 border-red-200/50',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[status as keyof typeof variants] || variants['Inactive']}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
          status === 'Active' ? 'bg-emerald-500' :
          status === 'In Development' ? 'bg-amber-500' :
          status === 'On hold' ? 'bg-red-500' : 'bg-slate-500'
        }`} />
        {status || 'Unknown'}
      </span>
    );
  };

  export default StatusBadge;