# Health Tracker

A personalized health tracking PWA for workouts, meals, and weekly consistency scoring.

## Features

- Day-wise workout tracking with exercise descriptions and form tips
- Meal planning with time slots, ingredients, calories, and prep instructions
- Week-by-week navigation with independent data per week
- One-click "Copy Last Week" to replicate plans
- CSV upload for bulk meal/exercise plans
- Consistency scoring with letter grades (A+ to F)
- 5-week trend comparison for both workout and meals
- Installable as an app (PWA) on mobile and desktop
- Works offline

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.

## Deploy to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public dir: dist, SPA: yes
npm run build
firebase deploy
```

## Folder Structure

```
health-tracker/
├── index.html              # Entry point with PWA meta tags
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel SPA config (optional)
├── .gitignore
├── public/
│   ├── favicon.svg
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker for offline
│   └── icons/              # App icons (192, 512, apple-touch)
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # Main app component
│   ├── defaultPlan.js      # Exercise and meal plan data
│   └── parseUpload.js      # CSV/Excel parsing utilities
└── docs/
    ├── HealthTracker.html  # Standalone single-file version
    ├── GymTracker.jsx      # Standalone React component
    ├── Ayush_Gym_Plan.pdf  # PDF gym plan
    └── gym_plan_template.xlsx  # Excel template
```

## Tech Stack

- React 18 + Vite
- Inline CSS (no external dependencies)
- PWA with service worker
- Firebase Hosting / Vercel ready
