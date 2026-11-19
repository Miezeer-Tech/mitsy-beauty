# Mitsy Beauty: lip color preview site

A single-page, Apple-style scroll experience for **Mitsy Beauty**. **This is a preview build.** All the copy, shade names and links are placeholders until the client approves them.

- Live preview: https://miezeer-tech.github.io/mitsy-beauty/
- Stack: static `index.html` + `css/` + `js/` + `img/`. GSAP 3.12.5 + ScrollTrigger, plus Lenis 1.1.13 for smooth scrolling, all loaded from the jsDelivr CDN. There is no build step.

## Brand tokens
| Token | Value | Source |
|---|---|---|
| Base pink | `#DE033F` | sampled from the "Lip Color" box in the product photo |
| Pink highlight | `#E70345` | sampled from the bottle caps |
| Accent | `#FFFFFF` | |
| Ink (logo/text on light) | `#140A0D` | |
| Studio blush | `#F9EAE9` | sampled from the photo background |
| Shade 01 | `#BB4726` | terracotta bottle/swatch |
| Shade 02 | `#B7374A` | dusty rose bottle/swatch |
| Shade 03 | `#5A1A0B` | chocolate bottle/swatch |
| Shade 04 | `#A8052A` | berry bottle/swatch |

Fonts are Bodoni Moda (display) and Manrope (body), both from Google Fonts.
The **Mitsy** script is a vector trace of the real logo printed on the product box (`img/logo-mitsy.svg`). It is not a font. "BEAUTY" is set as live text to match.

## Sections and motion
1. **Hero (pinned)**: the white Mitsy logo sits on the pink. The product photo grows from a rounded card on the right third to full-bleed, the logo lifts and fades, and "Lip Color" slides in.
2. **Meet the shades (pinned)**: the four real bottles rise one by one with a slight rotation. As each bottle takes focus, the background shifts to its shade, and the shade number, name, swatch and copy swap in. At the end the background returns to Mitsy pink.
3. **The swipe (pinned)**: the cap and wand lift out of the open berry bottle and tilt. A berry SVG stroke draws across the screen, tied to scroll through `stroke-dashoffset`.
4. **Statement (pinned)**: each word of "Color that speaks before you do." lights from faded to solid white.
5. **Collection**: the heading sits on the left third and four shade cards fill the right two-thirds. The cards tilt in 3D on hover.
6. **Closing**: the full product image, the logo, an email sign-up and the footer.
7. **Global**: a sticky white nav that turns to frosted pink glass on scroll, and a white scroll-progress bar.

Layout follows a rule-of-thirds grid: the product sits on one third and the copy on the opposite third.
Only `transform` and `opacity` are animated. The exceptions are the hero card's corner radius, the SVG stroke offset, and the nav's backdrop blur, which fades in through opacity.
**Reduced motion / no JS:** with `prefers-reduced-motion: reduce`, or if the CDN scripts fail, there is no pinning and no smooth scroll. Everything shows as a static, fully readable page.

## Images
Every image comes from the client's product photo (`img/mitsy-hero-*.{webp,jpg}`). The bottles, the wand and cap, and the swatches were cut out of it (`img/*.webp` with PNG fallback).
Note: bottle 04 (open, berry) had the cap overlapping its lower right corner in the photo, so its right half was mirrored from its left half to give a clean cut-out.
No stock photos are used.

## ⚠️ Placeholders to replace before launch
| Where | Placeholder | File |
|---|---|---|
| Shade names | "Terracotta", "Dusty Rose", "Cocoa", "Berry". These are descriptive names only, labelled "Placeholder name" / "(placeholder name)" on the page | `index.html` (shades section + collection cards) |
| Shade copy | "A … tone pulled straight from the Mitsy line. Final shade story coming soon." | `index.html` |
| Prices | "Price TBA" on every card | `index.html` |
| Shop buttons | all four `href="#"` and need real product URLs | `index.html` (`.card .btn`) |
| Nav "Join the list" | jumps to the sign-up on the page | — |
| Email sign-up | **visual only. It posts nowhere.** The JS shows a "preview" message. Connect it to Klaviyo, Mailchimp, Shopify, etc. | `index.html` `#signup`, `js/main.js` |
| Footer links | Instagram / Contact / Privacy all `href="#"` | `index.html` |
| Headlines & body copy | "Lip color in four shades, made to be seen.", "One pass. All color.", "Color that speaks before you do.", "Pick your shade.", "Be first to wear it." These are generic and make no product claims | `index.html` |
| Social image | `og:image` points at the GitHub Pages preview URL. Update it to the real domain | `index.html` |
| Indexing | `<meta name="robots" content="noindex">` is set while this is a preview. Remove it at launch | `index.html` |
