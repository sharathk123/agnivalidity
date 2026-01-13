# AGNI EXIM - UI Design Guidelines (Modern Corporate / Linear)

## 1. Design Philosophy
**"Structural Integrity, Professional Authority, Regulatory Precision"**
Transitioned from "Apple-style" to a Modern Corporate framework. The UI prioritizes high-density data, crisp 1px borders, and a professional indigo-slate color palette to command authority in the Indian EXIM sector.

## 2. Typography
- **Headings (Display):** `Archivo` (Bold/Extrabold). Projects technical robustness and regulatory precision.
- **Body:** `Inter`. Retained for high readability in data-dense environments.
- **Hierarchy:** Headers use `tracking-tighter`, while body text uses `leading-relaxed`.

## 3. Color Palette (Fintech-Standard)
- **Primary Brand:** `brand-600` (#4F46E5 - Indigo). Represents stability and corporate finance.
- **Base Surface:** `bg-slate-50` (#f8fafc).
- **Secondary Surface:** `bg-white` (#ffffff).
- **Borders:** `border-slate-200` (1px solid). No soft shadows.
- **Status Indicators:**
  - **GO / SUCCESS**: `emerald-600`
  - **AVOID / FAILED**: `rose-600`
  - **WARNING**: `amber-600`

## 4. Component Standardization
- **Containers (Cards):** `.corporate-card` (`bg-white border border-slate-200 rounded-lg p-6 shadow-sm`). 8px corners (`rounded-lg`).
- **Input Fields:** Strict bordered input fields. Use sliders only for rapid simulation (Simulation Mode).
- **Buttons:** Solid `brand-600`, sharp but slightly rounded corners (`rounded`). No gradients as of 2026.

## 5. Layout Architecture
- **Unified Sidebar:** Persistent left sidebar (`w-64`, `bg-white`, `border-r border-slate-200`).
- **Header:** Functional Sticky Header (`h-14`, `bg-white`, `border-b border-slate-200`).
- **Information Density:** High density is preferred for Admin ("Control Ledger") views.

## 6. Implementation Rules
1. **Linear Grid:** Use CSS Grid and Flexbox with fixed borders instead of floating elements.
2. **Zero Blur:** No `backdrop-blur` or glassmorphism.
3. **No Gradients:** Solid colors define the brand.
4. **Regulatory UX:** Always include a "Compliance Banner" or status for ICEGATE v1.1 readiness.
