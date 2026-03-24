# WhiteBoard Video

Standalone browser-based whiteboard video recorder extracted from Cadegent.

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn-style UI components
- `@excalidraw/excalidraw` canvas
- Browser `MediaRecorder` + `CanvasCaptureMediaStream`
- 100% client-side (no backend)

## Features
- Excalidraw whiteboard canvas
- Webcam PiP with 6 layouts: `pip-br`, `pip-bl`, `pip-tr`, `pip-tl`, `side-by-side`, `board-only`
- Mic audio recording synced with board + webcam
- Output formats: landscape (16:9), portrait (9:16), square (1:1)
- Recording controls: start, pause, resume, stop, countdown, timer
- Download options: WebM + MP4 filename option
- Dark/light canvas toggle
- Template save/load/delete via `localStorage`
- Pages: landing (`/`), studio (`/studio`), pricing (`/pricing`)
- Post-recording Cadegent upsell CTA

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Build output is generated in `dist/`.

## Notes
- Recording is done in-browser using the codec supported by the user’s browser.
- MP4 selection is provided as a download target filename for compatibility with requested UX, while most browsers encode WebM media via MediaRecorder.
