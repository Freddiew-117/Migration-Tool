import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export const FeatureCard = ({ title, icon: Icon, className, onClick }: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "p-8 bg-card hover:bg-card/80 border-border cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
    </Card>
  );
};