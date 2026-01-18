# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PathMark is a goal tracking and personal productivity application built with Vue 3 + TypeScript. It features goals with SMART criteria, habit trackers, journaling, gamification (XP/badges/coins), and a freemium subscription model via Stripe.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (type-check + vite build)
npm run type-check   # TypeScript type checking with vue-tsc
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting for src/
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3 (Composition API), Pinia stores, Vue Router
- **Backend**: Firebase Auth + Firestore (no separate backend server)
- **Payments**: Stripe via Netlify Functions
- **Mobile**: Capacitor for Android builds
- **Hosting**: Netlify

### Directory Structure
```
src/
├── stores/          # Pinia stores (state management)
├── views/           # Route-level components
├── components/      # Reusable components
├── router/          # Vue Router configuration
├── firebase.ts      # Firebase initialization
└── assets/          # CSS and static assets

netlify/functions/   # Serverless functions for Stripe
android/             # Capacitor Android project
```

### State Management Pattern

All Pinia stores follow a consistent pattern using Firestore real-time listeners:
- `watchEffect` subscribes to Firestore when user authenticates
- Cleanup on logout via unsubscribe callback
- User data stored at `users/{userId}/{collection}` path

Key stores:
- **auth** - Firebase Auth state, user profile, onboarding status
- **goals** - Goals with nested tasks, progress calculation, system "inbox" goal
- **trackers** - Numeric trackers with date-value pairs
- **journal** - Date-keyed journal entries
- **subscription** - Free/premium tier, limits enforcement
- **gamification** - XP, levels, coins, badges, shop items

### Subscription Limits (Free Tier)
- 3 goals max
- 2 trackers max
- Journal entries editable for 14 days

### Gamification Integration

Actions trigger XP/badge awards via `useGamificationStore`:
- Task completion: 5 XP
- Goal completion: 50 XP + confetti + badge checks
- Journal entry: 10 XP
- Tracker data point: 5 XP

### Route Guards

Router uses `beforeEach` guard with `meta.requiresAuth` and `meta.guest` flags. Auth state initialized via `authStore.initAuth()` promise.

### Environment Variables

Firebase config via Vite env vars (prefix `VITE_`):
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.

Stripe keys needed for Netlify functions.

### Path Alias

`@` maps to `src/` directory.
