'use client';

import Link from 'next/link';
import { MessageSquare, BarChart3, Users, Zap, Shield, Globe, Check, ArrowRight, Sparkles, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Kuwex AI</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="#pricing" className="hidden sm:inline text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
          <Link href="/dashboard" className="px-4 sm:px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs sm:text-sm font-medium">Live &amp; Processing Messages</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
          Turn WhatsApp Into Your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Smartest Salesperson</span>
        </h1>
        <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
          AI-powered sales automation for African businesses. Every message answered instantly,
          every lead qualified automatically, every conversation driving revenue — 24/7.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Link href="/dashboard/demo" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-base sm:text-lg transition-colors shadow-lg shadow-green-500/25 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> Try Live Demo
          </Link>
          <a href="#pricing" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-base sm:text-lg transition-colors border border-white/20 flex items-center justify-center gap-2">
            View Pricing <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-12 sm:mt-20 max-w-4xl mx-auto">
          {[
            { label: 'Response Time', value: '<3s', icon: Clock },
            { label: 'Availability', value: '24/7', icon: Zap },
            { label: 'Languages', value: '50+', icon: Globe },
            { label: 'Cost Reduction', value: '80%', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
              <stat.icon className="w-5 h-5 text-green-400 mb-2 mx-auto sm:mx-0" />
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{stat.value}</div>
              <div className="text-gray-400 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-green-600 text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3 sm:mb-4">Three Steps to Revenue Automation</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">Transform your WhatsApp into a revenue machine that works while you sleep</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
            {[
              { step: '01', title: 'Customer Messages You', desc: 'A prospect sends a WhatsApp message to your business number. Our AI picks it up instantly — no waiting, no missed leads.', color: 'from-blue-500 to-blue-600' },
              { step: '02', title: 'AI Understands & Responds', desc: 'Intent detection classifies the message (pricing, booking, support, sales). A tailored AI response is crafted in your brand voice.', color: 'from-green-500 to-green-600' },
              { step: '03', title: 'Convert or Escalate', desc: 'The AI guides prospects toward purchase or booking. Complex queries are seamlessly handed to your human team with full context.', color: 'from-purple-500 to-purple-600' },
            ].map((item) => (
              <div key={item.step} className="relative p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm mb-4 group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Zap, title: 'Instant Responses', desc: 'Sub-3-second reply time. Never lose a lead to slow response.' },
              { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track intents, conversions, and escalations from a live dashboard.' },
              { icon: Users, title: 'Multi-Tenant SaaS', desc: 'Manage multiple businesses from one platform. Scale without limits.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'End-to-end encryption via WhatsApp. Secure data storage on Turso edge DB.' },
              { icon: Globe, title: 'Built for Africa', desc: 'Optimized for African markets. Low bandwidth, high reliability.' },
              { icon: MessageSquare, title: 'Smart Escalation', desc: 'AI knows when to hand off. Your team gets full conversation context.' },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 p-5 sm:p-6 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-green-600 text-sm font-semibold uppercase tracking-wider">Pricing</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3 sm:mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">Choose the plan that fits your business. Scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Starter</h3>
                <p className="text-sm text-gray-500 mt-1">Perfect for small businesses getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$49</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '1 WhatsApp Business Number',
                  'Up to 500 messages/month',
                  'AI Sales Agent (24/7)',
                  'Intent Detection',
                  'Basic Analytics Dashboard',
                  'Email Support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block w-full text-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors">
                Get Started
              </Link>
            </div>

            {/* Growth — Featured */}
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Most Popular</div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Growth</h3>
                <p className="text-sm text-gray-400 mt-1">For growing businesses scaling their sales</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-white">$149</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 3 WhatsApp Numbers',
                  'Up to 3,000 messages/month',
                  'AI Sales Agent (24/7)',
                  'Advanced Intent Detection',
                  'Full Analytics & Reports',
                  'Smart Escalation System',
                  'Custom Brand Voice',
                  'Priority Support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block w-full text-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-green-500/25">
                Get Started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Enterprise</h3>
                <p className="text-sm text-gray-500 mt-1">For agencies & large operations</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$399</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited WhatsApp Numbers',
                  'Unlimited messages',
                  'AI Sales Agent (24/7)',
                  'White-label Dashboard',
                  'API Access',
                  'Custom AI Training',
                  'Dedicated Account Manager',
                  'SLA & Uptime Guarantee',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block w-full text-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Revenue Model Note for Investors */}
          <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Model</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">SaaS</div>
                  <p className="text-xs text-gray-500 mt-1">Monthly recurring subscriptions from businesses</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">Usage</div>
                  <p className="text-xs text-gray-500 mt-1">Per-message fees above plan limits</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">Setup</div>
                  <p className="text-xs text-gray-500 mt-1">One-time onboarding & custom AI training fees</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">85%</div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Gross Margin</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">$0.02</div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cost/Message</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">2.1B</div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">WhatsApp Users</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">$1.2T</div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Africa SME Market</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Automate Your Sales?
          </h2>
          <p className="text-green-100 text-sm sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Join the businesses already using AI to close deals on WhatsApp — the channel your customers already love.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/demo" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-green-700 rounded-xl font-semibold text-base sm:text-lg hover:bg-green-50 transition-colors shadow-lg flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Try Live Demo
            </Link>
            <Link href="/dashboard" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/20 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Kuwex AI</span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">&copy; {new Date().getFullYear()} Kuwex Studios. Built in Zimbabwe, for Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
