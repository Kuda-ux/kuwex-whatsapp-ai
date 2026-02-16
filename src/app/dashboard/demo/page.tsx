'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Bot, User, Zap, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  confidence?: number;
  tokensUsed?: number;
  timestamp: Date;
}

interface Client {
  id: string;
  business_name: string;
  is_active: boolean;
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionPhone, setSessionPhone] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientName, setClientName] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadClients = useCallback(() => {
    fetch('/api/dashboard/clients')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data.filter((c: Client) => c.is_active));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          clientId: selectedClient || undefined,
          sessionPhone: sessionPhone || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.sessionPhone) setSessionPhone(data.sessionPhone);
        if (data.clientName) setClientName(data.clientName);

        const aiMsg: Message = {
          id: 'a-' + Date.now(),
          role: 'assistant',
          text: data.reply,
          intent: data.intent,
          confidence: data.confidence,
          tokensUsed: data.tokensUsed,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errMsg: Message = {
          id: 'e-' + Date.now(),
          role: 'assistant',
          text: data.error || 'Something went wrong. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'e-' + Date.now(),
          role: 'assistant',
          text: 'Network error. Please check your connection.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSessionPhone('');
    setClientName('');
  };

  const suggestedMessages = [
    'Hi, what services do you offer?',
    'How much does it cost?',
    'I want to book an appointment',
    'I need help with my order',
    'Can I speak to a real person?',
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live AI Demo</h1>
          <p className="text-gray-500 mt-1">
            Test the AI sales agent in real-time
            {clientName && <span> &mdash; responding as <strong className="text-green-600">{clientName}</strong></span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 1 && (
            <select
              value={selectedClient}
              onChange={(e) => { setSelectedClient(e.target.value); resetChat(); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Auto (first active)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.business_name}</option>
              ))}
            </select>
          )}
          <button onClick={resetChat}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> New Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 flex flex-col h-[calc(100vh-14rem)]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-green-500 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{clientName || 'AI Sales Agent'}</h3>
                <p className="text-xs text-green-100">
                  {sending ? 'Typing...' : 'Online'}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-full">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">AI Powered</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f0f2f5]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium mb-1">Start a conversation</p>
                <p className="text-xs text-center max-w-xs">Type a message below or click a suggestion to see the AI sales agent in action</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${msg.role === 'user' ? '' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-green-500 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center justify-between mt-1.5 gap-3 ${
                      msg.role === 'user' ? 'text-green-100' : 'text-gray-400'
                    }`}>
                      <span className="text-[10px]">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.intent && (
                        <span className="text-[10px] flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          {msg.intent.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {msg.role === 'assistant' && msg.tokensUsed !== undefined && msg.tokensUsed > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 ml-2">{msg.tokensUsed} tokens</p>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex flex-wrap gap-2">
                {suggestedMessages.map((s) => (
                  <button key={s} onClick={() => { setInput(s); }}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              />
              <button type="submit" disabled={sending || !input.trim()}
                className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              How It Works
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p>Customer sends a WhatsApp message to the business number</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p>AI detects intent (sales, pricing, booking, support, or escalation)</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p>AI generates a personalized response using the business context</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <p>Response is sent back via WhatsApp automatically</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Try These Scenarios</h3>
            <div className="space-y-2">
              {[
                { label: 'Sales Inquiry', example: 'Hi, I\'m interested in your services', color: 'bg-green-100 text-green-700' },
                { label: 'Pricing', example: 'How much do you charge?', color: 'bg-blue-100 text-blue-700' },
                { label: 'Booking', example: 'I want to book an appointment for tomorrow', color: 'bg-purple-100 text-purple-700' },
                { label: 'Support', example: 'I have a problem with my order', color: 'bg-yellow-100 text-yellow-700' },
                { label: 'Escalation', example: 'I want to speak to a human please', color: 'bg-red-100 text-red-700' },
              ].map((s) => (
                <button key={s.label} onClick={() => setInput(s.example)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                    <User className="w-3 h-3 text-gray-300 group-hover:text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">{s.example}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-2">Presentation Mode</h3>
            <p className="text-sm text-green-100 leading-relaxed">
              This demo uses the <strong>exact same AI pipeline</strong> that powers the WhatsApp integration. Every message is processed through intent detection, context building, and AI generation in real-time.
            </p>
            <p className="text-xs text-green-200 mt-3">
              Messages are stored in the database and visible in the Conversations and Analytics pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
