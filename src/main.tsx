import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import M88DatabaseUI from './App';
import LoginPage from './components/LoginPage';

function RootApp() {
  const [tableType, setTableType] = useState<'company' | 'factory' | null>(null);
  if (!tableType) {
    return <LoginPage />;
  }
  return <M88DatabaseUI tableType={tableType} onLogout={() => setTableType(null)} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);