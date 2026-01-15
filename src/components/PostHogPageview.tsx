import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";

/**
 * Component that captures SPA pageviews on route changes.
 * Sanitizes paths and query params to remove sensitive tokens.
 */
const PostHogPageview = () => {
  const location = useLocation();

  useEffect(() => {
    // Only capture if PostHog is initialized
    if (!import.meta.env.VITE_POSTHOG_KEY) return;

    // Sanitize path to remove sensitive tokens
    let sanitizedPath = location.pathname
      // Redact /verify/:token patterns
      .replace(/\/verify\/[^/]+/, "/verify/[REDACTED]")
      // Redact /qr/:token patterns
      .replace(/\/qr\/[^/]+/, "/qr/[REDACTED]")
      // Redact short link codes
      .replace(/\/q\/[^/]+/, "/q/[REDACTED]");

    // Sanitize search params to remove tokens
    let sanitizedSearch = location.search
      .replace(/token=[^&]+/g, "token=[REDACTED]")
      .replace(/qrToken=[^&]+/g, "qrToken=[REDACTED]")
      .replace(/artist_token=[^&]+/g, "artist_token=[REDACTED]")
      .replace(/ADMIN_KEY=[^&]+/g, "ADMIN_KEY=[REDACTED]");

    posthog.capture("$pageview", {
      path: sanitizedPath,
      search: sanitizedSearch || undefined,
    });
  }, [location.pathname, location.search]);

  return null;
};

export default PostHogPageview;
