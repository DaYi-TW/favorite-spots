# Design System Specification: The Intelligent Curator

## 1. Overview & Creative North Star

This design system is built to transform a utility-based "Favorite Spots" app into a high-end digital editorial experience. Our Creative North Star is **"The Intelligent Curator."** 

Unlike standard map or list apps that feel cluttered and transactional, this system prioritizes the "discovery" of locations through a lens of intelligence and sophistication. We achieve this by breaking the rigid "box-on-box" mobile template. We lean into intentional asymmetry, large-scale typography, and high-quality imagery that bleeds to the edges. Every interaction should feel like flipping through a premium travel magazine that happens to be powered by a supercomputer.

---

## 2. Colors

The palette is anchored by a sophisticated, neutral base that allows photography to breathe, punctuated by a high-energy "Electric Indigo" for intelligence and action.

### The Palette (Core Tokens)
- **Primary (Electric Indigo):** `#4b3fe2` — Used for the "intellectual" pulse of the app (active states, graph nodes, primary actions).
- **Surface (Off-White):** `#f5f6f7` — The canvas. This is not a pure #FFFFFF; it provides a softer, more premium foundation.
- **Surface Container Highest:** `#dadddf` — Used for deep nesting and contrast.
- **On-Surface:** `#2c2f30` — Deep charcoal for high-readability text.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are strictly prohibited** for sectioning or containment. Boundaries must be defined solely through background color shifts. For example, a card (`surface-container-lowest`) should sit on a background (`surface`) to create a distinction. If a visual break is needed, use vertical white space or a subtle transition between `surface-container-low` and `surface-container-high`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (#f5f6f7)
- **Sub-Sections:** `surface-container-low` (#eff1f2)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) 
- **Overlays/Modals:** Use **Glassmorphism**. Apply a backdrop-blur (20px-30px) to a semi-transparent `surface` color to allow the vibrant imagery and "Electric Indigo" nodes to bleed through.

### Signature Textures
Main CTAs should not be flat. Use a subtle linear gradient (from `primary` #4b3fe2 to `primary_dim` #3f2fd6) at a 135-degree angle. This adds "soul" and depth, making the action feel tactile and premium.

---

## 3. Typography

The typography strategy relies on the tension between a geometric, authoritative display face and a highly legible, humanistic sans-serif for utility.

- **Headlines & Display (Plus Jakarta Sans):** These are the "Editorial" voice. Use `display-lg` (3.5rem) for hero moments and `headline-lg` (2rem) for spot names. The tight tracking and bold weight convey intelligence.
- **Body & Labels (Manrope):** This is the "Functional" voice. Used for descriptions, addresses, and metadata. Manrope’s open counters ensure readability at small sizes on mobile screens.

**Editorial Hierarchy Tip:** To create a signature look, pair a very large `headline-md` title with a very small, all-caps `label-md` sub-header (spaced +10%). This high-contrast scale is what separates custom design from generic templates.

---

## 4. Elevation & Depth

We convey importance through **Tonal Layering** rather than structural lines or heavy shadows.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. A `surface-container-lowest` (#ffffff) element placed on a `surface` (#f5f6f7) background creates a natural, soft lift.
- **Ambient Shadows:** When an element must float (like a "Current Location" button), use a shadow with a large blur (30px+) and very low opacity (6%). The shadow color must be a tinted version of `on-surface` (#2c2f30) rather than pure black to keep the light feeling natural.
- **The "Ghost Border" Fallback:** If accessibility requirements demand a container edge, use the `outline-variant` (#abadae) at **15% opacity**. This creates a "suggestion" of a boundary without cluttering the visual field.

---

## 5. Components

### Buttons
- **Primary:** Rounded `full` (pill-shape). Background is the Indigo gradient. Text is `on_primary` (#f5f1ff).
- **Secondary:** Surface-tinted. No border. Use `surface-container-high` (#e0e3e4) with `primary` (#4b3fe2) text.
- **Interactive Feel:** On tap, buttons should scale down slightly (0.96) to provide a tactile, "physical" response.

### Cards (The "Spot" Card)
- **Radius:** `xl` (1.5rem/24px) for the outer container. 
- **Imagery:** Images must have a `md` (0.75rem) internal radius if nested, or be full-bleed to the top of the card.
- **Content:** No dividers. Use `body-md` for descriptions and `title-sm` for the spot name. Separate metadata (like "4.5 stars") using a 16px horizontal gap, not a vertical pipe `|`.

### Discovery Graph Nodes
- These represent "Intelligence." Use a `primary` (#4b3fe2) core with a 20% opacity `primary_container` (#9895ff) outer glow. These should feel like they are "pulsing" against the off-white background.

### Input Fields
- **Style:** Minimalist. No bottom line or box. Use a `surface-container-low` (#eff1f2) rounded box (`lg`) with `on_surface_variant` (#595c5d) for placeholder text. The cursor should always be `primary` (#4b3fe2).

---

## 6. Do's and Don'ts

### Do
- **Do** use "oversized" imagery. Let photos of spots take up 40% of the screen real estate.
- **Do** use whitespace as a functional tool. If two sections feel too close, double the padding instead of adding a line.
- **Do** utilize the `xl` (1.5rem) corner radius for main UI containers to reinforce the "Soft Modern" aesthetic.

### Don't
- **Don't** use standard "Drop Shadows" (e.g., 0px 4px 4px black). It kills the premium editorial feel.
- **Don't** use pure black (#000000) for text. Use `on_surface` (#2c2f30) to maintain tonal harmony.
- **Don't** use more than one "Electric Indigo" element as the focal point per screen. It is an accent, not a flood fill.
- **Don't** use icons with varying stroke weights. All line icons must stick to a consistent 1.5px or 2px weight.

---

## 7. Interaction Tone
Interactions in this design system should feel **fluid and intentional**. When a user selects a "Favorite Spot," the card should expand using a "shared element transition," where the image grows to become the header of the next screen. Avoid abrupt cuts; discovery should feel like a continuous journey.