import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IncubatorApplicationModal } from "./IncubatorApplicationModal";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncubatorAccessButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export const IncubatorAccessButton = ({ 
  variant = "default", 
  size = "default", 
  className,
  showIcon = true,
  children 
}: IncubatorAccessButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => setModalOpen(true)}
      >
        {showIcon && <Lightbulb className="w-4 h-4 mr-2" />}
        {children || "Join Incubator"}
      </Button>
      
      <IncubatorApplicationModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
};