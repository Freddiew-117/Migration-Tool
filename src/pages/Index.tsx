import { Sidebar } from "@/components/Sidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { HeroSection } from "@/components/HeroSection";
import { SolutionsSection } from "@/components/SolutionsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const Index = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <div className={`flex flex-col min-h-screen ${!isMobile ? 'ml-64' : ''}`}>
        <TopNavigation onMenuToggle={toggleSidebar} />
        
        <main className="flex-1">
          <HeroSection />
          <SolutionsSection />
        </main>
      </div>
    </div>
  );
};

export default Index;
