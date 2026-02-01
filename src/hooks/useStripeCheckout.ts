import { useState, useCallback } from "react";

interface UseStripeCheckoutReturn {
  checkoutUrl: string | null;
  showFallback: boolean;
  openCheckout: (url: string) => void;
  dismissFallback: () => void;
  reset: () => void;
}

/**
 * Hook to handle Stripe checkout with popup-blocking fallback.
 * Opens checkout in new tab, shows fallback banner if blocked.
 */
export function useStripeCheckout(): UseStripeCheckoutReturn {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const openCheckout = useCallback((url: string) => {
    setCheckoutUrl(url);
    
    // Attempt to open in new tab
    const newWindow = window.open(url, "_blank");
    
    // Always show fallback for mobile safety
    // On desktop, if popup succeeded, user can dismiss
    setShowFallback(true);
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      // Popup was definitely blocked - fallback is critical
      console.log("[useStripeCheckout] Popup blocked, fallback shown");
    } else {
      console.log("[useStripeCheckout] Popup opened, fallback available");
    }
  }, []);

  const dismissFallback = useCallback(() => {
    setShowFallback(false);
  }, []);

  const reset = useCallback(() => {
    setCheckoutUrl(null);
    setShowFallback(false);
  }, []);

  return {
    checkoutUrl,
    showFallback,
    openCheckout,
    dismissFallback,
    reset,
  };
}
