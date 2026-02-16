'use client';

import { useEffect, useState } from 'react';
import { Users, MessageSquare, TrendingUp, AlertTriangle, ArrowUpRight, Wifi, Database, Bot, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
    { label: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', change: '+12%' },
    { label: 'Total Messages', value: stats?.totalMessages ?? 0, icon: MessageSquare, gradient: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600', change: '+24%' },
    { label: 'Messages Today', value: stats?.messagesToday ?? 0, icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600', change: '' },
    { label: 'Escalations', value: stats?.pendingEscalations ?? 0, icon: AlertTriangle, gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600', change: '' },
  ];

  const intentColors: Record<string, { bg: string; bar: string }> = {
    sales: { bg: 'bg-green-100', bar: 'bg-green-500' },
    pricing: { bg: 'bg-blue-100', bar: 'bg-blue-500' },
    booking: { bg: 'bg-purple-100', bar: 'bg-purple-500' },
    support: { bg: 'bg-yellow-100', bar: 'bg-yellow-500' },
    human_escalation: { bg: 'bg-red-100', bar: 'bg-red-500' },
  };

  const totalIntents = Object.values(stats?.intentBreakdown ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-green-900 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm sm:text-base">Here&apos;s what&apos;s happening with your AI sales agent today.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link href="/dashboard/demo" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Sparkles className="w-4 h-4" /> Try Live Demo
            </Link>
            <a href="/api/webhook/whatsapp?debug=1" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
              System Health
            </a>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {cards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">{card.label}</span>
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <card.icon className={`w-5 h-5 ${card.text}`} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
                {card.change && (
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">{card.change}</span>
                    <span className="text-xs text-gray-400">vs last week</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Intent Breakdown — wider */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Intent Distribution</h3>
                  <p className="text-xs text-gray-400 mt-0.5">How customers are engaging with the AI</p>
                </div>
                {totalIntents > 0 && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">{totalIntents} total</span>
                )}
              </div>
              {totalIntents === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Zap className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No intents detected yet</p>
                  <p className="text-xs mt-1">Try the <Link href="/dashboard/demo" className="text-green-500 underline">Live Demo</Link> to generate data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats?.intentBreakdown ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([intent, count]) => {
                      const pct = Math.round((count / totalIntents) * 100);
                      const colors = intentColors[intent] || { bg: 'bg-gray-100', bar: 'bg-gray-400' };
                      return (
                        <div key={intent}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${colors.bar}`} />
                              <span className="text-sm font-medium text-gray-700 capitalize">{intent.replace('_', ' ')}</span>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${colors.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* System Status — narrower */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">System Status</h3>
              <p className="text-xs text-gray-400 mb-5">All services operational</p>
              <div className="space-y-3">
                {[
                  { label: 'WhatsApp Webhook', status: 'Active', icon: Wifi, ok: true },
                  { label: 'AI Engine', status: 'Connected', icon: Bot, ok: true },
                  { label: 'Database (Turso)', status: 'Online', icon: Database, ok: true },
                  { label: 'Auto-Response', status: 'Enabled', icon: Zap, ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                      <item.icon className={`w-4 h-4 ${item.ok ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700 block">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-xs font-medium ${item.ok ? 'text-green-600' : 'text-red-600'}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard/clients" className="text-center px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-medium text-gray-600 transition-colors">
                    Manage Clients
                  </Link>
                  <Link href="/dashboard/analytics" className="text-center px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-medium text-gray-600 transition-colors">
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
