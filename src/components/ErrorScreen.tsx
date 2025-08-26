import { Database, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export const ErrorScreen = ({ error, onRetry }: ErrorScreenProps) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl border border-red-200/50 p-8 max-w-lg mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
          <Database className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-red-800">Database Error</h3>
      </div>
      <p className="text-red-600 mb-6">{error}</p>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-red-700">
          <strong>Note:</strong> This demo uses local storage to simulate a database.
          Your data will persist between sessions.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorScreen;