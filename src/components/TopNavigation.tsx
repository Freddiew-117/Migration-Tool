import { Button } from "@/components/ui/button";
import { HelpCircle, Sun, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SwapModal } from "@/components/SwapModal";
import { SupportModal } from "@/components/SupportModal";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnreadSupportMessages } from "@/hooks/useUnreadSupportMessages";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  onMenuToggle?: () => void;
}

export const TopNavigation = ({ onMenuToggle }: TopNavigationProps) => {
  const { user, userRole } = useAuth();
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { hasUnread } = useUnreadSupportMessages();

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="text-foreground hover:bg-accent"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
      
      {/* Desktop: Spacer */}
      {!isMobile && <div className="flex-1" />}
      
      <div className={cn(
        "flex items-center gap-2",
        isMobile ? "flex-1 justify-center" : "gap-4"
      )}>
        {/* Hide user info on mobile to save space */}
        {!isMobile && user && (
          <span className="text-sm text-foreground font-medium">
            {userRole === 'super_admin' ? 'Super Admin' : userRole || 'User'}
          </span>
        )}
        {!isMobile && (
          <span className="text-sm text-muted-foreground">
            {user?.email || 'Welcome to the Circularity Finance Micro-Economy Platform'}
          </span>
        )}
        
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"}
          className={cn(
            "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
            isMobile && "min-h-[44px] px-3" // Touch-friendly size
          )}
          onClick={() => setIsSwapModalOpen(true)}
        >
          {isMobile ? "$ Buy/Sell" : "$ Buy / Sell"}
        </Button>
        
        {!isMobile && (
          <Button variant="ghost" size="sm">
            <Sun className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Help Button - Always visible but positioned differently */}
      <div className={cn(
        isMobile ? "fixed bottom-4 right-4 z-50" : "fixed bottom-4 right-4 z-50"
      )}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-muted-foreground relative",
            isMobile && "min-h-[44px] shadow-lg bg-background border border-border"
          )}
          onClick={() => setIsSupportModalOpen(true)}
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          {!isMobile && "Help"}
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
          )}
        </Button>
      </div>
      
      <SwapModal 
        isOpen={isSwapModalOpen} 
        onClose={() => setIsSwapModalOpen(false)} 
      />
      
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </div>
  );
};