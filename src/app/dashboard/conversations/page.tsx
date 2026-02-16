'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, User, Bot, AlertTriangle, Search, ArrowLeft } from 'lucide-react';

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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-500 text-sm mt-1">View all WhatsApp conversations in real time</p>
      </div>

      <div className="flex gap-4 sm:gap-6 h-[calc(100vh-12rem)]">
        {/* Customer List — hidden on mobile when chat is open */}
        <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 flex-col`}>
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 rounded-xl bg-gray-50">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1">Messages will appear here once customers start chatting</p>
              </div>
            ) : (
              <div className="p-2">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => loadMessages(c)}
                    className={`w-full text-left px-3 py-3 rounded-xl mb-1 transition-all ${
                      selected?.id === c.id
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selected?.id === c.id ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <User className={`w-4 h-4 ${selected?.id === c.id ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {c.display_name || c.phone_number}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatTime(c.last_message_at)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-gray-400 truncate">{c.total_messages} messages{c.clients ? ` · ${c.clients.business_name}` : ''}</span>
                          {c.is_escalated && <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className={`${!selected ? 'hidden md:flex' : 'flex'} flex-1 bg-white rounded-2xl border border-gray-100 flex-col min-w-0`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="text-xs mt-1">Choose a customer from the list to view their messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {selected.display_name || selected.phone_number}
                  </h3>
                  <p className="text-xs text-gray-400">{selected.phone_number}</p>
                </div>
                {selected.is_escalated && (
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
                    Escalated
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                        : 'bg-green-500 text-white rounded-br-md'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.role === 'user' ? (
                          <User className="w-3 h-3 opacity-50" />
                        ) : (
                          <Bot className="w-3 h-3 opacity-60" />
                        )}
                        <span className="text-[10px] opacity-50 uppercase font-medium">
                          {msg.role === 'user' ? 'Customer' : 'AI Agent'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message_text}</p>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span className="text-[10px] opacity-40">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.detected_intent && (
                          <span className="text-[10px] opacity-40 capitalize">{msg.detected_intent.replace('_', ' ')}</span>
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
