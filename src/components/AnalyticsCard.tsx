import { TrendingUp } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  color?: 'blue' | 'emerald' | 'purple' | 'amber';
}

export const AnalyticsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue'
}: AnalyticsCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend.isUp ? '' : 'rotate-180'}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    </div>
  );
};


export default AnalyticsCard;