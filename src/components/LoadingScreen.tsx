// No icons used here

export const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
        <div className="text-slate-600 font-medium">Loading M88 Database...</div>
      </div>
    </div>
  </div>
);


export default LoadingScreen;