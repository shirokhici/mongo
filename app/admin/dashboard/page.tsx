'use client';

import { useEffect, useState } from 'react';
import { 
  Settings, 
  BarChart3, 
  Users, 
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalConfigs: number;
  totalInstalls: number;
  todayInstalls: number;
  activeConfigs: number;
  recentInstalls: Array<{
    _id: string;
    device_id: string;
    referrer: string;
    installed_at: string;
    user_agent?: string;
  }>;
  topReferrers: Array<{
    _id: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [configsRes, installsRes] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/installs?limit=5')
      ]);

      const [configsData, installsData] = await Promise.all([
        configsRes.json(),
        installsRes.json()
      ]);

      // Calculate stats
      const totalConfigs = configsData.configs?.length || 0;
      const totalInstalls = installsData.total || 0;
      const recentInstalls = installsData.installs || [];
      
      // Calculate today's installs
      const today = new Date().toISOString().split('T')[0];
      const todayInstalls = recentInstalls.filter((install: any) => 
        install.installed_at.startsWith(today)
      ).length;

      // Calculate top referrers
      const referrerCounts: { [key: string]: number } = {};
      recentInstalls.forEach((install: any) => {
        referrerCounts[install.referrer] = (referrerCounts[install.referrer] || 0) + 1;
      });
      
      const topReferrers = Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ _id: referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalConfigs,
        totalInstalls,
        todayInstalls,
        activeConfigs: totalConfigs, // Assuming all configs are active
        recentInstalls: recentInstalls.slice(0, 5),
        topReferrers
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Configurations',
      value: stats?.totalConfigs || 0,
      icon: Settings,
      color: 'bg-blue-500',
      href: '/admin/configs'
    },
    {
      title: 'Total Installs',
      value: stats?.totalInstalls || 0,
      icon: BarChart3,
      color: 'bg-green-500',
      href: '/admin/installs'
    },
    {
      title: 'Today\'s Installs',
      value: stats?.todayInstalls || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/admin/installs'
    },
    {
      title: 'Active Configs',
      value: stats?.activeConfigs || 0,
      icon: Globe,
      color: 'bg-orange-500',
      href: '/admin/configs'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your Android Browser configurations and installs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Installs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Installs</h2>
              <Link 
                href="/admin/installs"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats?.recentInstalls && stats.recentInstalls.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInstalls.map((install) => (
                  <div key={install._id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {install.device_id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        Referrer: {install.referrer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(install.installed_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(install.installed_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent installs</p>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Referrers</h2>
          </div>
          <div className="p-6">
            {stats?.topReferrers && stats.topReferrers.length > 0 ? (
              <div className="space-y-4">
                {stats.topReferrers.map((referrer, index) => (
                  <div key={referrer._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-indigo-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {referrer._id}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {referrer.count} installs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No referrer data</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/configs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Configs</p>
              <p className="text-sm text-gray-500">Create and edit browser configurations</p>
            </div>
          </Link>
          
          <Link
            href="/admin/installs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Monitor install statistics</p>
            </div>
          </Link>
          
          <button
            onClick={fetchDashboardStats}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Refresh Data</p>
              <p className="text-sm text-gray-500">Update dashboard statistics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}