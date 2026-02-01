import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "dark" | "accent";
  badge?: React.ReactNode;
}

const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  variant = "dark",
  badge,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const containerStyles = {
    dark: "bg-black border border-primary/30",
    accent: "bg-primary",
  };

  const headerStyles = {
    dark: "text-primary",
    accent: "text-primary-foreground",
  };

  return (
    <div className={cn("rounded-xl overflow-hidden", containerStyles[variant])}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 md:p-6 transition-colors",
          variant === "dark" ? "hover:bg-primary/5" : "hover:bg-primary-foreground/5"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5 md:w-6 md:h-6", headerStyles[variant])} />
          <h3 className={cn("font-display text-lg md:text-xl uppercase tracking-wide", headerStyles[variant])}>
            {title}
          </h3>
          {badge}
        </div>
        {isOpen ? (
          <ChevronUp className={cn("w-5 h-5", headerStyles[variant])} />
        ) : (
          <ChevronDown className={cn("w-5 h-5", headerStyles[variant])} />
        )}
      </button>

      {isOpen && (
        <div className={cn("px-4 pb-4 md:px-6 md:pb-6", variant === "dark" ? "" : "")}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
