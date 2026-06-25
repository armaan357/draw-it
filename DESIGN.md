---
name: "Draw-It"
description: "A simple whiteboard for sketching and collaboration"
colors:
	primary: "#6965db"
	bg-default: "#000000"
	bg-info: "#1D4ED8"
	bg-success: "#15803D"
	bg-attention: "#C2410C"
	bg-error: "#B91C1C"
	content-default: "#404040"
	content-inverted: "#FFFFFF"
	content-muted: "#A3A3A3"
	content-subtle: "#737373"
typography:
	display:
		fontFamily: "var(--font-geist-sans)"
	body:
		fontFamily: "var(--font-geist-sans)"
	mono:
		fontFamily: "var(--font-geist-mono)"
rounded:
	sm: "4px"
	md: "8px"
	lg: "16px"
spacing:
	sm: "8px"
	md: "16px"
	lg: "24px"
components:
	button-primary:
		backgroundColor: "{colors.primary}"
		textColor: "{colors.content-inverted}"
		rounded: "{rounded.md}"
		padding: "8px 16px"
---

<!-- MERGED: auto-extracted tokens added from scan; review below -->

# Design System: Draw-It

## 1. Overview

**Creative North Star:** "A friendly, minimal collaborative sketchbook"

Brand uses a restrained strategy: neutral surfaces with a single accent hue. This file was seeded from your answers and merged with tokens discovered in the codebase (local fonts and theme variables).

**Key Characteristics:**

- Minimal, creative, friendly
- Fast time-to-first-canvas and clear affordances
- Dark-first theme with strong contrast and accessible text

## 2. Colors

Palette character: restrained dark surfaces with a single primary accent.

### Primary

- **Accent** (#6965db): used for primary CTAs, active states, and presence indicators.

### Neutrals / UI

- **bg-default** (#000000): main page surface (dark default).
- **content-default** (#404040): default body/content ink when surfaced over light containers; on dark surfaces use `content-inverted`.
- **content-inverted** (#FFFFFF): primary text on dark surfaces.

### Feedback

- **bg-info** (#1D4ED8), **bg-success** (#15803D), **bg-attention** (#C2410C), **bg-error** (#B91C1C)

## 3. Typography

Display and body fonts are provided via local font variables in the app layout. Extracted families:

- `display`: `var(--font-geist-sans)`
- `body`: `var(--font-geist-sans)`
- `mono`: `var(--font-geist-mono)`

Character: neutral, functional; consider adding a serif for editorial headings if you want stronger contrast (seed requested serif headings, but code currently uses Geist local fonts).

## 4. Elevation

System: restrained tonal separation with subtle shadows for raised surfaces (see Tailwind `dropShadow.card-hover`). Surfaces are flat by default; use elevation for modal and interactive lift.

## 5. Components

Buttons

- **Primary**: background `{colors.primary}`, text `{colors.content-inverted}`, rounded `{rounded.md}`, padding `8px 16px`.

Inputs / Fields

- Use border or subtle surface contrast on dark background; ensure focus-visible uses an accessible outline (e.g., `2px solid {colors.primary}`).

Signature primitives in this repo are driven by Tailwind + CSS variables (see `packages/tailwind-config`). I can expand component snippets into `.impeccable/design.json` if you'd like.

## 6. Do's and Don'ts

### Do:

- Do prioritize clear affordances and minimal steps for drawing and sharing.
- Do meet WCAG 2.1 AA contrast targets for body text.

### Don't:

- Don't use gradient text or noisy purple-gradient marketing tropes.
- Don't use side-stripe borders as a primary visual accent.
