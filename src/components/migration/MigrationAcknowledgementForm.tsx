import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Wallet, AlertTriangle, ExternalLink } from 'lucide-react';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface MigrationContracts {
  CIFI: {
    old: string;
  };
}

interface MigrationAcknowledgementFormProps {
  walletAddress: string;
  contracts: MigrationContracts;
  onAcknowledgementComplete: (acknowledgementId: string) => void;
}

export const MigrationAcknowledgementForm: React.FC<MigrationAcknowledgementFormProps> = ({
  walletAddress,
  contracts,
  onAcknowledgementComplete
}) => {
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedRisks, setAcceptedRisks] = useState(false);
  const [acceptedProperty, setAcceptedProperty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !acceptedTerms || !acceptedRisks || !acceptedProperty) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields and accept all terms.",
        variant: "destructive"
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create acknowledgement hash for verification
      const acknowledgementData = {
        walletAddress,
        email,
        contracts,
        timestamp: new Date().toISOString(),
        terms: "I acknowledge the migration terms and digital commodity nature of tokens"
      };
      
      const acknowledgementHash = btoa(JSON.stringify(acknowledgementData));

      // Insert acknowledgement record
      const insertData: any = {
        email,
        wallet_address: walletAddress,
        acknowledgement_hash: acknowledgementHash,
        ip_address: 'client-side', // In production, this would be captured server-side
        user_agent: navigator.userAgent
      };

      // Add user_id only if user is authenticated
      if (user) {
        insertData.user_id = user.id;
      }

      const { data, error } = await db.insert(COLLECTIONS.MIGRATION_ACKNOWLEDGEMENTS, insertData);

      if (error) throw error;

      toast({
        title: "Acknowledgement Completed",
        description: "You can now proceed with the token migration.",
      });

      onAcknowledgementComplete(data.id);
    } catch (error) {
      console.error('Error submitting acknowledgement:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/image-uploads/75850341-670e-4368-a962-f54a31b2f207.png" alt="Company Logo" className="h-6 w-6" />
          <CardTitle className="text-xl">Migration Acknowledgement</CardTitle>
        </div>
        <CardDescription>
          Please review and acknowledge the following terms before proceeding with token migration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Smart Contract Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    CIFI Token Migration
                    <Badge variant="secondary">1:1 Ratio</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current (v1) Contract:</Label>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">{contracts.CIFI.old}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">New (v2) Contract:</Label>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">{contracts.CIFI.new}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    EPS Token Distribution (BASE Network)
                    <Badge variant="secondary">1:1 Ratio</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Migration Process:</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your CIFI tokens will be locked on XDC Network. EPS tokens will be sent to the same wallet address on BASE Network.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Legal Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Legal Acknowledgement & Digital Commodity Declaration
              <a 
                href="https://www.irs.gov/pub/irs-drop/n-14-21.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto p-1 text-muted-foreground hover:text-primary transition-colors"
                title="View IRS guidance on digital commodities"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </h3>
            
            <div className="h-48 w-full border rounded-md p-4 overflow-y-auto">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Digital Commodity Classification</h4>
                  <p>
                    CIFI tokens are recognized as <strong>Digital Commodities</strong> that represent 
                    personal property, the same way that Bitcoin is recognized as digital personal property. These 
                    tokens are <strong>NOT speculative assets</strong> but digital resources that unlock exclusive 
                    micro-service deployment rights within the Circularity Finance ecosystem.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Ecosystem Utility</h4>
                  <p>
                    CIFI tokens provide holders with access to deploy and utilize micro-services within 
                    the ecosystem. These tokens represent utility and access rights rather than 
                    investment opportunities.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Migration Process</h4>
                  <p>
                    By proceeding with this migration, you acknowledge that you are locking your CIFI tokens 
                    on XDC Network and will receive EPS tokens on BASE Network at a 1:1 ratio. This is a 
                    cross-chain migration where tokens are locked on XDC and new tokens are distributed on BASE.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Risks and Responsibilities</h4>
                  <p>
                    You understand that blockchain transactions are irreversible. You are responsible for 
                    ensuring you are connected to the correct network and using the correct wallet address. 
                    Always verify contract addresses before proceeding with any transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">User Information</h3>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="wallet">Connected Wallet Address</Label>
                <Input 
                  id="wallet"
                  value={walletAddress}
                  disabled
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for migration event tracking and support purposes
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Acknowledgement Checkboxes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Acknowledgements</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  I acknowledge that I have read and understand the migration process, including the 
                  new smart contract addresses and the 1:1 token exchange ratio.
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="property"
                  checked={acceptedProperty}
                  onCheckedChange={(checked) => setAcceptedProperty(checked === true)}
                />
                <Label htmlFor="property" className="text-sm leading-5">
                  I understand that CIFI tokens are digital commodities representing personal 
                  property (like Bitcoin) that provide utility access to ecosystem micro-services, 
                  not speculative investment assets. EPS tokens will be distributed on BASE Network.
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="risks"
                  checked={acceptedRisks}
                  onCheckedChange={(checked) => setAcceptedRisks(checked === true)}
                />
                <Label htmlFor="risks" className="text-sm leading-5">
                  I understand the risks involved in blockchain transactions and confirm that I am 
                  using the correct wallet and network. I acknowledge that transactions are irreversible.
                </Label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!email || !acceptedTerms || !acceptedRisks || !acceptedProperty || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Complete Acknowledgement & Proceed to Migration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};