import React from "react";
import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import App from "./App.tsx";
import "./index.css";

// Initialize PostHog only if key is available
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    
    // Privacy settings
    person_profiles: "identified_only",
    autocapture: false,  // Disabled to avoid capturing sensitive clicks
    capture_pageview: false,  // Manual capture via router
    capture_pageleave: true,
    
    // Session replay with targeted masking
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      // Mask only sensitive areas using data attributes
      maskTextSelector: "[data-ph-mask]",
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);
