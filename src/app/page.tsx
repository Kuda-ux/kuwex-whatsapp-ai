'use client';

import Link from 'next/link';
import { MessageSquare, BarChart3, Users, Zap, Shield, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Kuwex AI</span>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          Open Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Live &amp; Processing Messages</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Turn WhatsApp Into Your
          <br />
          <span className="text-green-400">Smartest Salesperson</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          AI-powered sales automation for African businesses. Every message answered instantly,
          every lead qualified automatically, every conversation driving revenue — 24/7.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-green-500/25"
          >
            View Live Dashboard
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-lg transition-colors border border-white/20"
          >
            How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { label: 'Response Time', value: '<3s' },
            { label: 'Availability', value: '24/7' },
            { label: 'Languages', value: '50+' },
            { label: 'Cost Reduction', value: '80%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16">
            Three simple steps to transform your WhatsApp into a revenue machine
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                step: '01',
                title: 'Customer Messages You',
                desc: 'A prospect sends a WhatsApp message to your business number. Our AI picks it up instantly — no waiting, no missed leads.',
              },
              {
                step: '02',
                title: 'AI Understands & Responds',
                desc: 'Intent detection classifies the message (pricing, booking, support, sales). A tailored AI response is crafted in your brand voice.',
              },
              {
                step: '03',
                title: 'Convert or Escalate',
                desc: 'The AI guides prospects toward purchase or booking. Complex queries are seamlessly handed to your human team with full context.',
              },
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
                <div className="text-6xl font-bold text-green-100 absolute top-4 right-6">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 relative">{item.title}</h3>
                <p className="text-gray-500 relative">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Responses', desc: 'Sub-3-second reply time. Never lose a lead to slow response.' },
              { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track intents, conversions, and escalations from a live dashboard.' },
              { icon: Users, title: 'Multi-Tenant SaaS', desc: 'Manage multiple businesses from one platform. Scale without limits.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'End-to-end encryption via WhatsApp. Row-level security on all data.' },
              { icon: Globe, title: 'Built for Africa', desc: 'Optimized for African markets. Low bandwidth, high reliability.' },
              { icon: MessageSquare, title: 'Smart Escalation', desc: 'AI knows when to hand off. Your team gets full conversation context.' },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 p-6 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Dominate Zimbabwe&apos;s Digital Market?
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Join the businesses already using AI to close deals on WhatsApp — the channel your customers already love.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-green-700 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Kuwex Studios. Built in Zimbabwe, for Africa.</p>
      </footer>
    </div>
  );
}
