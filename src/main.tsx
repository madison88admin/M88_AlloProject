import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import M88DatabaseUI from './App';
import LoginPage from './components/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';

// Account interface for user prop
interface Account {
  id: string;
  username: string;
  password: string;
  type: 'company' | 'factory' | 'admin';
  name: string;
  department?: string | null;
  facility?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

function RootApp() {
  const [tableType, setTableType] = useState<'company' | 'factory' | 'admin' | null>(null);
  const [user, setUser] = useState<Account | null>(null);
  
  if (!tableType || !user) {
    return <LoginPage onLogin={(userData) => {
      setUser(userData);
      setTableType(userData.type);
    }} />;
  }
  
  return <M88DatabaseUI 
    tableType={tableType} 
    onLogout={() => {
      setTableType(null);
      setUser(null);
    }} 
    user={user}
  />;
}

// Prevent multiple root creation during hot reload
let root: ReactDOM.Root | null = null;

const container = document.getElementById('root');
if (!root) {
  root = ReactDOM.createRoot(container!);
}

const renderApp = () => {
  root!.render(
    <React.StrictMode>
      <ErrorBoundary>
        <RootApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
};

renderApp();

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    renderApp();
  });
}