# Client Onboarding Guide — Kuwex WhatsApp AI

This guide walks through every stage of getting a new business client live on the Kuwex WhatsApp AI platform.

---

## Overview: What Happens End-to-End

```
1. You deploy the platform (once)        → Vercel + Supabase
2. Client gives you their WhatsApp info   → Phone Number ID + Access Token
3. You add them as a client in the DB     → Dashboard or SQL
4. Meta webhook routes messages to you    → Already configured
5. AI responds to their customers         → Automatic, 24/7
```

---

## STAGE 1: Platform Setup (One-Time — Already Done)

You only do this once. It powers ALL clients.

### 1.1 Supabase Database
1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Go to **Settings > API** → copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 OpenRouter AI
1. Go to [openrouter.ai](https://openrouter.ai) → Sign up
2. Go to **Keys** → Create a new key
3. Copy the key → `OPENROUTER_API_KEY`
4. The free model `meta-llama/llama-3.1-8b-instruct:free` is already configured

### 1.3 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo (`Kuda-ux/kuwex-whatsapp-ai`)
2. Add all environment variables from `.env.example`
3. Deploy — you'll get a URL like `https://kuwex-whatsapp-ai.vercel.app`
4. This URL is your **webhook URL** for Meta

### 1.4 Meta App (Your Platform App)
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Your existing app: **Kuwex Studios** (App ID: 850608871061827)
3. Under **WhatsApp > Configuration**:
   - Webhook URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook/whatsapp`
   - Verify Token: `kuwex-wa-verify-2024`
   - Subscribe to: `messages`

---

## STAGE 2: Onboarding a New Client (Kuwex / Demo)

This is what you do for each new business, including your own demo.

### 2.1 Get the Client's WhatsApp Business Info

The client needs a **WhatsApp Business Account** connected to Meta. They provide:

| What | Where to Find It |
|------|-----------------|
| **Phone Number ID** | Meta Developer Console → WhatsApp → API Setup |
| **Access Token** | Meta Developer Console → WhatsApp → API Setup → Generate Token |
| **Business Name** | The name customers will see |
| **Services Description** | What the business offers (pricing, services, etc.) |
| **Brand Tone** | e.g., "professional and friendly", "casual and fun" |
| **Escalation Email** | Where to send escalation alerts |
| **Escalation WhatsApp** | Human agent's WhatsApp number |

### 2.2 For YOUR Demo (Kuwex Studios)

You already have these from your Meta Developer Console:

```
Business Name:           Kuwex Studios
Phone Number ID:         977956835404682
Access Token:            (your existing WhatsApp token)
Services Description:    "We offer web development, mobile apps, digital marketing, 
                          AI automation, and WhatsApp business solutions for African SMEs."
Brand Tone:              "professional, innovative, and friendly"
Escalation Email:        admin@kuwex.co.zw
```

### 2.3 Add the Client to the Database

**Option A: Via the Dashboard**
1. Go to `https://YOUR-VERCEL-URL.vercel.app/dashboard/clients`
2. Click **"Add Client"**
3. Fill in all fields → Click **"Create Client"**

**Option B: Via Supabase SQL Editor**
```sql
INSERT INTO clients (
  business_name,
  whatsapp_phone_number_id,
  whatsapp_access_token,
  services_description,
  brand_tone,
  escalation_email
) VALUES (
  'Kuwex Studios',
  '977956835404682',
  'YOUR_WHATSAPP_ACCESS_TOKEN_HERE',
  'We offer web development, mobile apps, digital marketing, AI automation, and WhatsApp business solutions for African SMEs.',
  'professional, innovative, and friendly',
  'admin@kuwex.co.zw'
);
```

### 2.4 Test It

1. Send a WhatsApp message to your business number
2. The AI should respond within 3 seconds
3. Check the dashboard — you should see the conversation appear

---

## STAGE 3: Adding MORE Clients (Multi-Tenant)

The platform is **multi-tenant by design**. Each client is identified by their `whatsapp_phone_number_id`.

### How It Works
- When a WhatsApp message arrives, the webhook receives the `phone_number_id` of the business that was messaged
- The system looks up which client owns that `phone_number_id`
- It uses **that client's** access token, brand tone, and services to generate the AI response
- All data is isolated per client

### To Add a New Client
1. The new client creates a WhatsApp Business Account on Meta
2. They share their Phone Number ID and Access Token with you
3. You add them via the dashboard or SQL (same as Stage 2)
4. **That's it** — messages to their number are now handled by AI

### Important: Webhook Routing
All clients share the **same webhook URL**. Meta routes messages based on which business number was messaged. Your system automatically identifies the correct client.

If the client has their own Meta App:
1. They set their webhook URL to your Vercel URL
2. They use the same verify token
3. Subscribe to `messages`

If you manage their Meta App for them:
1. Add their phone number to your existing Meta App
2. The webhook is already configured — it just works

---

## STAGE 4: Going Live Checklist

Before presenting to investors or going live with a client:

### Technical Checklist
- [ ] Supabase project created and schema deployed
- [ ] Vercel deployment live and accessible
- [ ] Environment variables all set in Vercel
- [ ] Meta webhook verified (green checkmark in Meta Console)
- [ ] OpenRouter API key working (test with a message)
- [ ] At least one client added to the database
- [ ] Test message sent and AI responded correctly

### Demo Checklist
- [ ] Landing page loads at your Vercel URL
- [ ] Dashboard shows real data (or seed data)
- [ ] Can show a live WhatsApp conversation with AI responding
- [ ] Can show the conversation appearing in the dashboard in real-time
- [ ] Can show intent detection working (try "how much does it cost?" for pricing)
- [ ] Can show escalation working (type "I want to speak to a human")

### Investor Demo Script
1. **Open the landing page** — show the professional product
2. **Open the dashboard** — show the analytics and system status
3. **Send a live WhatsApp message** — "Hi, I'm interested in your services"
4. **Show the AI response** arriving in <3 seconds
5. **Show the conversation** appearing in the dashboard
6. **Send a pricing question** — "How much do your services cost?"
7. **Show intent detection** — it should classify as "pricing"
8. **Type "I want to speak to a human"** — show escalation working
9. **Open the analytics page** — show intent distribution updating
10. **Explain multi-tenant** — "We can onboard any business in 5 minutes"

---

## STAGE 5: Scaling to More Clients

### Pricing Model Suggestions
| Tier | Monthly Price (USD) | Features |
|------|-------------------|----------|
| Starter | $29 | 500 AI messages/month, 1 phone number |
| Growth | $79 | 2,000 AI messages/month, 3 phone numbers, analytics |
| Enterprise | $199 | Unlimited messages, unlimited numbers, priority support |

### Revenue Projections
- 10 clients × $79/month = **$790/month**
- 50 clients × $79/month = **$3,950/month**
- 100 clients × $79/month = **$7,900/month**

### Cost Structure
- Vercel hosting: **Free** (hobby) or **$20/month** (pro)
- Supabase: **Free** (up to 500MB) or **$25/month** (pro)
- OpenRouter: **Free** (Llama 3.1) or **$0.001/message** (GPT-4)
- WhatsApp API: **Free** (first 1,000 conversations/month per number)

**Gross margin: ~90%+** at scale.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Webhook not verifying | Check verify token matches, URL is HTTPS, Vercel is deployed |
| AI not responding | Check OpenRouter API key, check Supabase client exists for that phone_number_id |
| Messages not appearing in dashboard | Check Supabase connection, check RLS policies |
| "supabaseUrl is required" error | Environment variables not set in Vercel |
| Slow responses | Free OpenRouter model can be slow; upgrade to paid model for <1s |
