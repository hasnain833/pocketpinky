# Pocket Pinky — Website TODO

Remaining tasks for the website (from Vetting App Launch brief). Mobile app and Botpress backend are out of scope here.

---

## High priority

- [ ] **Embed Botpress chat widget** — Add Botpress embed code in `ChatbotSection.tsx` (Section 7). Widget should be visible and styled to match brand. Currently a placeholder (CTA only).
- [ ] **Stripe payment links** — Connect pricing CTAs (Free Trial, Basic, Premium) in `PricingSection.tsx` to real Stripe payment/checkout links. Currently: logged-in users are scrolled to `#chatbot`; logged-out users see login dialog.

## Low priority

- [ ] **Footer real links** — Update social links (Instagram, Twitter, Facebook, Mail) from `#` to final URLs; App Store / Google Play use env vars and can be updated when URLs are available.

---

## Done (reference)

**Pages & structure**
- Hero, Trust Bar, Quiz, Features, How It Works, Before/After, Pricing UI, Testimonials, Footer layout
- Next.js App Router, responsive design, sticky header, design system
- `/account` — plan, renewal date, Manage Subscription (Stripe portal URL via env), guide download links (Premium), newsletter toggle, contact link
- `/auth` — login/signup with Supabase; form validation; password rules (length, capital, special); eye toggles; smooth mode switch
- `/terms`, `/privacy`, `/contact` — created and linked from footer
- `/not-found` — branded 404
- Footer: My Account, Terms, Privacy, Contact linked to real routes

**Auth (Supabase)**
- Supabase client (browser + server), middleware session refresh
- Auth page: sign up, sign in, errors, redirect to `/account` — **email captured at signup** (no separate quiz email capture needed)
- Header: auth state (Account + Log out when logged in; Log in / Sign up when not)
- Account page: protected; redirect to `/auth` when not logged in
- Logout: from homepage → full refresh; from other pages → redirect to homepage
- Quiz: login required to proceed past question 1; login dialog with link to `/auth`
- Pricing: login required to subscribe; login dialog with link to `/auth`

**Performance & config**
- Lazy loading (dynamic imports) for below-fold sections, `next/image` for images
- Google Analytics 4 — gtag in root layout via `next/script` (optional; set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable)
- `.env.example` — Supabase URL/key, Stripe portal, GA4, contact email, app store URLs
- `.gitignore` — .next, env files, PDF reference doc

**Build & fixes**
- NavLink and Vitest fixes for Next.js build
- Auth page: Suspense boundary for `useSearchParams` (build fix)
