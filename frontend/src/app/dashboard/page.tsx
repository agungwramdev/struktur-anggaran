'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import { FiDollarSign, FiTrendingUp, FiBarChart2, FiUsers } from 'react-icons/fi';

interface Statistics {
  totalSatker: number;
  totalBelanja: number;
  totalBelanjaOperasi: number;
  totalBelanjaModal: number;
  totalBelanjaBTT: number;
  totalBelanjaPengadaan: number;
  totalBelanjaNonPengadaan: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📊 Dashboard: useEffect triggered');
    console.log('📊 Dashboard: Auth state:', {
      authLoading,
      hasUser: !!user,
      selectedYear
    });

    // Only fetch statistics when user is authenticated and not loading
    if (!authLoading && user) {
      console.log('📊 Dashboard: User authenticated, fetching statistics');
      fetchStatistics();
    } else if (!authLoading && !user) {
      console.log('📊 Dashboard: No user, waiting for redirect');
      setLoading(false);
    } else {
      console.log('📊 Dashboard: Auth still loading, waiting...');
    }
  }, [selectedYear, user, authLoading]);

  const fetchStatistics = async () => {
    try {
      console.log('📊 Dashboard: Fetching statistics...');
      setLoading(true);
      const response = await api.get(`/struktur-anggaran/statistics?tahun=${selectedYear}`);
      console.log('📊 Dashboard: Statistics fetched successfully');
      setStatistics(response.data);
    } catch (error) {
      console.error('📊 Dashboard: Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Ringkasan Struktur Anggaran
              </p>
            </div>
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input w-40"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Satker"
                  value={statistics?.totalSatker || 0}
                  icon={FiUsers}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Total Belanja"
                  value={formatCurrency(statistics?.totalBelanja || 0)}
                  icon={FiDollarSign}
                  color="bg-green-500"
                />
                <StatCard
                  title="Belanja Operasi"
                  value={formatCurrency(statistics?.totalBelanjaOperasi || 0)}
                  icon={FiTrendingUp}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Belanja Modal"
                  value={formatCurrency(statistics?.totalBelanjaModal || 0)}
                  icon={FiBarChart2}
                  color="bg-orange-500"
                />
              </div>

              {/* Detail Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Belanja BTT
                  </h3>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(statistics?.totalBelanjaBTT || 0)}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Belanja Pengadaan
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(statistics?.totalBelanjaPengadaan || 0)}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Belanja Non-Pengadaan
                  </h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(statistics?.totalBelanjaNonPengadaan || 0)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
