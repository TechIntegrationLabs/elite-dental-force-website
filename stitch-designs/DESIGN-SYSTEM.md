# Elite Dental Force — Design System: "The Clinical Luminary"

> Extracted from Stitch project `12420928885362930944` on 2026-03-27

## Overview & Creative North Star

This design system rejects the sterile, boxy aesthetic of traditional medical software in favor of **"The Clinical Luminary."** A fusion of high-end fintech precision (Stripe-inspired) and the deep, reassuring calm of a premium healthcare environment.

The system breaks the "template" look by prioritizing **tonal depth over structural lines.** Instead of rigid grids separated by borders, we use intentional asymmetry, overlapping "glass" surfaces, and high-contrast typography scales.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Background (Base)** | `#071325` | Foundation of entire experience |
| **Primary Accent** | `#00d4ff` | Critical actions and brand energy |
| **Secondary Accent** | `#00ffc8` | "Healthy" states and success metrics |
| **Tertiary Highlight** | `#7c3aed` | Specialized insights and data differentiation |

### Full Named Colors

| Token | Hex |
|-------|-----|
| background | #071325 |
| surface | #071325 |
| surface_bright | #2e394d |
| surface_container | #142032 |
| surface_container_high | #1f2a3d |
| surface_container_highest | #2a3548 |
| surface_container_low | #101c2e |
| surface_container_lowest | #030e20 |
| surface_dim | #071325 |
| primary | #a8e8ff |
| primary_container | #00d4ff |
| secondary | #f4fff8 |
| secondary_container | #00fdc6 |
| tertiary | #e7d8ff |
| tertiary_container | #cfb7ff |
| error | #ffb4ab |
| error_container | #93000a |
| on_background | #d7e3fc |
| on_surface | #d7e3fc |
| on_surface_variant | #bbc9cf |
| on_primary | #003642 |
| on_secondary | #00382a |
| on_tertiary | #3f008e |
| outline | #859398 |
| outline_variant | #3c494e |
| inverse_surface | #d7e3fc |
| inverse_on_surface | #253144 |
| inverse_primary | #00677e |

### The "No-Line" Rule

**Do NOT use 1px solid borders to section content.** Boundaries must be defined solely through background color shifts.
- Use `surface-container-low` for secondary sections on a `surface` background
- Use `surface-container-high` for active/elevated states
- Borders create visual noise; tonal shifts create "breathing" space

### Glass & Gradient Signature

Glassmorphism for floating elements (Modals, Popovers, Nav Bars):
- `surface-variant` at 60% opacity + `20px` backdrop-blur
- CTAs: linear gradient from `primary` (#a8e8ff) to `primary-container` (#00d4ff) at 135deg

---

## Typography

| Role | Font | Usage |
|------|------|-------|
| Display & Headlines | **Manrope** | Large scale, "Dashboard as Magazine" feel |
| Body & UI | **Inter** | Enterprise-grade readability |

- `display-lg` at 3.5rem for hero headings
- `headline-lg` for page titles with `spacing-12` bottom margin
- Labels: uppercase, `0.05em` letter-spacing

---

## Elevation: Tonal Layering

| Level | Token | Hex | Usage |
|-------|-------|-----|-------|
| 0 (Floor) | surface_container_lowest | #030e20 | Background utility |
| 1 (Base) | surface | #071325 | Main canvas |
| 2 (Cards) | surface_container | #142032 | Content modules |
| 3 (Interaction) | surface_container_highest | #2a3548 | Hover/active |

### Ambient Shadows

Floating elements: `0px 16px 48px rgba(0, 212, 255, 0.08)` — shadow color must be tinted with primary, never grey.

### Ghost Border Fallback

When accessibility requires it: `outline-variant` (#3c494e) at **15% opacity**.

---

## Components

### Buttons
- **Primary:** Gradient fill (primary → primary-container), round-md (0.75rem), white text
- **Secondary:** Ghost — no background, ghost border (15% opacity), primary text
- **Hover:** 20px outer glow at 0.3 opacity using accent color

### Data Cards
- Zero borders, zero dividers
- `spacing-6` padding, `title-md` headers
- 2px vertical accent bar of secondary (#00ffc8) on left for "Active/Healthy"

### Input Fields
- `surface-container-low` background
- Focus: ghost border at 40% opacity + primary glow
- Always `round-md` (0.75rem)

### Charts
- Area charts: gradient stroke (secondary → transparent) with backdrop-blur fill

---

## Spacing Scale

Moves in **0.35rem (~5px)** increments:
- **Tight:** spacing-1 (0.35rem), spacing-2 (0.7rem)
- **Standard:** spacing-4 (1.4rem), spacing-6 (2rem)
- **Sectional:** spacing-12 (4rem), spacing-16 (5.5rem)

---

## Do's and Don'ts

### DO
- Use whitespace as a functional tool — double spacing instead of adding lines
- Use "Subtle Glows" (primary-container at 5% opacity) behind high-level metrics
- Use round-xl (1.5rem) for layout containers, round-md for components

### DON'T
- Use pure black (#000000) or pure grey — every neutral tinted with navy/teal
- Use 1px dividers — use spacing-px height box at 20% opacity if unavoidable
- Use high-saturation red for errors — use error_container (#93000a) with soft glow

---

## Screens Inventory

| File | Screen | Size |
|------|--------|------|
| homepage.html | Elite Dental Force Homepage | 28KB |
| workforce-homepage-v1.html | Elite Workforce Homepage v1 | 26KB |
| about-us-v1.html | About Us Page (v1) | 21KB |
| about-us-v2.html | About Us Page (v2) | 22KB |
| ai-consultants.html | AI Consultants Page | 31KB |
| ai-consultants-detail.html | AI Consultants Detail Page | 33KB |
| edifi-platform-v1.html | EDiFi Platform Page (v1) | 27KB |
| edifi-platform-v2.html | EDiFi Platform Page (v2) | 26KB |
| book-demo-v1.html | Book a Demo Page (v1) | 16KB |
| book-demo-v2.html | Book a Demo Page (v2) | 15KB |
| redesign-guide.html | Redesign Guide & Strategy Roadmap | 8KB |

## Stitch Project IDs

- **Main (dark, full design system):** `projects/12420928885362930944`
- **Landing Page Redesign (light):** `projects/471100822300005411`
