'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Users, BarChart3, ArrowLeft, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/demo', label: 'Live Demo', icon: Sparkles },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Kuwex AI</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Dashboard</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
