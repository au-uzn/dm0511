import React, { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    // Test Firebase Connection as per critical directive in skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  // Simple URL parameter based routing for demo/testing convenience
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setView('admin');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'customer' ? (
        <>
          <CustomerView />
          <button 
            onClick={() => setView('admin')}
            className="fixed bottom-10 right-10 w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-xl shadow-black/5 hover:shadow-emerald-500/10 z-40 group"
            title="Admin Management"
            id="admin-switch"
          >
            <LockIcon size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </>
      ) : (
        <AdminView onBack={() => setView('customer')} />
      )}
    </div>
  );
}

function LockIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
