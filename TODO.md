# Pocket Pinky — Website TODO

Remaining tasks for the website (from Vetting App Launch brief). Mobile app and Botpress backend are out of scope here.

---

## High priority

- [ ] **Embed Botpress chat widget** — Add Botpress embed code in `ChatbotSection.tsx` (Section 7). Widget should be visible and styled to match brand. Currently a placeholder.
- [ ] **Stripe payment links** — Connect pricing section CTAs (Free Trial, Basic, Premium) in `PricingSection.tsx` to real Stripe payment/checkout links instead of `#chatbot`.

## Medium priority

- [ ] **Google Analytics 4** — Add GA4 script/tag to the site (e.g. in root layout or via next/script).
- [ ] **Email capture (quiz)** — Integrate Constant Contact (or equivalent) to capture email on quiz completion.
- [ ] **Account page** — Create `/account` or `/my-account`: show current plan, renewal date, “Manage Subscription” (Stripe Customer Portal), guide download links (if Premium), newsletter toggle, contact link.
- [ ] **Footer links** — Add “My Account” link; replace placeholder `#` with real URLs for Terms, Privacy, Contact.
- [x] **Performance** — Lazy loading for below-fold content, image optimization (e.g. next/image), aim for page load under 3 seconds.

## Low priority

- [ ] **Footer real links** — Update social links and App Store / Google Play URLs when final URLs are available.

---

## Done (reference)

- Hero, Trust Bar, Quiz, Features, How It Works, Before/After, Pricing UI, Testimonials, Footer layout
- Next.js app, responsive design, sticky header, design system
- NavLink and Vitest fixes for build
