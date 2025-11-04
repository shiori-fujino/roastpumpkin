# Cyberpunk Agency Website 🔥⚡

Neo-Tokyo themed model agency website with cyberpunk aesthetics.

## Features

### 🎨 Design
- **Neo-Tokyo Cyberpunk** aesthetic
- **Neon colors**: Hot Pink, Cyan, Purple, Red, Electric Blue, Acid Green
- **Smooth animations** and glow effects
- **Mobile-first** responsive design

### 📱 Sections

#### 1. Banner Swipe (Section 1)
- Fullscreen 100vh portrait banners
- Horizontal swipe navigation
- Auto-swipe every 7 seconds
- Neon glow effects on active slide

#### 2. Roster Grid (Section 2)
- **2x3 grid** layout (6 girls per screen)
- Each thumbnail: **50vw** (fills mobile width)
- **Batch swiping** (swipe to see next 6)
- **Today/Tomorrow tabs** (Tomorrow releases at 7 PM)
- **Filters**:
  - By nationality
  - Show available only
- **Availability indicators**:
  - "AVAILABLE NOW" badge (green glow)
  - "NEXT: XX:XX PM" badge
- **NEW badges** for new models
- Progress dots and page counter

#### 3. Our Girls Carousel (Section 3)
- **3D card stack effect** with perspective
- See current card + partial view of 2-3 behind
- **Netflix-style** horizontal scroll at bottom
- All models from JSON
- Swipe navigation
- Service badges (CIM, DFK, Filming)

### ⚡ Effects
- **Vertical snap scroll** between sections
- **Neon glow trails** on swipes
- **Cyberpunk grid background**
- **Smooth transitions**
- **Hover effects** with scale and brightness

## Tech Stack
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Lucide Icons

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
cyberpunk-agency/
├── src/
│   ├── components/
│   │   ├── BannerSwipe.tsx      # Section 1
│   │   ├── RosterGrid.tsx       # Section 2
│   │   ├── GirlsCarousel.tsx    # Section 3
│   │   └── Layout.tsx           # Footer
│   ├── data/
│   │   └── data.json            # Girls data + banners
│   ├── App.tsx
│   ├── Homepage.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Future Features (To Add Later)
- [ ] Individual model profile pages
- [ ] Rates page
- [ ] Contact page
- [ ] Navigation bar
- [ ] Age verification modal (optional)

## Color Palette
- Pink: `#ff00ff`
- Cyan: `#00ffff`
- Purple: `#a855f7`
- Blue: `#3b82f6`
- Red: `#ef4444`
- Green: `#00ff00`

## Typography
- Headings: **Orbitron** (cyberpunk tech font)
- Body: **Rajdhani** (clean readable sans-serif)

---

🔥 **Neo-Tokyo Awaits** ⚡
