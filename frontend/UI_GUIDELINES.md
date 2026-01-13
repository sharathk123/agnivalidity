# AGNI EXIM - UI Design Guidelines

## 1. Design Philosophy
**"Visual Excellence, Modern SaaS, Premium Intelligence"**
Our interface is designed to instill trust and clarity. We use a clean, glassmorphism-inspired aesthetic with robust information density appropriate for enterprise trade analysis.

## 2. Typography
**Primary Font:** `Inter` (Google Fonts)
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Usage: `font-sans` (Tailwind default)
- Fallback: System Sans Serif

## 3. Color Palette
Defined in `tailwind.config.js`.

### Brand (Ocean Blue)
- Primary: `brand-600` (#0284c7) - Buttons, Active States
- Dark: `brand-900` (#0c4a6e) - Headers, Emphasis
- Light: `brand-50` (#f0f9ff) - Backgrounds, Highlights

### Accent (Emerald Green)
- Success: `accent-500` (#10b981) - "GO" Recommendations, Positive Trends
- Ring: `accent-400` (#34d399) - Focus states

### Semantic Colors
- **GO**: Emerald/Green Gradients (`bg-gradient-to-r from-emerald-50 to-white`)
- **CAUTION**: Amber/Orange (`text-amber-700`)
- **AVOID**: Red/Rose (`border-l-red-500`)

## 4. Components

### Cards (`Card.tsx`)
Usage: Wrap distinct content sections.
Style: `bg-white rounded-xl border border-slate-200 shadow-sm p-6`
Feature: Glass/Clear effect on backgrounds where applicable.

### Layout (`DashboardLayout.tsx`)
Structure:
- **Sidebar**: Fixed, Dark (`bg-slate-900`), Gradient Logo.
- **Header**: Sticky, Glassmorphism (`bg-white/80 backdrop-blur-md`).
- **Main**: Light Gray Background (`bg-slate-50`).

## 5. Micro-interactions
- **Hover**: Subtle lifts (`hover:shadow-md`) or color shifts (`hover:text-brand-600`).
- **Transitions**: `transition-all duration-200`.
- **Animations**: `animate-fade-in`, `animate-slide-up` (defined in tailwind config).

## 6. Implementation Rules
1.  **Tailwind First**: No inline styles. No CSS files unless global reset.
2.  **Lucide Icons**: Use consistent icon set (if added). Currently text emojis are placeholders.
3.  **Responsive**: Mobile-first (`grid-cols-1 lg:grid-cols-12`).
4.  **Charts**: Use Recharts (future implementation).
