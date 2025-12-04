import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SecretAdminModal } from "@/components/SecretAdminModal";
import networkBackground from "@/assets/network-background.jpg";

export const HeroSection = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const navigate = useNavigate();

  // Reset click count after 10 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setClickCount(0);
      setShowAdminModal(true);
    }
  };

  return (
    <div 
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 relative"
      style={{
        backgroundImage: `url(${networkBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-background/80"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <img 
            src="/image-uploads/2cf21e07-c239-4978-82cb-a1aa3fe6f30e.png" 
            alt="CIFI Logo" 
            className="w-16 h-16 select-none"
            onClick={handleSecretClick}
            style={{ cursor: 'default' }}
            draggable={false}
          />
        </div>
        
        <div className="mb-4">
          <span className="text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-full border border-border">
            Chain Agnostic Micro-Economy Launchpad
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          CIFI Micro-Economy Tool
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Deploy enterprise grade smart contracts across 70+ blockchains. Experience the power 
          of DLT & create your own sovereign micro-economy with CIFI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-foreground/20 text-foreground hover:bg-foreground/10 px-8 py-4 text-lg"
          >
            Join 100 Day Incubator
          </Button>
        </div>
      </div>

      <SecretAdminModal 
        open={showAdminModal} 
        onOpenChange={setShowAdminModal} 
      />
    </div>
  );
};