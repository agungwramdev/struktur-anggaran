'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { FiActivity } from 'react-icons/fi';

interface Log {
  _id: string;
  user_id: {
    _id: string;
    username: string;
    nama: string;
    email: string;
  };
  aktifitas: string;
  keterangan: string;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/logs?limit=${limit}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Log Aktivitas
              </h1>
              <p className="text-gray-600 mt-1">Riwayat aktivitas pengguna</p>
            </div>
            <div>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="input w-40"
              >
                <option value={50}>50 terakhir</option>
                <option value={100}>100 terakhir</option>
                <option value={200}>200 terakhir</option>
              </select>
            </div>
          </div>

          {/* Logs List */}
          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Belum ada log aktivitas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <div key={log._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                            {log.user_id?.nama?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {log.user_id?.nama || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{log.user_id?.username || 'unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-13">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {log.aktifitas}
                          </p>
                          {log.keterangan && (
                            <p className="text-sm text-gray-600">
                              {log.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
