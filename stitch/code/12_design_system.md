# Sport Match Hub Design System

Source: Stitch project `13714619359720314732` / asset `assets/f64ae6ab4d9849139cce5a5e613a5e3d`

## Overview

The visual system is designed for an energetic, professional sports community app. It uses a clean light UI, a strong orange accent, and bold Lexend headings to keep the experience fast, readable, and action-oriented.

## Core Theme

```yaml
bodyFont: INTER
headlineFont: LEXEND
labelFont: INTER
colorMode: LIGHT
colorVariant: FIDELITY
customColor: "#FF6B00"
overrideNeutralColor: "#F8FAFC"
overridePrimaryColor: "#FF6B00"
overrideSecondaryColor: "#0F172A"
overrideTertiaryColor: "#64748B"
roundness: ROUND_EIGHT
```

## Brand Colors

```yaml
primary: "#a04100"
primaryContainer: "#ff6b00"
onPrimary: "#ffffff"
onPrimaryContainer: "#572000"
secondary: "#565e74"
secondaryContainer: "#dae2fd"
tertiary: "#505f76"
tertiaryContainer: "#8a9ab2"
background: "#f7f9fb"
surface: "#f7f9fb"
surfaceContainerLowest: "#ffffff"
surfaceContainerLow: "#f2f4f6"
surfaceContainer: "#eceef0"
surfaceContainerHigh: "#e6e8ea"
surfaceContainerHighest: "#e0e3e5"
onSurface: "#191c1e"
onSurfaceVariant: "#5a4136"
outline: "#8e7164"
outlineVariant: "#e2bfb0"
error: "#ba1a1a"
onError: "#ffffff"
```

## Typography

```yaml
h1:
  fontFamily: Lexend
  fontSize: 40px
  fontWeight: 700
  lineHeight: 1.2
  letterSpacing: -0.02em
h2:
  fontFamily: Lexend
  fontSize: 32px
  fontWeight: 700
  lineHeight: 1.2
  letterSpacing: -0.01em
h3:
  fontFamily: Lexend
  fontSize: 24px
  fontWeight: 600
  lineHeight: 1.3
body-lg:
  fontFamily: Inter
  fontSize: 18px
  fontWeight: 400
  lineHeight: 1.6
body-md:
  fontFamily: Inter
  fontSize: 16px
  fontWeight: 400
  lineHeight: 1.6
label-md:
  fontFamily: Inter
  fontSize: 14px
  fontWeight: 600
  lineHeight: 1
  letterSpacing: 0.05em
rating-num:
  fontFamily: Lexend
  fontSize: 20px
  fontWeight: 700
  lineHeight: 1
```

## Spacing And Shape

```yaml
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
```

## Style Guidelines

- Keep layouts clean, minimalist, and energetic.
- Use orange for primary actions and brand recognition.
- Prefer Lexend for headings and key numbers, Inter for body and labels.
- Use generous whitespace and a strong hierarchy to keep dense sports data readable.
- Keep cards white with soft ambient shadows and rounded corners.
- Use pill-shaped chips and buttons for interactive elements.
- Show player ratings as a numeric score with a single star rather than a crowded star row.
- Keep inputs light and focused, with orange emphasis on active states.

## Component Notes

- Buttons: solid orange primary buttons with white text; light bordered secondary buttons.
- Cards: white background, subtle shadow, at least 20px internal padding.
- Chips: light orange tint with dark orange text.
- Inputs: light gray fill by default, white with orange focus border when active.
