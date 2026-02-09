# Pocket Pinky — Website TODO

Remaining tasks for the website (from Vetting App Launch brief). Mobile app and Botpress backend are out of scope here.

---

## High priority

- [ ] **Stripe payment links** — Connect pricing CTAs (Free Trial, Basic, Premium) in `PricingSection.tsx` to real Stripe payment/checkout links. Currently: logged-in users are scrolled to `#chatbot`; logged-out users see login dialog.
- [/] **Embed Botpress chat widget** — Move from static links to a full floating widget integration. Need `NEXT_PUBLIC_BOTPRESS_CLIENT_ID` for `inject.js` implementation.

## Low priority

- [ ] **Footer real links** — Update social links (Instagram, Twitter, Facebook, Mail) from `#` to final URLs.

---

## Done (reference)

**Premium UI & UX**
- **Animation System**: Created reusable `ScrollReveal` system with custom editorial easing. Staggered reveals for Hero, Pricing, and Unlock sections.
- **Performance**: Integrated `ScrollArea` into `AccountModal` to handle content overflow and improve mobile accessibility.
- **Vertical Compactness**: Refined `AccountModal` and `AuthModal` for better fit on small screens.
- **Spacing Optimization**: Fixed excessive gap between fixed header and hero content; resolved z-index layering conflicts.
- **Responsive Alignment**: Centered `CreatorSection` on mobile; standardized mobile navigation menu labels and buttons to match desktop.
- **Public Resources**: Relocated "49 Patterns" and "Swirling Success" PDF guides to the site footer for public access.

**Pages & structure**
- Hero, Trust Bar, Features, How It Works, Before/After, Pricing UI, Testimonials, Footer layout
- Next.js App Router, responsive design, sticky header, design system
- `/account` — plan, renewal date, Manage Subscription (Stripe portal URL via env), newsletter toggle, contact link
- `/auth` — login/signup with Supabase; form validation; eye toggles; smooth mode switch
- `/terms`, `/privacy`, `/contact` — created and linked from footer
- `/not-found` — branded 404
- Footer: My Account, Terms, Privacy, Contact linked to real routes; top-border added for visual separation

**Auth (Supabase)**
- Supabase client, middleware session refresh, protected routes
- Auth page converted to `AuthModal` for smoother flow (email captured at signup)
- Header: auth state (Account + Log out when logged in; "Try Pinky Free" when not)
- Pricing: login required to subscribe; integrated with `AuthModal`

**Performance & config**
- Lazy loading (dynamic imports) for below-fold sections, `next/image` for images
- Google Analytics 4 integration (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- `.env.example`, `.gitignore`, and build fixes for Next.js consistency
