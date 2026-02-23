# Pinky Pill (PinkyPocket)

Your AI Big Sister for Dating Clarity. Vet men, decode red flags, and date with standards.

## 🚀 The Mission
Pinky Pill is a premium web application designed to help women navigate the modern dating landscape with psychology-backed insights and AI-driven coaching.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS + Framer Motion (Boutique Editorial Aesthetic)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **Payments**: [Stripe](https://stripe.com/) (Subscriptions & Digital Goods)
- **AI Chat**: [Botpress](https://botpress.com/) (Custom Integration)
- **Emails**: [SendGrid](https://sendgrid.com/) (via Nodemailer)

## ✨ Core Features

### 1. AI Dating Coach (Pinky)
A custom-trained AI bot that lives in a boutique editorial chat widget. 
- **Pattern Recognition**: Identifies the "49 Patterns" of behavior.
- **Swirling Mode**: Expert interpersonal relationship advice.
- **Session Sync**: Deep integration between the website user state and bot memory.

### 2. Premium Ecosystem
- **Pinky Premium**: Monthly subscription for unlimited AI coaching.
- **Digital Guides**: Single-purchase PDFs for deep dives into dating psychology.
- **Smart Paywalls**: Automatic context-aware links based on user account status.

### 3. Automated Workflows
- **Database Triggers**: Robust signup logic that ensures data integrity.
- **Stripe Webhooks**: Instant account unlocking and product-specific confirmation emails.
- **Dynamic Checkouts**: Personalized checkout links that work with or without internal IDs.

## 📦 Getting Started

1. **Clone & Install**:
   ```sh
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with the following:
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `SENDGRID_API_KEY` & `SENDGRID_FROM_EMAIL`

3. **Development**:
   ```sh
   npm run dev
   ```

## 📂 Project Structure

- `src/app/` — Next.js 14 App Router (Routes & API)
- `src/components/` — Boutique UI components (Chat, Hero, etc.)
- `src/lib/` — Supabase and Stripe configurations
- `database.sql` — Schema and Trigger definitions

---
*Stay sharp. Trust Pinky.*
