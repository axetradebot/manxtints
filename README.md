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

2. Update the `galleryImages` array in `src/app/gallery/page.tsx`:

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

Currently forms show success messages without actual submission. To connect to a real backend:

1. **Formspree**: Replace form action with your Formspree endpoint
2. **API Route**: Create `/api/contact` endpoint
3. **Email Service**: Integrate with SendGrid, Resend, etc.

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
