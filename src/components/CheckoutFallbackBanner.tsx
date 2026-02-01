import { ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutFallbackBannerProps {
  checkoutUrl: string | null;
  isVisible: boolean;
  onClose?: () => void;
}

/**
 * Universal fallback banner for Stripe checkout.
 * Shows when popup may have been blocked, providing a direct link.
 */
const CheckoutFallbackBanner = ({ 
  checkoutUrl, 
  isVisible,
  onClose 
}: CheckoutFallbackBannerProps) => {
  if (!isVisible || !checkoutUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t-2 border-primary shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-foreground font-medium text-sm">
              Payment opened in a new tab.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              If you don't see it, tap below to continue.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            asChild 
            className="flex-1"
            size="lg"
          >
            <a 
              href={checkoutUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue to Payment
            </a>
          </Button>
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="lg"
              onClick={onClose}
              className="px-4"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutFallbackBanner;
