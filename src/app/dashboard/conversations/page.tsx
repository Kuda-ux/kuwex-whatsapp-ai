'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, User, Bot, AlertTriangle, Search } from 'lucide-react';

interface Customer {
  id: string;
  phone_number: string;
  display_name: string;
  last_message_at: string;
  is_escalated: boolean;
  total_messages: number;
  clients: { business_name: string } | null;
}

interface Message {
  id: string;
  role: string;
  message_text: string;
  detected_intent: string | null;
  created_at: string;
}

export default function ConversationsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/conversations')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadMessages = async (customer: Customer) => {
    setSelected(customer);
    setMessages([]);
    const res = await fetch(`/api/dashboard/conversations?phone=${customer.phone_number}`);
    const data = await res.json();
    if (Array.isArray(data)) setMessages(data);
  };

  const filtered = customers.filter(
    (c) =>
      c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number.includes(search)
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-500 mt-1">View all WhatsApp conversations in real time</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Customer List */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No conversations yet
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadMessages(c)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selected?.id === c.id ? 'bg-green-50 border-l-2 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {c.display_name || c.phone_number}
                    </span>
                    {c.is_escalated && (
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{c.phone_number}</span>
                    <span className="text-xs text-gray-400">{formatTime(c.last_message_at)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {c.total_messages} messages
                    {c.clients ? ` · ${c.clients.business_name}` : ''}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selected.display_name || selected.phone_number}
                  </h3>
                  <p className="text-xs text-gray-400">{selected.phone_number}</p>
                </div>
                {selected.is_escalated && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Escalated
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gray-100 text-gray-900 rounded-bl-md'
                          : 'bg-green-500 text-white rounded-br-md'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.role === 'user' ? (
                          <User className="w-3 h-3 opacity-60" />
                        ) : (
                          <Bot className="w-3 h-3 opacity-60" />
                        )}
                        <span className="text-[10px] opacity-60 uppercase">
                          {msg.role === 'user' ? 'Customer' : 'AI Agent'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] opacity-50">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                        {msg.detected_intent && (
                          <span className="text-[10px] opacity-50 capitalize">
                            {msg.detected_intent.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
