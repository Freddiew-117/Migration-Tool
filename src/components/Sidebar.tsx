import { ChevronDown, Home, ShoppingCart, ArrowRightLeft, Hammer, User, Coins, Leaf, Shield, Menu, X } from "lucide-react";
import { IncubatorAccessButton } from "@/components/incubator/IncubatorAccessButton";
import { WalletConnection } from "@/components/WalletConnection";
import { MigrationPortalModal } from "@/components/MigrationPortalModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ className, isOpen = false, onToggle }: SidebarProps) => {
  const [migrationExpanded, setMigrationExpanded] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}
      
      <div className={cn(
        "fixed left-0 top-0 w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col z-50",
        // Mobile: slide in from left, hidden by default
        isMobile && "transition-transform duration-300",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && isOpen && "translate-x-0",
        // Desktop: always visible
        !isMobile && "translate-x-0",
        className
      )}>
        {/* Mobile Header with Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <img 
                src="/image-uploads/770a6742-1cab-482e-b299-56d7d0b5ceab.png" 
                alt="Circularity Finance Logo" 
                className="w-6 h-6 rounded-full object-cover"
              />
              <h1 className="text-sm font-semibold text-sidebar-foreground">Circularity Finance</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-hover-text"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Desktop Logo */}
        {!isMobile && (
          <div className="p-6 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src="/image-uploads/770a6742-1cab-482e-b299-56d7d0b5ceab.png" 
                alt="Circularity Finance Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <h1 className="text-lg font-semibold text-sidebar-foreground">Circularity Finance</h1>
            </div>
          </div>
        )}

      {/* Navigation - Scrollable */}
      <ScrollArea className="flex-1">
        <nav className="px-3 py-4">
          {/* Micro-Economy Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground cursor-pointer">
              <span>Micro-Economy</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="ml-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-hover-text"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-hover-text",
                  location.pathname === "/dashboard" && "bg-sidebar-accent"
                )}
                onClick={() => navigate("/dashboard")}
              >
                <User className="w-4 h-4 mr-2" />
                Access Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-hover-text"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                SaaS Marketplace
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-hover-text"
                onClick={() => setMigrationModalOpen(true)}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Migration Portal
              </Button>
            </div>
          </div>

          {/* CIFI Tools Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground cursor-pointer">
              <span>CIFI Tools</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="ml-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-hover-text"
                onClick={() => window.open('https://www.buildwithcifi.xyz', '_blank')}
              >
                <Hammer className="w-4 h-4 mr-2" />
                Build With CIFI
              </Button>
            </div>
          </div>
        </nav>
      </ScrollArea>

      {/* Bottom Section - Fixed */}
      <div className="p-3 border-t border-sidebar-border space-y-2 shrink-0">
        {user ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-sm text-sidebar-foreground font-mono">
              {user.email?.substring(0, 10)}...
            </span>
            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground text-center">
            {/* Hidden for clean UI */}
          </div>
        )}
        
        <WalletConnection />
        
        <IncubatorAccessButton className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground" />
        
        {isSuperAdmin && (
          <Button
            className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate("/admin")}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}
        
        {user && (
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-sidebar-hover-text"
          onClick={handleAuthAction}
        >
            Sign Out
          </Button>
        )}
      </div>
      
      <MigrationPortalModal 
        open={migrationModalOpen} 
        onOpenChange={setMigrationModalOpen} 
      />
    </div>
    </>
  );
};