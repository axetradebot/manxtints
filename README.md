# ManxTints LTD - Premium Window Tinting

A modern, beautiful website for ManxTints LTD, the Isle of Man's premier window tinting service.

![ManxTints Preview](https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80)

## ✨ Features

- **Modern Stack**: Next.js 14+, TypeScript, Tailwind CSS
- **Beautiful UI**: shadcn/ui components with custom styling
- **Smooth Animations**: Framer Motion for lively, breathing interactions
- **Responsive Design**: Mobile-first, gorgeous on all devices
- **Dark Mode**: Premium dark theme with electric teal accents

### Pages

- 🏠 **Home** - Hero, services showcase, testimonials, CTAs
- 🔧 **Services** - Automotive, Residential, Commercial tinting details
- 📷 **Gallery** - Masonry grid with lightbox
- 👤 **About** - Company story, values, timeline
- 📝 **Quote** - Two flows:
  - Request free home/vehicle visit
  - DIY measurement calculator with instant estimates
- 📞 **Contact** - Form, map, contact details

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Project Structure

```
src/
├── app/
│   ├── about/          # About page
│   ├── contact/        # Contact page
│   ├── gallery/        # Gallery page
│   ├── privacy/        # Privacy policy
│   ├── quote/          # Quote request + calculator
│   ├── services/       # Services page
│   ├── terms/          # Terms of service
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── footer.tsx      # Site footer
│   ├── motion.tsx      # Animation components
│   └── navigation.tsx  # Site navigation
└── lib/
    └── utils.ts        # Utility functions

public/
└── gallery/
    ├── automotive/     # Add automotive images here
    ├── residential/    # Add residential images here
    └── commercial/     # Add commercial images here
```

## 🖼️ Adding Gallery Images

To add new photos to the gallery:

1. Drop your images into the appropriate folder:
   - `/public/gallery/automotive/` - Vehicle tinting photos
   - `/public/gallery/residential/` - Home tinting photos
   - `/public/gallery/commercial/` - Commercial tinting photos

2. Update the `galleryItems` array in `src/app/gallery/gallery-client.tsx`:

```typescript
{
  src: "/gallery/automotive/your-image.jpg",
  category: "automotive",
  title: "Brief title",
  description: "Optional description",
}
```

**Supported formats**: JPG, PNG, WebP
**Recommended size**: 1200x800 or similar aspect ratio

### Instagram feed ("View our latest work on Instagram")

The gallery page ends with the latest posts from
[@manxtintsltd](https://www.instagram.com/manxtintsltd). Instagram's public
profile page can't be scraped (it's login-walled and against their terms), so
the site uses the official **Instagram API with Instagram Login** and caches
the result for an hour (`revalidate = 3600` in `src/app/gallery/page.tsx`).

Without a token the section still renders as a "Follow @manxtintsltd" card, so
nothing breaks — you just don't get live thumbnails.

**One-off setup (~10 min):**

1. The Instagram account must be a **Business** or **Creator** account
   (Instagram → Settings → Account type and tools).
2. Go to [developers.facebook.com](https://developers.facebook.com) → *Create app*
   → use case *Other* → type *Business* → add the **Instagram** product →
   *API setup with Instagram login*.
3. Under *Generate access tokens*, add @manxtintsltd as an Instagram tester,
   then accept the invite in Instagram → *Settings → Apps and websites → Tester invites*.
4. Click *Generate token*, log in as the account, and copy the **long-lived** token.
5. Set `INSTAGRAM_ACCESS_TOKEN` in `.env.local` (and in Vercel → Project → Settings →
   Environment Variables) and redeploy.

**Keeping it alive:** long-lived tokens last 60 days. To refresh (any time after
the token is 24h old), open

```
https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<current token>
```

and replace the env var with the returned token. Set a calendar reminder for
every ~50 days, or wire the same GET into a Vercel cron that writes to your env.
Only the account's own posts are shown; captions are used for alt text and
hover text, and every tile links back to the post on Instagram.

## 🎨 Customization

### Colors

Edit the CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: 175 84% 50%;      /* Electric teal */
  --background: 0 0% 3%;        /* Deep black */
  /* ... more variables */
}
```

### Contact Info

Update contact details in:
- `src/components/navigation.tsx`
- `src/components/footer.tsx`
- `src/app/contact/page.tsx`

### Form Submissions

Leads are posted as JSON to `NEXT_PUBLIC_LEAD_ENDPOINT` (StartMyPatch) with a Formspree
fallback at `NEXT_PUBLIC_LEAD_FALLBACK` — see `src/lib/submitLead.ts` and `.env.example`.

## 📍 Regional pricing (zones)

Installer rates differ by region, so every price on the site is read from a **pricing zone**
in `src/lib/pricing.zones.ts` — the single place to edit rates:

| Zone key | Label               | Films                         | Postcode areas                                      |
|----------|---------------------|-------------------------------|-----------------------------------------------------|
| `iom`    | Isle of Man         | One film, £99/m²              | IM. Also Vercel country `IM`                        |
| `north`  | North West          | Standard £99 / Premium £125   | M SK WA WN BL OL L CH CW PR BB FY LA ST CA, and any other UK postcode |
| `se`     | South East & London | Standard £135 / Premium £165  | SL RG GU KT SM TW HA UB WD AL HP OX RH CR BR DA EN IG RM SW W NW N E EC WC SE |

`?zone=standard` is a legacy alias for `north`. The Isle of Man film is the dual-reflective privacy film, shown without a Premium label, with a 5-year guarantee and the 10-year upsell. North West and South East keep the tier step.

Conservatory has its own per-tier rates (`rates.conservatory`) and commercial a single rate
(`rates.commercial`). The calculator maths is zone-independent and lives in `src/lib/pricing.ts`:

> window prices at the tier's zone rate → £10 window floor → sum → 10% DIY discount → voucher
> (if any) → £100 job floor → **10-year guarantee = max(£29, 10% of that total)** → final.

### Film tiers (Standard / Premium)

Residential and conservatory jobs choose between two films, defined in `tiers` in
`src/lib/pricing.zones.ts` (label, film name, tagline, bullets, guarantee years, badge):

- **Standard — Silver 20.** Mirror privacy by day, 5-year guarantee included. The 10-year
  guarantee is offered as an add-on on the quote screen, always as a pound figure
  ("Extend your guarantee to 10 years — £37.42").
- **Premium — Reflective Privacy 20.** Clear view from inside, higher heat rejection,
  10-year guarantee included (no upsell). Carries the "Most popular" badge.

The calculator's **film step** sits after the window measurements and before any total is shown.
Commercial skips it, and so does the Isle of Man (one film, no comparison). `?tier=premium|standard`
pre-selects a card in a two-tier zone but never skips the step.
The same `TierCards` component renders the "Two films. One simple choice." section on
`/services`, whose CTAs link to `/quote?tier=premium` and `/quote?tier=standard`.

Leads record the tier in the service (`DIY Calculator — Residential (Premium)`) and the quote
line, e.g. `Quote: £411.64 incl. 10% DIY discount + 10-year guarantee £37.42. 1 window(s),
4.20m² @ £99/m² (Isle of Man & North). Film: Standard (Silver 20).`

### How the zone is resolved

Implemented once in `src/proxy.ts` (server) + `src/components/zone/zone-provider.tsx` (client, `useZone()`):

1. **URL param** `?zone=iom|north|se` (`standard` means `north`) — wins, and is saved to the 30-day functional cookie `mt_zone`.
2. **Stored choice** — the `mt_zone` cookie (set by a param, the zone chip, or the postcode check).
3. **IP default** — Vercel geo headers (`x-vercel-ip-country/-region/-city/-latitude/-longitude`)
   mapped via `zoneFromGeo()`. Only a default: it is flagged `source: "ip"` and the chip is always shown.
4. **Fallback** — `north`.

The **zone chip** ("Prices for {area} · Change") appears wherever a price is displayed: calculator
header and summary, services cards and price guide, pricing FAQ, and the chat assistant's answers.
Changing it re-renders every price and recalculates an open quote live.

### Postcode reconfirmation (legal keystone)

At the final quote step the postcode's outward code is mapped with `zoneFromPostcode()`. If it
differs from the displayed zone, the customer sees "Your postcode is in the {area} area — prices
updated." with the old total struck through and the new total shown, and **Book Installation is
disabled until the new total has rendered**. The corrected zone is persisted. Unmapped/invalid
postcodes keep the displayed zone and add "We'll confirm your area's pricing with your quote."
to the lead. Every lead's quote line ends with the zone, e.g.
`Quote: £412.00 incl. 10% DIY discount. 2 window(s), 4.20m² @ £99/m² (North West)`.

### Ad links per region

Use these as the landing URL for each regional ad set — the zone is applied before first paint.
The Isle of Man campaign should include `?zone=iom` even though an Isle of Man IP (country `IM`) already resolves there.

- **Isle of Man:** `https://manxtints.com/quote?zone=iom`
- **North West:** `https://manxtints.com/quote?zone=north`
- **South East & London:** `https://manxtints.com/quote?zone=se`

Any page accepts the param (e.g. `/services?zone=se`).

### Analytics

`calc_price_shown` and `calc_submitted` carry `zone`, `zoneSource`, `tier` (null for commercial),
`guarantee_added` and `guarantee_included`; `tier_selected` fires when the film is changed. The
`/admin` dashboard has a "Conversion by pricing zone" table, zone and film-tier filters on the price
drop-off report (`/admin?days=30&zone=se&tier=premium`), and "Premium take rate" / "Guarantee take
rate" stats.

### Local testing of the IP default

```bash
# SE default (chip visible, source "ip")
curl -s -H "x-vercel-ip-country: GB" -H "x-vercel-ip-city: Slough" http://localhost:3000/quote | grep -o 'Prices for [^<]*'
# Non-SE → north (Manchester) or iom (country IM)
curl -s -H "x-vercel-ip-country: GB" -H "x-vercel-ip-city: Manchester" http://localhost:3000/quote | grep -o 'Prices for [^<]*'
```

## 🌐 Deployment to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

That's it! Vercel will automatically:
- Detect Next.js
- Build your project
- Deploy to a global CDN
- Provide a `.vercel.app` domain

### Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `manxtints.im`)
4. Update DNS records as instructed

## 📄 License

© 2026 ManxTints LTD. All rights reserved.

---

Built with ❤️ for the Isle of Man
