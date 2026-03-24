# WhiteBoard Video — Standalone App

## What This Is
A free standalone whiteboard video recording tool extracted from Cadegent's whiteboard studio. Users draw on a whiteboard while recording webcam + audio, producing professional explainer videos. Acts as a lead funnel to Cadegent.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS + Shadcn/ui
- @excalidraw/excalidraw (MIT) for drawing canvas
- Browser MediaRecorder API for video capture (NO server-side processing)
- No backend required for free tier — 100% client-side

## Core Features

### Free Tier (no auth needed)
1. **Excalidraw Drawing Canvas** — full drawing tools (pen, shapes, text, eraser, colors)
2. **Webcam PiP Recording** — picture-in-picture webcam overlay while drawing
   - 6 layouts: pip-br, pip-bl, pip-tr, pip-tl, side-by-side, board-only
3. **Audio Recording** — microphone capture synced with video
4. **3 Output Formats** — landscape (16:9), portrait (9:16), square (1:1)
5. **Recording Controls** — start, pause, resume, stop with timer display
6. **Countdown Timer** — 3-2-1 before recording starts
7. **Download as MP4/WebM** — direct browser download, no upload needed
8. **Dark/Light Canvas** — toggle background color
9. **Templates** — save/load whiteboard templates (localStorage)

### Upsell Banner (links to Cadegent)
- "Want AI-powered content from your videos? Try Cadegent →"
- Appears after recording, non-intrusive
- Teleprompter feature teased but locked: "Upgrade to Cadegent for built-in teleprompter"

## Pages
1. **/** — Landing page: hero + demo video + features + CTA
2. **/studio** — The whiteboard recording studio (main app)
3. **/pricing** — Simple comparison: Free vs Cadegent Pro

## UI/UX
- Clean, minimal — the canvas IS the app
- Top bar: format selector, layout selector, recording controls
- Left rail: drawing tools (from Excalidraw)
- Bottom: webcam preview (draggable PiP)
- After recording: preview player + download button + Cadegent upsell

## Key Implementation Notes
- ALL recording is client-side using MediaRecorder API
- Canvas compositing: use CanvasCaptureMediaStream to merge drawing + webcam
- No Remotion needed for free tier (that's the Cadegent upsell)
- No Supabase needed — everything is localStorage + browser APIs
- Mobile: hide webcam PiP, simplify to board-only recording

## File Structure
```
src/
├── components/
│   ├── landing/
│   │   └── HeroSection.tsx
│   ├── studio/
│   │   ├── WhiteboardCanvas.tsx    (Excalidraw wrapper)
│   │   ├── RecordingControls.tsx   (start/stop/pause/timer)
│   │   ├── WebcamPiP.tsx           (draggable webcam overlay)
│   │   ├── FormatSelector.tsx      (landscape/portrait/square)
│   │   ├── LayoutSelector.tsx      (PiP position options)
│   │   ├── ExportPanel.tsx         (download + upsell)
│   │   └── TemplateManager.tsx     (save/load templates)
│   └── ui/                         (shadcn components)
├── hooks/
│   ├── use-whiteboard-recorder.ts  (MediaRecorder + canvas compositing)
│   └── use-webcam.ts               (getUserMedia management)
├── pages/
│   ├── LandingPage.tsx
│   ├── StudioPage.tsx
│   └── PricingPage.tsx
├── lib/
│   └── utils.ts
├── App.tsx
└── main.tsx
```

## Deployment
- Vercel free tier (geauxluna@gmail.com) OR GitHub Pages
- No env vars needed — no backend
- Build: `npm run build` → static HTML/JS/CSS
