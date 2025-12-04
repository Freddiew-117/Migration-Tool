import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { db, COLLECTIONS } from "@/integrations/db";
import { useAuth } from "@/contexts/AuthContext";
import { Lightbulb, Users, Building, Code, Mail, FileText } from "lucide-react";

interface IncubatorApplicationData {
  // Founder & Project Info
  founder_name: string;
  project_name: string;
  company_name?: string;
  website_url?: string;
  business_category: string;
  stage: string;
  description: string;
  
  // Team Information
  team_size?: number;
  founder_background?: string;
  team_experience?: string;
  team_emails?: string;
  team_linkedin?: string;
  
  // Business Details
  funding_raised?: number;
  funding_needed?: number;
  use_of_funds?: string;
  
  // Technical Information
  technology_stack?: string[];
  blockchain_networks?: string[];
  custom_networks?: string;
  smart_contracts_deployed?: boolean;
  
  // Contact Information
  contact_email: string;
  contact_phone?: string;
  linkedin_profile?: string;
  
  // Application Details
  why_join: string;
  goals?: string;
  timeline?: string;
}

interface IncubatorApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const businessCategories = [
  { value: "fintech", label: "FinTech" },
  { value: "defi", label: "DeFi" },
  { value: "nft", label: "NFT/Gaming" },
  { value: "gamefi", label: "GameFi" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "dao", label: "DAO/Governance" },
  { value: "analytics", label: "Analytics" },
  { value: "trading", label: "Trading" },
  { value: "lending", label: "Lending" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" }
];

const techStack = [
  "React", "TypeScript", "Node.js", "Python", "Solidity", "Rust", "Go", 
  "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", 
  "Next.js", "Vue.js", "GraphQL", "REST API", "Microservices", "Blockchain"
];

const blockchainNetworks = [
  "Ethereum", "Polygon", "BSC", "Arbitrum", "Optimism", "Avalanche", 
  "Solana", "Cardano", "Polkadot", "Cosmos", "Near", "Other"
];

export const IncubatorApplicationModal = ({ open, onOpenChange }: IncubatorApplicationModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  
  const [formData, setFormData] = useState<IncubatorApplicationData>({
    founder_name: "",
    project_name: "",
    company_name: "",
    website_url: "",
    business_category: "",
    stage: "",
    description: "",
    team_size: undefined,
    founder_background: "",
    team_experience: "",
    team_emails: "",
    team_linkedin: "",
    funding_raised: undefined,
    funding_needed: undefined,
    use_of_funds: "",
    technology_stack: [],
    blockchain_networks: [],
    custom_networks: "",
    smart_contracts_deployed: false,
    contact_email: user?.email || "",
    contact_phone: "",
    linkedin_profile: "",
    why_join: "",
    goals: "",
    timeline: ""
  });

  const handleInputChange = (field: keyof IncubatorApplicationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechStackChange = (tech: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      technology_stack: checked 
        ? [...(prev.technology_stack || []), tech]
        : (prev.technology_stack || []).filter(t => t !== tech)
    }));
  };

  const handleBlockchainChange = (network: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      blockchain_networks: checked 
        ? [...(prev.blockchain_networks || []), network]
        : (prev.blockchain_networks || []).filter(n => n !== network)
    }));
  };

  const validateCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return formData.founder_name && formData.project_name && formData.business_category && 
               formData.stage && formData.description;
      case 2:
        return true; // Optional section
      case 3:
        return true; // Optional section  
      case 4:
        return true; // Optional section
      case 5:
        return formData.contact_email;
      case 6:
        return formData.why_join;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await db.insert(COLLECTIONS.INCUBATOR_APPLICATIONS, {
        user_id: user?.id || null,
        ...formData,
        funding_raised: formData.funding_raised ? formData.funding_raised * 100 : null, // Convert to cents
        funding_needed: formData.funding_needed ? formData.funding_needed * 100 : null,
        status: 'submitted'
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your incubator application has been submitted successfully. We'll review it and get back to you soon.",
      });

      // Reset form and close modal
      setFormData({
        founder_name: "",
        project_name: "",
        company_name: "",
        website_url: "",
        business_category: "",
        stage: "",
        description: "",
        team_size: undefined,
        founder_background: "",
        team_experience: "",
        team_emails: "",
        team_linkedin: "",
        funding_raised: undefined,
        funding_needed: undefined,
        use_of_funds: "",
        technology_stack: [],
        blockchain_networks: [],
        custom_networks: "",
        smart_contracts_deployed: false,
        contact_email: user?.email || "",
        contact_phone: "",
        linkedin_profile: "",
        why_join: "",
        goals: "",
        timeline: ""
      });
      setCurrentSection(1);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 1, title: "Founder & Project", icon: Lightbulb },
    { id: 2, title: "Team Info", icon: Users },
    { id: 3, title: "Business Details", icon: Building },
    { id: 4, title: "Technical Info", icon: Code },
    { id: 5, title: "Contact Info", icon: Mail },
    { id: 6, title: "Application Details", icon: FileText }
  ];

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="founder_name">Founder Name *</Label>
                <Input
                  id="founder_name"
                  value={formData.founder_name}
                  onChange={(e) => handleInputChange('founder_name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  placeholder="Your project or company name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Legal company name (if different)"
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourproject.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_category">Business Category *</Label>
                <Select value={formData.business_category} onValueChange={(value) => handleInputChange('business_category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stage">Current Stage *</Label>
                <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea Stage</SelectItem>
                    <SelectItem value="prototype">Prototype</SelectItem>
                    <SelectItem value="mvp">MVP</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="launched">Launched</SelectItem>
                    <SelectItem value="growth">Growth Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your project, its purpose, and what makes it unique..."
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team_size">Team Size</Label>
                <Input
                  id="team_size"
                  type="number"
                  value={formData.team_size || ""}
                  onChange={(e) => handleInputChange('team_size', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Number of team members"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="founder_background">Founder Background</Label>
              <Textarea
                id="founder_background"
                value={formData.founder_background}
                onChange={(e) => handleInputChange('founder_background', e.target.value)}
                placeholder="Your professional background, experience, and expertise..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="team_experience">Team Experience</Label>
              <Textarea
                id="team_experience"
                value={formData.team_experience}
                onChange={(e) => handleInputChange('team_experience', e.target.value)}
                placeholder="Relevant experience of your team members..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team_emails">Team Member Emails</Label>
                <Textarea
                  id="team_emails"
                  value={formData.team_emails}
                  onChange={(e) => handleInputChange('team_emails', e.target.value)}
                  placeholder="Comma-separated email addresses"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="team_linkedin">Team LinkedIn Profiles</Label>
                <Textarea
                  id="team_linkedin"
                  value={formData.team_linkedin}
                  onChange={(e) => handleInputChange('team_linkedin', e.target.value)}
                  placeholder="LinkedIn profile URLs, one per line"
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="funding_raised">Funding Already Raised ($)</Label>
                <Input
                  id="funding_raised"
                  type="number"
                  value={formData.funding_raised || ""}
                  onChange={(e) => handleInputChange('funding_raised', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Amount in USD"
                />
              </div>
              <div>
                <Label htmlFor="funding_needed">Funding Needed ($)</Label>
                <Input
                  id="funding_needed"
                  type="number"
                  value={formData.funding_needed || ""}
                  onChange={(e) => handleInputChange('funding_needed', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Amount in USD"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="use_of_funds">Use of Funds</Label>
              <Textarea
                id="use_of_funds"
                value={formData.use_of_funds}
                onChange={(e) => handleInputChange('use_of_funds', e.target.value)}
                placeholder="How will you use the funding? (e.g., development, marketing, team expansion...)"
                rows={4}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Technology Stack</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {techStack.map(tech => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={tech}
                      checked={formData.technology_stack?.includes(tech) || false}
                      onCheckedChange={(checked) => handleTechStackChange(tech, checked as boolean)}
                    />
                    <Label htmlFor={tech} className="text-sm">{tech}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Blockchain Networks</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                {blockchainNetworks.map(network => (
                  <div key={network} className="flex items-center space-x-2">
                    <Checkbox
                      id={network}
                      checked={formData.blockchain_networks?.includes(network) || false}
                      onCheckedChange={(checked) => handleBlockchainChange(network, checked as boolean)}
                    />
                    <Label htmlFor={network} className="text-sm">{network}</Label>
                  </div>
                ))}
              </div>
            </div>

            {formData.blockchain_networks?.includes("Other") && (
              <div>
                <Label htmlFor="custom_networks">Custom Blockchain Networks</Label>
                <Input
                  id="custom_networks"
                  value={formData.custom_networks}
                  onChange={(e) => handleInputChange('custom_networks', e.target.value)}
                  placeholder="Specify other blockchain networks..."
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="smart_contracts_deployed"
                checked={formData.smart_contracts_deployed || false}
                onCheckedChange={(checked) => handleInputChange('smart_contracts_deployed', checked)}
              />
              <Label htmlFor="smart_contracts_deployed">
                We have smart contracts deployed on mainnet
              </Label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
              <Input
                id="linkedin_profile"
                value={formData.linkedin_profile}
                onChange={(e) => handleInputChange('linkedin_profile', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="why_join">Why do you want to join our 100-day incubator? *</Label>
              <Textarea
                id="why_join"
                value={formData.why_join}
                onChange={(e) => handleInputChange('why_join', e.target.value)}
                placeholder="Tell us what you hope to achieve and why our incubator is the right fit..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="goals">What are your specific goals for the 100 days?</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                placeholder="What do you want to accomplish during the incubator program?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="timeline">Current Timeline & Milestones</Label>
              <Textarea
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                placeholder="Share your project timeline and upcoming milestones..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Join Our 100-Day Incubator Program
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Section Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                const isCompleted = section.id < currentSection || (section.id === currentSection && validateCurrentSection());
                
                return (
                  <div
                    key={section.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : isCompleted 
                          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                          : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setCurrentSection(section.id)}
                  >
                    <div className={`p-1 rounded ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs opacity-70">Section {section.id}</div>
                    </div>
                    {isCompleted && section.id !== currentSection && (
                      <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(sections[currentSection - 1].icon, { className: "w-5 h-5" })}
                  {sections[currentSection - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSection()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Section {currentSection} of {sections.length}
          </div>

          {currentSection < sections.length ? (
            <Button
              onClick={() => setCurrentSection(currentSection + 1)}
              disabled={!validateCurrentSection()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateCurrentSection() || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};