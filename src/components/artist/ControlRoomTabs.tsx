import { Home, DollarSign, Share2, QrCode, PartyPopper, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId = "home" | "get-paid" | "promote" | "check-in" | "after-party" | "edit-pass";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "get-paid", label: "Get Paid", icon: DollarSign },
  { id: "promote", label: "Promote", icon: Share2 },
  { id: "check-in", label: "Check-In", icon: QrCode },
  { id: "after-party", label: "After Party", icon: PartyPopper },
  { id: "edit-pass", label: "Edit Pass", icon: Pencil },
];

interface ControlRoomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const ControlRoomTabs = ({ activeTab, onTabChange }: ControlRoomTabsProps) => {
  return (
    <div className="bg-background border-b border-primary/20">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex overflow-x-auto scrollbar-hide gap-1.5 py-2 -mx-2 px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg font-sans font-medium text-sm whitespace-nowrap transition-all shrink-0",
                  "min-w-[100px] justify-center",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ControlRoomTabs;
