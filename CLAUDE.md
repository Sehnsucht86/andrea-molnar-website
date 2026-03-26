# Andrea Molnár - Personal Branding Website

## Project Overview
Single-page personal branding website for Andrea Molnár. Bilingual (HU/EN), warm/creative art therapy-inspired design. Built with plain HTML + CSS + JS (no framework, no build step).

## Tech Stack
- **HTML5** - `index.html` (single page, all sections)
- **CSS3** - `style.css` (CSS custom properties, mobile-first)
- **Vanilla JS** - `main.js` (i18n, form, animations)
- **No dependencies** - no npm, no build tools

## File Structure
```
index.html          - The entire website
style.css           - All styles
main.js             - Language switching, form validation, animations
i18n/hu.json        - Hungarian translations
i18n/en.json        - English translations
assets/images/      - Images (hero, projects, favicon)
Andrea_Molnár_CV.pdf - Downloadable CV
```

## i18n System
- HTML elements use `data-i18n="key"` attributes
- `data-i18n-placeholder` for input placeholders
- Translations in `i18n/*.json` files
- Language preference saved in `localStorage`
- Default language: Hungarian

## Color Palette
- Primary (terracotta): `#C17B5E`
- Secondary (sage green): `#8FAE8B`
- Accent (gold): `#D4A843`
- Background (cream): `#FAF6F1`
- Text (warm brown): `#3D3229`

## Newsletter Form
- Frontend validation only (Phase 1)
- Supabase integration prepared as commented code in `main.js`
- See `main.js` comments for Phase 2 backend setup instructions

## Deployment
- Netlify drag & drop (no build step needed)
- Or GitHub Pages

## How to Edit Content
1. Text content: edit the corresponding key in `i18n/hu.json` and `i18n/en.json`
2. New section: add `<section>` in `index.html`, styles in `style.css`, translations in both JSON files
3. Images: add to `assets/images/`, reference in HTML

## Owner
Andrea Molnár - not a developer. Keep everything simple and well-documented.
