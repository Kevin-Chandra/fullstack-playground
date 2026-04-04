'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3011';

export default function HealthPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [data, setData] = useState<{ status: string; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/health`);
      setData(res.data);
      setStatus('ok');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-zinc-50 dark:bg-black">
      <h1 className="text-3xl font-semibold text-black dark:text-white">
        Backend Health Check
      </h1>

      <button
        onClick={checkHealth}
        className="px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 transition-opacity"
      >
        {status === 'loading' ? 'Checking...' : 'Check Health'}
      </button>

      {status === 'ok' && data && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <p>Status: {data.status}</p>
          <p>Timestamp: {data.timestamp}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
