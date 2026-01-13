# UI / UX CONTRACT
## EXIM Insight India – MVP

This document governs **all UI/UX decisions** for the MVP.

Modern UI is allowed.
UI excess is NOT allowed.

If there is conflict:
MASTER_PRODUCT_CONTRACT.md always wins.

---

## 1. UI PURPOSE (NON-NEGOTIABLE)

The UI exists to:

- Make trade decisions **clear**
- Reduce cognitive load
- Show trust and seriousness
- Support **reading and printing reports**

The UI does NOT exist to:
- Impress designers
- Showcase animations
- Feel “startup flashy”
- Compete with dashboards like PowerBI

Clarity > Beauty  
Credibility > Delight  

---

## 2. ALLOWED UI STYLE (MODERN BUT CONTROLLED)

### Allowed
- Clean layout
- Neutral color palette
- Card-based sections
- Subtle shadows
- Good typography hierarchy
- Responsive design
- Light/dark mode (optional)

### Not Allowed
- Glassmorphism
- Neon gradients
- Motion-heavy transitions
- Parallax
- 3D effects
- “Wow” animations

If a UI element draws attention to itself,
it is probably not allowed.

---

## 3. DESIGN LANGUAGE (APPROVED)

### Color
- Greys, slate, neutral blues
- One accent color only
- High contrast for readability

### Typography
- System fonts OR Inter
- Clear hierarchy:
  - Page title
  - Section title
  - Data label
  - Data value

### Layout
- Vertical flow
- Left-to-right reading
- No hidden data
- No hover-only critical info

---

## 4. COMPONENT RULES (STRICT)

### Allowed Components
- Search input
- Dropdowns
- Cards
- Tables
- Badges (LOW / MEDIUM / HIGH)
- Simple icons (if meaningful)

### Forbidden Components
- Carousels
- Infinite scroll
- Tooltips with critical info
- Animated charts
- Complex filters

---

## 5. MOTION & ANIMATION (LIMITED)

Motion is allowed **ONLY IF** it:
- Improves clarity
- Is subtle
- Is under 200ms

### Allowed
- Fade-in on page load
- Hover highlight
- Focus states

### Forbidden
- Framer Motion choreography
- Page transition animations
- Animated numbers
- Loading spinners beyond simple text

**Rule:**  
If removing animation does not reduce clarity → remove it.

---

## 6. DATA VISUALIZATION RULES

### Allowed
- Textual summaries
- Simple bar charts (static)
- Tables

### Not Allowed
- Animated charts
- Complex dashboards
- Multi-axis graphs
- Over-styled charts

This is a **decision tool**, not an analytics lab.

---

## 7. LANGUAGE & MICROCOPY (VERY IMPORTANT)

### Allowed Tone
- Neutral
- Advisory
- Factual
- Government-style clarity

### Forbidden Language
- “AI-powered”
- “Smart”
- “Intelligent”
- “Expert engine”
- “High-fidelity”

### Example (Correct)
> “Risk level is MEDIUM due to certification lead time and seasonal demand.”

### Example (Incorrect)
> “Our AI engine predicts moderate risk.”

---

## 8. UI STRUCTURE (LOCKED)

### Page Flow
1. Product search
2. Country selection
3. Insight results
   - Demand
   - Price
   - Risk
   - Certification
4. Recommendation
5. Report download

No tabs.
No hidden sections.
No gamification.

---

## 9. PDF-FIRST DESIGN RULE

Every UI section MUST:
- Translate cleanly to PDF
- Print well
- Make sense without interaction

If a section cannot be printed,
it does not belong in MVP UI.

---

## 10. AGENT RULES (UI-SPECIFIC)

Agents MUST:
- Follow this file exactly
- Default to simpler UI
- Ask before adding new UI components

Agents MUST NOT:
- Introduce new UI libraries
- Add animation frameworks
- Redesign layouts without approval
- Use marketing copy

---

---

## 11. ADMIN & OPERATIONS UI (EXCEPTION)

The Admin Command Center (`/admin`) is an operational tool, NOT a user report.
It has distinct rules:

### Allowed for Admin Only
- **Dark Mode / High Contrast**: Terminal-style black backgrounds for logs (`LogConsole`).
- **Real-Time Indicators**: Pulse animations (Green/Red) to show system heartbeat.
- **System Status Colors**: 
  - Red: Critical / Blocked / Error
  - Yellow: Warning / Compliance Risk (e.g., ICEGATE Version mismatch)
  - Green: Healthy / Active
- **Monospace Fonts**: For logs and raw data.

### Rationale
Operational tools require immediate visual feedback on system health. 
A "calm" UI is dangerous if it hides a critical failure (e.g., Kill Switch active).

---

## 12. RETROFIT INSTRUCTIONS

If existing UI violates this contract:
- Remove animations first
- Remove styling second
- Preserve layout and data order

Modern ≠ Fancy  
Modern = Calm, Clear, Credible

---

## 13. FINAL UI PRINCIPLE

> “If an exporter prints this page and reads it on paper,
> it should still work.”

END OF UI / UX CONTRACT
