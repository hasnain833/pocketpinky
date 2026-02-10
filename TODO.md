# Pocket Pinky — Website TODO

Remaining tasks for the website (from Vetting App Launch brief). Mobile app and Botpress backend are out of scope here.

---

## High priority

- [ ] **Subscription Sync** — Use Supabase Admin API in the Stripe webhook to update the user's `app_metadata` with `{ "plan": "premium" }`. This will automatically be picked up by the `BotpressWebchat` component.
- [ ] **Chatbot Question Limits** — Implement logic (likely in Botpress or a middleware) to enforce the "3 questions" limit for Free users once authenticated.
- [/] **Guides Landing Page** — Refine the `/guides` page with any final editorial content or visual polish requested.


## Done (reference)

**Guides & Paywall**
- **Guides Landing Page**: Created full-featured `/guides` page with React/Framer Motion.
- **Paywall Integration**: Created `/api/checkout` and `/api/download` routes with Stripe integration.
- **Automatic Downloads**: Implemented logic on the `/success` page to trigger PDF downloads instantly (sequential for bundles).
- **Navigation UX**: Implemented "History Sandwich" to bypass Stripe checkout when user clicks "Back" from the success page.
- **Auth Gating**: All guide purchases now require a Supabase login via `AuthModal`.

**Chatbot Integration**
- **Global Widget**: Replaced static links with a full `BotpressWebchat` component using v3.5 inject scripts.
- **Auth Gated Access**: The chatbot widget is now only initialized and visible for logged-in users.
- **Auto-Scroll Fix**: Implemented a custom event listener and interval check to ensure new messages automatically scroll to the bottom.
- **Programmatic Control**: Added `open-pinky-chat` event support to allow "Start Free" buttons to open the widget directly.

**Premium UI & UX**
- **Pricing Gating**: Both "Start Free" and "Get Premium" plans in `PricingSection.tsx` are now gated behind login.
- **Route Progress Bar**: Fixed invisible/broken progress bar with new colors (`primary`, `pink-accent`, `gold`) and Framer Motion.
- **Animation System**: Created reusable `ScrollReveal` system with custom editorial easing.
- **Performance**: Integrated `ScrollArea` into `AccountModal`; optimized spacing and layering (z-index).

**Auth & Pages**
- **Supabase Core**: Middleware session refresh, protected routes, and client-side auth state.
- **Auth Experience**: Auth page converted to a reusable `AuthModal`.
- **Global Layout**: Root layout refined with consistent Header/Footer and Chatbot integration.
- **Legal & Help**: `/terms`, `/privacy`, `/contact`, and branded `/not-found` page.
