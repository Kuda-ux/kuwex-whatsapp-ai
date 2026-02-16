'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Users, BarChart3, ArrowLeft, Sparkles, Menu, X, Bell, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, badge: '' },
  { href: '/dashboard/demo', label: 'Live Demo', icon: Sparkles, badge: 'NEW' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare, badge: '' },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, badge: '' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, badge: '' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navItems.find((item) => item.href === pathname)?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-gray-800/50">
        <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-wide">Kuwex AI</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Sales Platform</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Menu</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-green-500/10 text-green-400 shadow-sm'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? 'bg-green-500/20' : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-gray-500 group-hover:text-white'}`} />
              </div>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500 text-white rounded-md">{item.badge}</span>
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-green-500/50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/10">
        <p className="text-xs text-green-400 font-medium mb-1">WhatsApp Connected</p>
        <p className="text-[10px] text-gray-500 leading-relaxed">AI agent is active and responding to messages 24/7</p>
      </div>

      <div className="px-3 pb-4 border-t border-gray-800/50 pt-3">
        <Link
          href="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-[260px] bg-gray-900 flex-col flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-gray-900 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{currentPage}</h2>
                <p className="text-[11px] text-gray-400 hidden sm:block">Kuwex WhatsApp AI Sales Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold ml-1">
                K
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
