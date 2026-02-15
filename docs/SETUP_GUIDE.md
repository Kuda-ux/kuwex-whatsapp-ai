# Complete Setup Guide — Kuwex WhatsApp AI

This guide covers EVERYTHING you need to connect your Vercel deployment to Supabase, OpenRouter AI, and WhatsApp.

---

## 1. Connect Supabase (Your Database)

### 1.1 Create a Supabase Project
1. Go to **https://supabase.com** and sign in (or create an account)
2. Click **"New Project"**
3. Choose your organization, name the project (e.g. `kuwex-whatsapp-ai`)
4. Set a strong database password (save it somewhere safe)
5. Choose a region close to you (e.g. `eu-west-1` for Africa)
6. Click **"Create new project"** — wait ~2 minutes for it to provision

### 1.2 Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` from the GitHub repo:
   **https://github.com/Kuda-ux/kuwex-whatsapp-ai/blob/main/supabase/schema.sql**
4. Copy the ENTIRE contents and paste it into the SQL Editor
5. Click **"Run"** (the green play button)
6. You should see "Success. No rows returned" — this means all tables, functions, and policies were created

### 1.3 Get Your Supabase Keys
1. In Supabase, go to **Settings** (gear icon) → **API**
2. You need THREE values:

| Key | Where to Find | Vercel Env Var |
|-----|--------------|----------------|
| **Project URL** | Under "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | Under "Project API keys" → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Under "Project API keys" → `service_role` `secret` (click "Reveal") | `SUPABASE_SERVICE_ROLE_KEY` |

**Example values (yours will be different):**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Set Up OpenRouter AI (The Brain)

OpenRouter is the AI service that generates intelligent responses to WhatsApp messages. **Yes, it is already implemented in the code** — you just need an API key.

### 2.1 Get Your API Key
1. Go to **https://openrouter.ai** and sign up (Google sign-in works)
2. Click your profile icon → **"Keys"**
3. Click **"Create Key"**
4. Name it `kuwex-whatsapp-ai`
5. Copy the key — it starts with `sk-or-v1-...`

### 2.2 How the AI Works in Your System
The AI pipeline is fully built. Here's what happens when a WhatsApp message arrives:

```
Message arrives → Detect intent (pricing/booking/support/sales/escalation)
                → Load client's brand tone + services description
                → Build a custom AI prompt for that specific business
                → Send to OpenRouter (Llama 3.1 8B — free model)
                → AI generates a response in the client's brand voice
                → Send reply via WhatsApp
                → Store everything in Supabase
```

### 2.3 The AI Model
- **Default model:** `meta-llama/llama-3.1-8b-instruct:free` (completely free, unlimited)
- **Upgrade option:** Change `OPENROUTER_MODEL` to `openai/gpt-4o-mini` ($0.15/1M tokens) for better quality
- The model is set via the `OPENROUTER_MODEL` environment variable

---

## 3. Get WhatsApp Phone Number ID & Access Token

This is the most important part — it connects your WhatsApp Business number to the AI.

### 3.1 Prerequisites
- A Facebook account
- A WhatsApp Business number (can be a new number or existing business number)
- Access to Meta Business Suite

### 3.2 Step-by-Step

#### Step 1: Go to Meta Developer Console
1. Open **https://developers.facebook.com**
2. Log in with the Facebook account that owns the business
3. If you don't have a developer account, click "Get Started" and follow the prompts

#### Step 2: Create or Select Your App
- **If you already have the Kuwex Studios app (ID: 850608871061827):** Select it
- **If creating a new app:**
  1. Click **"Create App"**
  2. Select **"Other"** → **"Business"**
  3. Name it (e.g. "Kuwex WhatsApp AI")
  4. Select your Business Account
  5. Click **"Create App"**

#### Step 3: Add WhatsApp to Your App
1. In the app dashboard, scroll down to **"Add Products to Your App"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. Select your Business Account when prompted

#### Step 4: Get the Phone Number ID
1. In the left sidebar, go to **WhatsApp → API Setup**
2. Under **"From"**, you'll see a dropdown with phone numbers
3. Select your business phone number
4. The **Phone Number ID** is displayed right below the dropdown

```
┌─────────────────────────────────────────────┐
│  From:  [+263 77 123 4567  ▼]               │
│                                             │
│  Phone number ID: 977956835404682           │  ← THIS IS WHAT YOU NEED
│                                             │
│  WhatsApp Business Account ID: 123456789    │
└─────────────────────────────────────────────┘
```

#### Step 5: Generate an Access Token

**Option A: Temporary Token (for testing — expires in 24 hours)**
1. On the same **API Setup** page, you'll see a "Temporary access token" section
2. Click **"Generate"** (you may need to accept permissions)
3. Copy the token

**Option B: Permanent Token (for production — RECOMMENDED)**
1. Go to **https://business.facebook.com/settings/system-users**
2. Click **"Add"** to create a new System User
3. Set role to **"Admin"**
4. Click **"Generate New Token"**
5. Select your app (e.g. "Kuwex WhatsApp AI")
6. Check these permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
7. Click **"Generate Token"**
8. **COPY AND SAVE THIS TOKEN** — you won't see it again!

```
Token looks like: EAAGm0PX4ZCps...very_long_string...ZD
```

#### Step 6: Configure the Webhook
1. In your Meta app, go to **WhatsApp → Configuration**
2. Under **"Webhook"**, click **"Edit"**
3. Enter:
   - **Callback URL:** `https://kuwex-whatsapp-ai.vercel.app/api/webhook/whatsapp`
     (replace with YOUR actual Vercel URL)
   - **Verify Token:** `kuwex-wa-verify-2024`
4. Click **"Verify and Save"**
5. Under **"Webhook fields"**, click **"Manage"**
6. Find **"messages"** and click **"Subscribe"**

```
┌─────────────────────────────────────────────────────────┐
│  Webhook                                                │
│                                                         │
│  Callback URL: https://your-app.vercel.app/api/webhook/ │
│                whatsapp                                  │
│                                                         │
│  Verify token: kuwex-wa-verify-2024                     │
│                                                         │
│  [Verify and Save]                                      │
│                                                         │
│  Webhook fields:                                        │
│  ☑ messages    [Subscribed]                             │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Add Environment Variables to Vercel

Now that you have all the keys, add them to your Vercel deployment.

### 4.1 Go to Vercel Settings
1. Open **https://vercel.com/dashboard**
2. Click on your `kuwex-whatsapp-ai` project
3. Go to **Settings → Environment Variables**

### 4.2 Add These Variables

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abcdef.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |
| `WHATSAPP_VERIFY_TOKEN` | Your webhook verify token | `kuwex-wa-verify-2024` |
| `WHATSAPP_ACCESS_TOKEN` | (Optional — only if using single-tenant) | `EAAGm0PX4ZCps...` |
| `WHATSAPP_PHONE_NUMBER_ID` | (Optional — only if using single-tenant) | `977956835404682` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model to use | `meta-llama/llama-3.1-8b-instruct:free` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | `https://kuwex-whatsapp-ai.vercel.app` |

### 4.3 Redeploy
After adding all variables, click **"Deployments"** → find the latest deployment → click the **"..."** menu → **"Redeploy"**.

This is critical — the app needs to restart to pick up the new environment variables.

---

## 5. Add Your First Client (Kuwex Demo)

### Via the Dashboard (Recommended)
1. Go to `https://YOUR-VERCEL-URL.vercel.app/dashboard/clients`
2. Click **"Add Client"**
3. Click the blue **"How to get WhatsApp Phone Number ID & Access Token"** guide if needed
4. Fill in:
   - **Business Name:** `Kuwex Studios`
   - **Phone Number ID:** `977956835404682` (your actual ID)
   - **Access Token:** paste your permanent token
   - **Brand Tone:** Professional & Friendly
   - **Services Description:** "We offer web development, mobile apps, digital marketing, AI automation, and WhatsApp business solutions for African SMEs. Pricing starts from $200 for websites, $500 for mobile apps, and $150/month for digital marketing packages."
   - **Escalation Email:** `admin@kuwex.co.zw`
5. Click **"Create Client"**

### Via Supabase SQL (Alternative)
```sql
INSERT INTO clients (
  business_name, whatsapp_phone_number_id, whatsapp_access_token,
  services_description, brand_tone, escalation_email
) VALUES (
  'Kuwex Studios',
  '977956835404682',
  'YOUR_ACCESS_TOKEN_HERE',
  'We offer web development, mobile apps, digital marketing, AI automation, and WhatsApp business solutions.',
  'professional and friendly',
  'admin@kuwex.co.zw'
);
```

---

## 6. Test It!

1. Open WhatsApp on your phone
2. Send a message to your business number: **"Hi, I'm interested in your services"**
3. Wait 2-5 seconds — the AI should respond!
4. Try these test messages:
   - **"How much does a website cost?"** → should detect "pricing" intent
   - **"I want to book a consultation"** → should detect "booking" intent
   - **"I want to speak to a human"** → should escalate to human agent
5. Go to your dashboard → **Conversations** to see the messages
6. Go to **Analytics** to see intent detection working

---

## 7. Adding a Second Client (Another Business)

The system is **multi-tenant** — each client's WhatsApp number is handled independently.

### What the New Client Needs to Provide
1. Their **WhatsApp Phone Number ID** (from their Meta Developer Console)
2. Their **WhatsApp Access Token** (permanent token from their Business Settings)
3. Their **business details** (name, services, pricing, tone)

### Two Webhook Options

**Option A: Client uses YOUR Meta App (Easiest)**
- You add their phone number to your existing Kuwex Studios Meta app
- The webhook is already configured — it just works
- Best for: clients who don't have technical knowledge

**Option B: Client has their OWN Meta App**
- They set their webhook URL to your Vercel URL
- They use the same verify token: `kuwex-wa-verify-2024`
- They subscribe to `messages`
- Best for: larger clients who want their own Meta app

### Steps
1. Get their Phone Number ID and Access Token
2. Go to your dashboard → **Clients** → **Add Client**
3. Fill in their details
4. Done — AI starts responding to their customers immediately

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Webhook won't verify | Wrong URL or verify token | Double-check URL ends with `/api/webhook/whatsapp` and token is `kuwex-wa-verify-2024` |
| AI not responding | Missing env vars or no client in DB | Check Vercel env vars are set, check client exists with matching phone_number_id |
| "supabaseUrl is required" | Supabase env vars not set | Add `NEXT_PUBLIC_SUPABASE_URL` and keys in Vercel, then redeploy |
| Dashboard shows no data | Supabase schema not run | Run `supabase/schema.sql` in Supabase SQL Editor |
| Token expired | Using temporary token | Generate a permanent token via System Users |
| Slow AI responses | Free model can be slow | Upgrade to `openai/gpt-4o-mini` in `OPENROUTER_MODEL` |
| Messages not appearing | Webhook not subscribed | Go to Meta → WhatsApp → Configuration → Subscribe to `messages` |
