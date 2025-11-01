# Color Burst: 20-Level Bubble Shooter

Color Burst is a fully client-side bubble shooter written with Next.js 16, React 19, and Tailwind CSS. It delivers a 20-level arcade campaign with escalating mechanics, combo scoring, and a polished HUD that’s ready to ship to Vercel.

## ✨ Features

- **20 handcrafted stages** that match the provided design brief (tutorial → expert boss).
- **8 bubble colors** with rainbow wilds, bombs, freeze shots, aim-boosters, and gray obstacles.
- **Dynamic difficulty hooks** including moving rows, wall bounces, random color spikes, timed challenges, and speed bursts.
- **Responsive canvas renderer** with neon gradients, power-up indicators, and animated shooter cannon.
- **HUD & Progression**: score tracker, combo counter, time attack timer, lives, and feature badges.

## 🎮 Controls

- **Aim** with mouse / touch (move pointer across the canvas).
- **Shoot** with left click / tap / spacebar.
- **Power-ups** trigger automatically when their bubble lands.

## 🧱 Project Structure

```
src/
  app/
    components/
      BubbleShooter.tsx   # Main game canvas & controller
    page.tsx              # Renders the bubble shooter page
  lib/
    game-types.ts         # Shared constants & TypeScript types
    grid.ts               # Grid math helpers
    levels.ts             # 20-level campaign definitions
public/
  ...                     # Favicon & static assets
```

## 🚀 Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## ✅ Production Build

```bash
npm run lint   # ESLint (React 19 rules)
npm run build  # Next.js production build
```

## 📦 Deployment

The project is designed for Vercel. After validating locally:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-2cf89a69
```

Wait a few seconds for DNS propagation, then verify:

```bash
curl https://agentic-2cf89a69.vercel.app
```

## 🛠️ Customization Ideas

- Add audio toggle / volume controls.
- Wire up persistent user profiles & leaderboards.
- Extend with daily challenge seeds or endless survival mode.

Enjoy popping! 🎯
