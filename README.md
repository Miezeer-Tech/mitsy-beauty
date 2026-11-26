# Mitsy Beauty: lip stain preview site

A single-page, Apple-style scroll experience for **Mitsy Beauty**, plus a demo bag and dummy checkout. **This is a preview build.** Shade stories, retail prices, contact links and a live payment provider are still pending.

- Live preview: https://miezeer-tech.github.io/mitsy-beauty/
- Stack: static `index.html`, `checkout.html`, `order-confirmation.html` + `css/` + `js/` + `img/`. GSAP 3.12.5 + ScrollTrigger, plus Lenis 1.1.13, loaded from the jsDelivr CDN. There is no build step.

## Brand tokens
Tokens follow the Mitsy Beauty brand guidelines v1.0 (draft, November 2026). The previous preview palette is commented at the top of `css/style.css` if you need to revert.

| Token | Value | Use |
|---|---|---|
| Boot Pink (primary) | `#F977B6` | Packaging, caps, hero colour. **Text on this pink is Ink, never white.** |
| Couture Pink (deep) | `#C21A6E` | Links, solid buttons, BEAUTY in the primary lockup. White text is fine on it. |
| Blush | `#FDE4F0` | Light tint (demo banner) |
| Ink | `#140A0D` | Logo and all text on light or Boot Pink |
| Cream | `#FFF8F3` | Page background |
| White | `#FFFFFF` | |
| Amber Silk | `#B5502F` | Shade 01 |
| Rose Velour | `#A5363B` | Shade 02 |
| Cocoa Noir | `#4C1A08` | Shade 03 |
| Berry Couture | `#B02434` | Shade 04 |

Fonts are Bodoni Moda (display) and Manrope (body), both from Google Fonts, as specified in the guidelines. Logo files in `img/logo-mitsy-*.svg` are from the brand package (outlined, no font required).

## Demo bag and checkout
The site has a working client-side cart and a dummy checkout. **No payment is taken and no form data is sent to a server.**

1. **Add to bag** on each shade (the scroll section and the collection cards).
2. The bag is a slide-out drawer: quantity, remove, subtotal. The count badge lives in the header. The bag is saved in `localStorage` under `mitsy-demo-cart`.
3. **Checkout** (`checkout.html`) collects contact, shipping address, a shipping option and fake card fields. Any card number is accepted (try `4242 4242 4242 4242`). A banner states that this is a demo.
4. **Place order** writes a fake order to `sessionStorage`, clears the bag, and opens `order-confirmation.html` with an order number such as `MITSY-XXXXXX` and a summary.
5. Sample price is **$24** per lip stain. Sample shipping is **$5** standard and **$12** express. All three are labelled as samples.

### Adding real Stripe Payment Links later
Each product in `js/products.js` has a `stripeLink` field, currently `""` and unused. When you are ready to take real payment:

1. In the [Stripe Dashboard](https://dashboard.stripe.com/payment-links), create a Payment Link for each shade (price, currency, after-payment redirect).
2. Set the after-payment redirect to `https://miezeer-tech.github.io/mitsy-beauty/order-confirmation.html` (or a dedicated thank-you page).
3. Paste each link into the matching `stripeLink` value in `js/products.js`. Wiring those links up as a live checkout is a later step — this preview uses the demo cart only.

## Sections and motion
1. **Hero (pinned):** monumental “Mitsy” type, the collection cutout overlapping it, four short facts in the corners, and one frosted control dock (sample price, shade dots, Shop the shades). The cutout floats and takes a single light sweep on load. Scroll scales the product slightly.
2. **The shades (pinned):** the four bottles rise one by one. As each takes focus, the background shifts to that shade, and the name, swatch, copy and **Add to bag** button swap in.
3. **Swatch crop:** a full-bleed detail of the four swatches, with a small caption.
4. **The swipe (pinned):** the cap and wand lift out of the open Berry Couture bottle and a shade stroke draws across the screen, tied to scroll through `stroke-dashoffset`.
5. **Brand line (pinned):** “Color that speaks before you do.” (from the brand guidelines) lights from faded to solid.
6. **Facts:** a hairline table of verifiable product facts, with footnotes.
7. **Collection:** four shade cards with sample prices and Add to bag. Cards may tilt on hover (fine pointers only).
8. **Convert + footer:** name, sample price and a shop button between hairlines, then an edge-to-edge MITSY wordmark on Ink.

Only `transform` and `opacity` are animated, plus the hero corner-radius-free cutout, the SVG stroke offset, and a single `backdrop-filter` on the hero dock.
**Reduced motion / no JS:** with `prefers-reduced-motion: reduce`, or if the CDN scripts fail, there is no pinning and no smooth scroll. Everything shows as a static, fully readable page. The bag and checkout still work.

## Images
The hero pack shot is Mike’s Boot Pink recolour of the client product photograph (`img/mitsy-hero-*.{webp,jpg}`, cutout `img/hero-cutout.webp`). Bottle and wand cutouts keep the original liquid colour; only the caps were shifted to Boot Pink. Swatches are from the original photo. No stock photos are used.

## Still needed before a real launch
| Item | Status |
|---|---|
| Retail prices | Sample $24 only — replace in `js/products.js` |
| Shipping rates | Sample $5 / $12 — replace in `js/products.js` |
| Shade stories / product copy | Names are from the boxes; longer copy is still pending |
| A real review, if you want one on the page | Not invented; section omitted |
| Contact, Instagram, Privacy URLs | Footer links are still `#` |
| Live payments | Demo checkout only; `stripeLink` is reserved |
| Email list | Not connected (and not shown on this preview) |
| Indexing | `<meta name="robots" content="noindex">` is set. Remove it at launch |
| Domain | `og:image` still points at the GitHub Pages URL |
