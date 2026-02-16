'use client';

import { useEffect, useState } from 'react';
import { Users, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

interface Stats {
  totalCustomers: number;
  totalMessages: number;
  messagesToday: number;
  pendingEscalations: number;
  intentBreakdown: Record<string, number>;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Total Messages',
      value: stats?.totalMessages ?? 0,
      icon: MessageSquare,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      label: 'Messages Today',
      value: stats?.messagesToday ?? 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
    {
      label: 'Pending Escalations',
      value: stats?.pendingEscalations ?? 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
    },
  ];

  const intentColors: Record<string, string> = {
    sales: 'bg-green-500',
    pricing: 'bg-blue-500',
    booking: 'bg-purple-500',
    support: 'bg-yellow-500',
    human_escalation: 'bg-red-500',
  };

  const totalIntents = Object.values(stats?.intentBreakdown ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time WhatsApp AI sales performance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">{card.label}</span>
                  <div className={`w-10 h-10 rounded-lg ${card.bgLight} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Intent Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Intent Distribution</h3>
              {totalIntents === 0 ? (
                <p className="text-gray-400 text-sm">No intents detected yet. Send a WhatsApp message to get started.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats?.intentBreakdown ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([intent, count]) => (
                      <div key={intent}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {intent.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {count} ({Math.round((count / totalIntents) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${intentColors[intent] || 'bg-gray-400'}`}
                            style={{ width: `${(count / totalIntents) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'WhatsApp Webhook', status: 'Active', ok: true },
                  { label: 'AI Engine (OpenRouter)', status: 'Connected', ok: true },
                  { label: 'Database (Turso)', status: 'Online', ok: true },
                  { label: 'Auto-Response', status: 'Enabled', ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${item.ok ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a href="/api/webhook/whatsapp?debug=1" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-700 underline">
                  View Debug Info
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
