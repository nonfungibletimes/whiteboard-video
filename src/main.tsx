import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "@excalidraw/excalidraw/index.css";

// Migration: clear corrupted localStorage data that contains serialized Maps
// which crash Excalidraw (collaborators.forEach is not a function)
try {
  const MIGRATION_KEY = "wb-migration-v2";
  if (!localStorage.getItem(MIGRATION_KEY)) {
    localStorage.removeItem("wb-video-slides-v1");
    localStorage.removeItem("wb-video-templates-v1");
    localStorage.setItem(MIGRATION_KEY, "1");
  }
} catch {
  // noop
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
