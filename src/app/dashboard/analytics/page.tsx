'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Target, AlertTriangle, Activity } from 'lucide-react';

interface AnalyticsData {
  dailyMessages: { date: string; incoming: number; outgoing: number }[];
  intentDistribution: { name: string; value: number }[];
  escalations: { id: string; phone_number: string; reason: string; status: string; created_at: string }[];
  responseRate: number;
}

const INTENT_COLORS: Record<string, string> = {
  sales: '#22c55e',
  pricing: '#3b82f6',
  booking: '#a855f7',
  support: '#eab308',
  human_escalation: '#ef4444',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-14" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalIncoming = data?.dailyMessages.reduce((s, d) => s + d.incoming, 0) || 0;
  const totalOutgoing = data?.dailyMessages.reduce((s, d) => s + d.outgoing, 0) || 0;
  const totalIntents = data?.intentDistribution.reduce((s, d) => s + d.value, 0) || 0;
  const maxDaily = Math.max(...(data?.dailyMessages.map((d) => d.incoming + d.outgoing) || [1]));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Performance insights for the last 14 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Incoming', value: totalIncoming, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'AI Responses', value: totalOutgoing, icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Response Rate', value: `${data?.responseRate || 0}%`, icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Escalations', value: data?.escalations.length || 0, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Message Volume */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Daily Message Volume</h3>
          <p className="text-xs text-gray-400 mb-5">Messages processed per day</p>
          {(data?.dailyMessages.length || 0) === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No message data yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data?.dailyMessages.slice(-10).map((day) => {
                const total = day.incoming + day.outgoing;
                return (
                  <div key={day.date} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-xs text-gray-400 w-14 sm:w-20 flex-shrink-0">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 flex items-center gap-0.5 h-7 sm:h-8">
                      <div className="h-full bg-blue-400 rounded-l-md transition-all duration-500"
                        style={{ width: `${maxDaily > 0 ? (day.incoming / maxDaily) * 100 : 0}%`, minWidth: day.incoming > 0 ? '4px' : '0' }}
                        title={`${day.incoming} incoming`} />
                      <div className="h-full bg-green-400 rounded-r-md transition-all duration-500"
                        style={{ width: `${maxDaily > 0 ? (day.outgoing / maxDaily) * 100 : 0}%`, minWidth: day.outgoing > 0 ? '4px' : '0' }}
                        title={`${day.outgoing} outgoing`} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right font-medium">{total}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-xs text-gray-500">Incoming</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-500">AI Responses</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Intent Distribution */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Intent Distribution</h3>
          <p className="text-xs text-gray-400 mb-5">What customers are asking about</p>
          {totalIntents === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No intents detected yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.intentDistribution
                .sort((a, b) => b.value - a.value)
                .map((item) => {
                  const pct = Math.round((item.value / totalIntents) * 100);
                  const color = INTENT_COLORS[item.name] || '#9ca3af';
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.name.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">{item.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Escalations */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Escalations</h3>
          <p className="text-xs text-gray-400 mt-0.5">Conversations handed to human agents</p>
        </div>
        {(data?.escalations.length || 0) === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No escalations yet</p>
            <p className="text-xs mt-1">When customers request a human agent, they&apos;ll appear here</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-gray-50">
              {data?.escalations.map((esc) => (
                <div key={esc.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{esc.phone_number}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      esc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      esc.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{esc.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{esc.reason}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(esc.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Phone</th>
                    <th className="px-6 py-3 font-semibold">Reason</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.escalations.map((esc) => (
                    <tr key={esc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{esc.phone_number}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-500">{esc.reason}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          esc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          esc.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{esc.status}</span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-400">{new Date(esc.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
