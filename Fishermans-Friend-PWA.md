# 🐟 Fisherman’s Friend PWA – Master Development Prompt

## 🧠 Overview
Act as a senior full-stack developer, UI/UX designer, and system architect. Design and develop a scalable Progressive Web App (PWA) system called **“Fisherman’s Friend”**, built using **React**, **Tailwind CSS**, and **shadcn/ui**.

The system must follow modern best practices in performance, accessibility, maintainability, and scalability.

---

## 🎯 Core Requirements

### 🏗️ 1. Architecture & Structure
- Use a **modular, scalable architecture** (feature-based or domain-driven).
- Organize folders:
  ```
  src/
    components/
    features/
    pages/ or app/
    hooks/
    services/
    utils/
    types/
  ```
- Use **TypeScript** for type safety.
- Follow **clean code principles** and consistent naming conventions.

---

### 🎨 2. UI/UX Design
- Design a **clean, modern, intuitive interface** for fishermen and coastal communities.
- Ensure:
  - Mobile-first responsive design
  - Accessibility (WCAG standards)
    - Proper color contrast
    - ARIA labels
    - Keyboard navigation
- Use **shadcn/ui** components styled with Tailwind.
- Maintain a consistent design system (spacing, colors, typography).

---

### 🔁 3. Reusable Components
- Build reusable UI components:
  - Buttons
  - Cards
  - Modals
  - Forms
  - Navigation bars
- Ensure:
  - Configurable via props
  - Extendable and maintainable
  - Documented usage

---

### ⚡ 4. Performance Optimization
- Implement:
  - Code splitting (React.lazy / dynamic imports)
  - Memoization (useMemo, useCallback)
  - Efficient state management (Context API, Zustand, or Redux Toolkit)
- Optimize:
  - Images (lazy loading, compression)
  - Rendering performance
- Minimize bundle size

---

### 📱 5. PWA Capabilities
- Enable:
  - Service worker (offline support & caching)
  - Web app manifest (installable app)
  - Add-to-home-screen functionality
- Strategies:
  - Offline-first or network fallback
  - Background sync (optional)
  - Push notifications (optional)

---

### 🔐 6. Data & State Management
- Use scalable state management:
  - Context API / Zustand / Redux Toolkit
- Handle:
  - API integration (REST or GraphQL)
  - Loading and error states
- Use persistence:
  - localStorage or IndexedDB (if needed)

---

### 🧩 7. Core Features
- Weather updates and sea conditions
- Fishing logs / catch tracking
- Marketplace (buy/sell fish or supplies)
- Community posts or alerts
- GPS/location-based tools

---

### 🧪 8. Testing & Quality
- Include:
  - Unit testing (Jest / React Testing Library)
  - Component testing
- Ensure:
  - Clean, maintainable, testable code

---

### 🚀 9. Deployment & Scalability
- Prepare for deployment:
  - Vercel / Netlify
- Ensure:
  - Environment configs
  - Scalable structure
- Support future expansion

---

### 📚 10. Documentation
- Provide:
  - Clear README
  - Setup instructions
  - Folder structure explanation
  - Component usage examples

---

## 📦 Expected Output
- Structured project scaffold
- Reusable components
- Sample pages (Dashboard, Logs, Marketplace)
- PWA setup (service worker + manifest)
- Responsive UI
- Production-ready practices

---

## 💡 Optional Enhancements
- Dark mode support
- Multi-language support (i18n)
- Analytics integration
- Role-based access control (admin/user)

---

## 📝 Notes
- Prioritize **scalability and maintainability**
- Ensure **accessibility and performance**
- Follow **modern React best practices**

---

## Sea-Ready Feature Additions

- Add **GPS-based mapping of productive fishing zones** with zone confidence, last catch activity, distance, and coordinates.
- Share productive zones only inside **trusted cooperative networks**, with visibility scoped by cooperative membership, vessel role, and explicit sharing permissions.
- Integrate **real-time PAGASA marine weather alerts** for gale warnings, thunderstorms, sea state, wind, tide, and small-craft advisories.
- Cache the last valid PAGASA bulletin and trusted zone map for offline use when signal is weak or unavailable.
- Make the interface **voice-first** with Cebuano and Hiligaynon command flows for weather checks, productive-zone lookup, catch logging, and alert playback.
- Use a **minimal weatherproof sea mode** with large tap targets, high contrast, short labels, glove/wet-hand-friendly controls, and clear audio/read-aloud confirmations.
- Support urgent push notifications for marine weather, cooperative safety reports, and geofenced hazards near a crew's current GPS position.
