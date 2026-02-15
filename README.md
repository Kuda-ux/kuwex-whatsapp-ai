# Kuwex WhatsApp AI Sales Automation

**AI-powered WhatsApp sales automation for African businesses.**
Turn every WhatsApp conversation into revenue — automatically, 24/7.

---

## The Problem

African SMEs lose **60%+ of leads** because they can't respond to WhatsApp messages fast enough. Customers expect instant replies, but hiring 24/7 sales teams is expensive and unscalable.

## Our Solution

Kuwex AI is a **multi-tenant SaaS platform** that plugs into any business's WhatsApp number and handles:

- **Instant AI responses** (<3 seconds) in the business's brand voice
- **Intent detection** — automatically classifies pricing, booking, support, and sales queries
- **Smart escalation** — hands complex conversations to humans with full context
- **Real-time analytics** — track every conversation, intent, and conversion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | Supabase (PostgreSQL with Row-Level Security) |
| **AI Engine** | OpenRouter (Llama 3.1 8B — free tier) |
| **Messaging** | WhatsApp Business Cloud API |
| **Hosting** | Vercel (auto-scaling, global CDN) |

## Architecture

```
WhatsApp User
      |
      v
Meta Cloud API  --->  Vercel API Route (/api/webhook/whatsapp)
                            |
                      [Extract Message]
                            |
                      [Lookup Client] <---> Supabase
                            |
                      [Upsert Customer] <---> Supabase
                            |
                      [Detect Intent]
                            |
                      [Build AI Prompt]
                            |
                      [OpenRouter AI] <---> Llama 3.1
                            |
                      [Store + Send Reply] <---> WhatsApp API
```

## Features

### For Businesses (Clients)
- Plug-and-play WhatsApp AI — connect in minutes
- Custom brand tone and service descriptions
- Automatic lead qualification and follow-up
- Human escalation with full conversation context
- Multi-language support

### For Platform Operators
- Multi-tenant architecture — onboard unlimited businesses
- Real-time dashboard with analytics
- Intent tracking and optimization
- Escalation management
- Client management portal

### Dashboard Pages
- **Overview** — KPIs, intent breakdown, system status
- **Conversations** — Real-time chat viewer with search
- **Clients** — Manage connected businesses
- **Analytics** — Message volume, intent distribution, escalation tracking

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- An [OpenRouter](https://openrouter.ai) API key (free models available)
- A [Meta Developer](https://developers.facebook.com) account with WhatsApp Business API access

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/kuwex-whatsapp-ai.git
cd kuwex-whatsapp-ai
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and keys from **Settings > API**

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WHATSAPP_VERIFY_TOKEN=kuwex-wa-verify-2024
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Add Your First Client

Insert a client row into Supabase (or use the dashboard):

```sql
INSERT INTO clients (business_name, whatsapp_phone_number_id, whatsapp_access_token, services_description)
VALUES (
  'Your Business Name',
  'YOUR_PHONE_NUMBER_ID',
  'YOUR_WHATSAPP_ACCESS_TOKEN',
  'Describe your services here...'
);
```

### 5. Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 6. Configure Meta Webhook

1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Navigate to your app > WhatsApp > Configuration
3. Set webhook URL to: `https://your-app.vercel.app/api/webhook/whatsapp`
4. Set verify token to: `kuwex-wa-verify-2024`
5. Subscribe to `messages` webhook field

### 7. Test It

Send a WhatsApp message to your business number. The AI will respond automatically!

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the dashboard.

## Project Structure

```
kuwex-whatsapp-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── api/
│   │   │   ├── webhook/whatsapp/       # WhatsApp webhook (GET verify + POST messages)
│   │   │   └── dashboard/             # Dashboard API routes
│   │   │       ├── stats/             # KPI stats
│   │   │       ├── conversations/     # Conversation data
│   │   │       ├── clients/           # Client CRUD
│   │   │       └── analytics/         # Analytics data
│   │   └── dashboard/
│   │       ├── page.tsx               # Overview
│   │       ├── layout.tsx             # Dashboard layout + sidebar
│   │       ├── conversations/         # Chat viewer
│   │       ├── clients/               # Client management
│   │       └── analytics/             # Analytics charts
│   └── lib/
│       ├── supabase.ts                # Supabase client (browser + server)
│       ├── pipeline.ts                # Full message processing pipeline
│       ├── openrouter.ts              # AI chat completion + prompt builder
│       ├── whatsapp.ts                # WhatsApp send + extract utilities
│       ├── intent.ts                  # Keyword-based intent detection
│       └── utils.ts                   # Tailwind merge utility
├── supabase/
│   └── schema.sql                     # Full database schema
├── .env.example                       # Environment variable template
└── package.json
```

## Market Opportunity

- **2.7 billion** WhatsApp users globally
- **Africa's fastest-growing messaging platform** with 300M+ users
- **Zimbabwe**: WhatsApp is the #1 business communication channel
- SMEs spend **$500-2000/month** on manual customer service
- Our AI replaces that at a fraction of the cost

## Roadmap

- [x] Core AI sales pipeline
- [x] Multi-tenant architecture
- [x] Real-time dashboard
- [x] Intent detection & analytics
- [x] Human escalation system
- [ ] Payment integration (Paynow, EcoCash)
- [ ] Appointment booking system
- [ ] Multi-language AI (Shona, Ndebele)
- [ ] WhatsApp catalog integration
- [ ] CRM integrations (HubSpot, Salesforce)
- [ ] Voice message transcription
- [ ] Team collaboration features

## License

Proprietary — Kuwex Studios. All rights reserved.

---

**Built in Zimbabwe, for Africa.**
