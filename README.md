# Next.js + shadcn/ui Demo

A beautiful single-page demo application built with Next.js 15 and shadcn/ui components.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🧩 shadcn/ui components (Button, Card)
- 🎯 TypeScript for type safety
- 📱 Fully responsive design
- 🌓 Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Custom Domain

To deploy to `next.orossaraban.com`:

1. Configure DNS to point to your hosting provider
2. Set up the custom domain in your hosting dashboard
3. Ensure SSL/TLS certificates are configured

## Project Structure

```
next-shadcn-demo/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles with shadcn theming
├── components/
│   └── ui/              # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   └── utils.ts         # Utility functions (cn helper)
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind + shadcn theme config
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Tech Stack

- **Framework:** Next.js 15.1.4
- **React:** 19.0.0
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Language:** TypeScript

## Ready for Deployment

This project is production-ready and can be deployed to:
- Vercel
- Netlify
- Railway
- Any Node.js hosting platform

---

Built with ❤️ by the dev team
