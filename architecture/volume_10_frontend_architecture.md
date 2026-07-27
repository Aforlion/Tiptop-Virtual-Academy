# Volume 10: Frontend Architecture

This document defines the Next.js App Router structure, component design principles, accessibility guidelines, and performance optimization thresholds for Tiptop Virtual Academy 2.0.

## 1. Directory Structure (App Router & Domain Integration)

The project layout follows a domain-driven structure within Next.js App Router, separating page routing from core domain UI modules.

```
/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Global Layout (Google Fonts, Theme Context)
│   ├── page.tsx              # Root landing redirect
│   ├── admissions/           # Admissions paths
│   ├── student/              # Student dashboard views
│   ├── parent/               # Parent portal views
│   ├── teacher/              # Teacher workspace views
│   └── executive/            # Executive command center views
├── components/               # Pure, shared UI components (buttons, cards, inputs)
├── domains/                  # Isolated business domains
│   ├── admissions/           # Form modules, pricing calculators
│   ├── students/             # Junior/Senior components, wellbeing selectors
│   ├── parents/              # Sibling profiles, ledger tables
│   ├── shared/               # Style tokens, design system utilities
│   └── academy-intelligence/ # Chat overlay interface modules
├── hooks/                    # Shared hooks (useAuth, useLocalStorage)
├── lib/                      # Third-party wrappers (supabaseClient, stripeClient)
└── styles/                   # Global CSS imports & Tailwind configuration
```

---

## 2. Design System and Styling Tokens

Styling utilizes Tailwind CSS configured to mirror the design philosophy guidelines:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          purple: 'hsl(270, 70%, 40%)',    // Primary actions, brand identification
          gold: 'hsl(45, 100%, 50%)',      // Milestones, highlights
          lavender: 'hsl(268, 80%, 90%)',  // Hover background, cards
          darkviolet: 'hsl(273, 85%, 15%)' // Deep headings
        },
        neutral: {
          warmwhite: 'hsl(36, 33%, 98%)',  // Page margins
          slate: 'hsl(210, 10%, 40%)'      // Body text
        }
      },
      borderRadius: {
        'btn': '12px',
        'card': '16px',
        'dialog': '20px',
        'panel': '24px'
      },
      spacing: {
        'grid-unit': '8px'
      }
    }
  }
};
```

---

## 3. Motion & Animation Guidelines (Framer Motion)

Animations represent the **Open Book Principle** using GPU-accelerated transition properties to ensure steady 60fps renders:

- **View Transitions**: Fades and horizontal slide-in effects to simulate page turns.
  - Duration: `350ms` using `easeOut` curves.
- **Card Expansion**: Elevating cards on hover using scale transitions.
  - Scaling: `scale(1.02)` with transition duration of `150ms`.
- **Milestone Celebrations**: Sparkle effects around Gold elements.
  - Triggered using keyframe scales.

---

## 4. Accessibility (WCAG AA Compliance)

- **Semantic Landmarks**: Screen layouts must employ standard HTML5 containers (`<header>`, `<main>`, `<nav>`, `<footer>`).
- **Contrast Bounds**: Every text asset must verify contrast ratios:
  - Normal text: Minimum 4.5:1 ratio against the container background.
  - Large text: Minimum 3:1 ratio.
- **Keyboard Usability**: Custom elements must map appropriate focus styling outlines (`focus-visible:ring-2`) and support standard key navigations (`Enter`, `Space` for buttons).
- **ARIA Declarations**: Dynamic elements (e.g. state toggles, modals, and AI assistant overlays) must include proper `aria-expanded` and `role="dialog"` annotations.

---

## 5. Performance Optimization Targets

- **First Contentful Paint (FCP)**: Target below `1.5 seconds` on 4G networks.
- **Time to Interactive (TTI)**: Target below `2.5 seconds`.
- **Code Splitting**: Dynamic loading for heavy components (e.g., charts, complex form modals) using Next.js `dynamic()`.
- **Image Optimization**: All image files are stored in WebP format and rendered using Next.js `<Image>` for automatic scaling and lazy loading.
