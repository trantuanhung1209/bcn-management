'use client';

import { useState, useEffect } from 'react';
import { getUserSession } from '@/lib/auth-utils';

const DebugPanel: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    const session = getUserSession();
    setUserSession(session);
  }, []);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowDebug(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Debug Info</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>User Session:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(userSession, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>LocalStorage userData:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {typeof window !== 'undefined' ? localStorage.getItem('userData') || 'null' : 'N/A'}
          </pre>
        </div>
        
        <div>
          <strong>SessionStorage userData:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {typeof window !== 'undefined' ? sessionStorage.getItem('userData') || 'null' : 'N/A'}
          </pre>
        </div>

        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              sessionStorage.clear();
              alert('Storage cleared!');
            }
          }}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs mt-2"
        >
          Clear Storage
        </button>

        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              const demoSession = {
                id: '6681234567890abcdef12345',
                email: 'manager@demo.com',
                firstName: 'Manager',
                lastName: 'Demo',
                role: 'team_leader',
                avatar: 'MD'
              };
              localStorage.setItem('userData', JSON.stringify(demoSession));
              alert('Demo session created! Refresh page.');
              setUserSession(demoSession);
            }
          }}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs mt-1"
        >
          Create Demo Session
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;