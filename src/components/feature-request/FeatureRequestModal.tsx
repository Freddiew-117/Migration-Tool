import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db, COLLECTIONS } from '@/integrations/db';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { MessageSquare, Tag, AlertCircle, Wallet } from 'lucide-react';

interface FeatureRequestData {
  title: string;
  description: string;
  category: string;
  priority: string;
  use_case: string;
  user_email: string;
}

interface FeatureRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'ui_ux', label: 'UI/UX Improvements' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'other', label: 'Other' }
];

const priorities = [
  { value: 'low', label: 'Low - Nice to have' },
  { value: 'medium', label: 'Medium - Would improve workflow' },
  { value: 'high', label: 'High - Important for productivity' },
  { value: 'critical', label: 'Critical - Blocking current work' }
];

export const FeatureRequestModal = ({ open, onOpenChange }: FeatureRequestModalProps) => {
  const { user } = useAuth();
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FeatureRequestData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    use_case: '',
    user_email: '',
  });

  const handleInputChange = (field: keyof FeatureRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to submit a feature request.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.user_email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide your email address.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for your feature request.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please provide a description of the feature.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category for your feature request.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await db.insert(COLLECTIONS.FEATURE_REQUESTS, {
        user_id: user?.id || null,
        wallet_address: account!.toLowerCase(),
        user_email: formData.user_email.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        use_case: formData.use_case.trim() || null,
        status: 'submitted'
      });

      if (error) throw error;

      toast({
        title: "Feature Request Submitted!",
        description: "Thank you for your suggestion. We'll review it and get back to you soon.",
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        use_case: '',
        user_email: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feature request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <MessageSquare className="w-5 h-5" />
            Request a Feature
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wallet Connection Status */}
          <div className="flex items-center gap-2 p-3 bg-sidebar-accent/50 rounded-lg border">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Sending from:
            </span>
            {isConnected && account ? (
              <span className="text-sm font-mono font-medium">
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
            ) : (
              <span className="text-sm text-destructive">
                Wallet not connected
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="user_email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => handleInputChange('user_email', e.target.value)}
              placeholder="your.email@example.com"
              className="w-full"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Feature Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief, descriptive title for your feature request"
              className="w-full"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Feature Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the feature you'd like to see. What should it do? How should it work?"
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {/* Use Case */}
          <div className="space-y-2">
            <Label htmlFor="use_case" className="text-sm font-medium">
              Use Case (Optional)
            </Label>
            <Textarea
              id="use_case"
              value={formData.use_case}
              onChange={(e) => handleInputChange('use_case', e.target.value)}
              placeholder="How would this feature help you or improve your workflow? Provide specific examples if possible."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !isConnected || !account}
              className="w-full sm:w-auto min-w-[120px] min-h-[44px]"
            >
              {loading ? "Submitting..." : !isConnected ? "Connect Wallet First" : "Submit Request"}
            </Button>
          </div>
          
          {/* Company Logo */}
          <div className="flex justify-center pt-4 border-t">
            <img 
              src="/image-uploads/538ccc95-abdc-4937-b171-f6cf54e8db7a.png" 
              alt="Company Logo" 
              className="w-8 h-8 opacity-60"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureRequestModal;