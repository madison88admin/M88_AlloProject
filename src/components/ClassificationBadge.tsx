interface ClassificationBadgeProps {
    classification: string;
  }
  
  export const ClassificationBadge = ({ classification }: ClassificationBadgeProps) => {
    if (!classification) return <span className="text-slate-400 text-sm">—</span>;
    
    const variants = {
      'Top': 'bg-gradient-to-r from-purple-600 to-pink-600',
      'Growth': 'bg-gradient-to-r from-emerald-500 to-teal-600',
      'Emerging': 'bg-gradient-to-r from-blue-500 to-cyan-600',
      'Maintain': 'bg-gradient-to-r from-amber-500 to-orange-600',
      'Divest': 'bg-gradient-to-r from-red-500 to-rose-600',
    };
  
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${variants[classification as keyof typeof variants] || 'bg-gradient-to-r from-slate-500 to-slate-600'}`}>
        {classification}
      </span>
    );
  };

  export default ClassificationBadge;