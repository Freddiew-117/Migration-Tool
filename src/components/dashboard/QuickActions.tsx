import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, HelpCircle, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FeatureRequestModal } from '@/components/feature-request/FeatureRequestModal';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [featureRequestOpen, setFeatureRequestOpen] = useState(false);

  const actions = [
    {
      title: 'Token Migration',
      description: 'Migrate your V1 tokens to V2',
      icon: <ArrowRightLeft className="h-5 w-5" />,
      action: () => navigate('/migration-portal'),
      variant: 'default' as const
    },
    {
      title: 'Feature Request',
      description: 'Request new features',
      icon: <HelpCircle className="h-5 w-5" />,
      action: () => setFeatureRequestOpen(true),
      variant: 'outline' as const
    },
    {
      title: 'Documentation',
      description: 'Learn about Circularity Finance',
      icon: <FileText className="h-5 w-5" />,
      action: () => window.open('https://www.circularity.finance', '_blank'),
      variant: 'outline' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks and helpful links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
      
      <FeatureRequestModal 
        open={featureRequestOpen} 
        onOpenChange={setFeatureRequestOpen} 
      />
    </Card>
  );
};