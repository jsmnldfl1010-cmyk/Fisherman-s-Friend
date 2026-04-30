# Fisherman's Friend PWA

Fisherman's Friend is an offline-ready React PWA for fishermen and coastal communities. It includes a dashboard, catch logs, marketplace listings, community alerts, GPS-based productive fishing zones, PAGASA-style marine weather alerts, and voice-first sea tools.

## Stack

- React with Create React App
- Component-driven CSS design system inspired by shadcn/ui primitives
- Supabase REST storage through Context API
- Lazy-loaded page modules for code splitting
- Web app manifest and production service worker

## Scripts

```bash
npm start
npm test
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Add your values to `.env`:

```bash
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Restart `npm start` after changing `.env`.

## Structure

```text
src/
  components/      Reusable layout and UI primitives
  hooks/           Shared React hooks
  pages/           Lazy-loaded feature pages
  services/        Context state and API boundaries
  utils/           Sample data and formatting helpers
```

## Features

- PAGASA-style marine weather and sea-condition dashboard
- Catch tracking with persistent Supabase records
- Marketplace listing creation and filtering
- Community alert posting through Supabase
- GPS-based mapping of productive fishing zones shared inside trusted cooperative networks
- Voice-first Cebuano and Hiligaynon command patterns for weatherproof operation at sea
- Minimal sea-mode controls with large tap targets, high contrast, and offline replay of last valid alerts
- Accessible navigation, form labels, focus states, and responsive layouts

## PWA Notes

The manifest lives in `public/manifest.json`. The service worker lives in `public/sw.js` and is registered only for production builds through `src/serviceWorkerRegistration.js`.

Run `npm run build` and deploy the `build/` folder to Vercel, Netlify, or any static host.
