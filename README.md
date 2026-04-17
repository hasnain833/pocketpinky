# Pinky Pill (PinkyPocket)

Your AI Big Sister for Dating Clarity. Vet men, decode red flags, and date with standards.

## 🚀 The Mission
Pinky Pill is a premium web application designed to help women navigate the modern dating landscape with psychology-backed insights and AI-driven coaching.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS + Framer Motion (Boutique Editorial Aesthetic)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **Payments**: [Stripe](https://stripe.com/) (Subscriptions & Prepaid Message Packs)
- **AI Chat**: [Botpress](https://botpress.com/) (Custom Real-time Integration)
- **Emails**: [Brevo](https://www.brevo.com/) (SMTP via Nodemailer)

## ✨ Core Features

### 1. Hybrid Quota System (Architecture)
Pinky Pocket uses a sophisticated, stateless quota system that combines recurring subscriptions with one-time prepaid boosters.
- **`plan` column**: Tracks the base subscription tier (`free`, `premium`, `ultra_premium`).
- **`message_credits` column**: Tracks purchased prepaid message packs (500 or 1,000 messages).
- **Stateless Counting**: Botpress handles real-time message counting and syncs state back to Supabase only when quotas are exhausted via the `/api/exhaust-credits` endpoint.

### 2. AI Dating Coach (Pinky)
A custom-trained AI bot that lives in a boutique editorial chat widget. 
- **Pattern Recognition**: Identifies the "49 Patterns" of behavior.
- **Swirling Mode**: Expert interpersonal relationship advice.
- **Real-time Sync**: Bi-directional communication between the Next.js backend and Botpress via webhooks and user tags.

### 3. Prepaid Message Packs & Premium Ecosystem
Premium users can purchase "Boosters" to bypass daily limits:
- **500 Message Pack ($50)**: One-time purchase, adds to a persistent credit balance.
- **1,000 Message Pack ($80)**: Best value, bypasses all daily constraints until exhausted.

### 4. Premium Ecosystem
- **Pinky Premium**: Monthly subscription for AI coaching.
- **Digital Guides**: Single-purchase PDFs for deep dives into dating psychology.
- **Smart Paywalls**: Automatic context-aware links based on user account status.

### 5. Automated Workflows
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
   - `BREVO_SMTP_USER` & `BREVO_SMTP_KEY`
   - `BOTPRESS_WEBHOOK_URL` (For real-time quota sync)

3. **Development**:
   ```sh
   npm run dev
   ```

## 📂 Project Structure

- `src/app/` — Next.js App Router (Routes & Sync APIs)
- `src/components/` — Boutique UI components (Chat, Pricing, Account Modals)
- `src/lib/` — Supabase, Stripe, and Internal Admin utilities
- `database.sql` — Schema definition including the `message_credits` architecture.

---
*Stay sharp. Trust Pinky.*
