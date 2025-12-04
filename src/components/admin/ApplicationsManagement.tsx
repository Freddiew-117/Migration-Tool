import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { db, COLLECTIONS } from "@/integrations/db";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Eye, 
  Mail, 
  Phone, 
  ExternalLink, 
  Calendar, 
  Users, 
  Building, 
  Code,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";
import { format } from "date-fns";

interface IncubatorApplication {
  id: string;
  user_id: string;
  founder_name: string;
  project_name: string;
  company_name?: string;
  website_url?: string;
  business_category: string;
  stage: string;
  description: string;
  team_size?: number;
  founder_background?: string;
  team_experience?: string;
  team_emails?: string;
  team_linkedin?: string;
  funding_raised?: number;
  funding_needed?: number;
  use_of_funds?: string;
  technology_stack?: string[];
  blockchain_networks?: string[];
  custom_networks?: string;
  smart_contracts_deployed?: boolean;
  contact_email: string;
  contact_phone?: string;
  linkedin_profile?: string;
  why_join: string;
  goals?: string;
  timeline?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  submitted: { label: "Submitted", color: "bg-blue-500", icon: AlertCircle },
  under_review: { label: "Under Review", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Approved", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
  waitlisted: { label: "Waitlisted", color: "bg-purple-500", icon: Clock }
};

const businessCategoryLabels: Record<string, string> = {
  fintech: "FinTech",
  defi: "DeFi", 
  nft: "NFT/Gaming",
  gamefi: "GameFi",
  infrastructure: "Infrastructure",
  dao: "DAO/Governance",
  analytics: "Analytics",
  trading: "Trading", 
  lending: "Lending",
  insurance: "Insurance",
  other: "Other"
};

export const ApplicationsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<IncubatorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<IncubatorApplication | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchApplications = async () => {
    try {
      const { data, error } = await db
        .from(COLLECTIONS.INCUBATOR_APPLICATIONS)
        .select('*')
        .order('created_at', 'desc')
        .execute();

      if (error) throw error;
      setApplications(((data || []) as any[]).map((a: any) => ({ ...a, id: a.$id || a.id })) as IncubatorApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (!user) return;

    setUpdatingStatus(true);
    try {
      const { error } = await db.update(
        COLLECTIONS.INCUBATOR_APPLICATIONS,
        applicationId,
        {
          status: newStatus,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`
      });

      fetchApplications();
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({
          ...selectedApplication,
          status: newStatus as any,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openApplicationDetail = (application: IncubatorApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.admin_notes || "");
    setDetailModalOpen(true);
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === "all" || app.status === statusFilter
  );

  const stats = {
    total: applications.length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    waitlisted: applications.filter(app => app.status === 'waitlisted').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.submitted}</div>
            <div className="text-sm text-muted-foreground">Submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.under_review}</div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.waitlisted}</div>
            <div className="text-sm text-muted-foreground">Waitlisted</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Incubator Applications</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No applications found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const statusInfo = statusConfig[application.status];
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{application.project_name}</h3>
                        <Badge variant="secondary">
                          {businessCategoryLabels[application.business_category] || application.business_category}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {application.stage}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {application.founder_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {application.contact_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(application.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {application.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </div>
                        
                        {application.funding_needed && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            ${(application.funding_needed / 100).toLocaleString()} needed
                          </div>
                        )}
                        
                        {application.team_size && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {application.team_size} team members
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openApplicationDetail(application)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Application Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedApplication?.project_name} - Application Details
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Review & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={selectedApplication.status} 
                        onValueChange={(value) => handleStatusUpdate(selectedApplication.id, value)}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="waitlisted">Waitlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Submitted</label>
                      <div className="text-sm text-muted-foreground mt-2">
                        {format(new Date(selectedApplication.created_at), 'PPP at p')}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this application..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={() => handleStatusUpdate(selectedApplication.id, selectedApplication.status)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? "Updating..." : "Save Notes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Project Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Project Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Project Name</div>
                      <div>{selectedApplication.project_name}</div>
                    </div>
                    {selectedApplication.company_name && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Company Name</div>
                        <div>{selectedApplication.company_name}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Category</div>
                      <div>{businessCategoryLabels[selectedApplication.business_category] || selectedApplication.business_category}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Stage</div>
                      <div className="capitalize">{selectedApplication.stage}</div>
                    </div>
                    {selectedApplication.website_url && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Website</div>
                        <a 
                          href={selectedApplication.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedApplication.website_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Description</div>
                      <div className="text-sm">{selectedApplication.description}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Founder</div>
                      <div>{selectedApplication.founder_name}</div>
                    </div>
                    {selectedApplication.team_size && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Team Size</div>
                        <div>{selectedApplication.team_size} members</div>
                      </div>
                    )}
                    {selectedApplication.founder_background && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Founder Background</div>
                        <div className="text-sm">{selectedApplication.founder_background}</div>
                      </div>
                    )}
                    {selectedApplication.team_experience && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Team Experience</div>
                        <div className="text-sm">{selectedApplication.team_experience}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact & Financial */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Email</div>
                      <a href={`mailto:${selectedApplication.contact_email}`} className="text-primary hover:underline">
                        {selectedApplication.contact_email}
                      </a>
                    </div>
                    {selectedApplication.contact_phone && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Phone</div>
                        <a href={`tel:${selectedApplication.contact_phone}`} className="text-primary hover:underline">
                          {selectedApplication.contact_phone}
                        </a>
                      </div>
                    )}
                    {selectedApplication.linkedin_profile && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">LinkedIn</div>
                        <a 
                          href={selectedApplication.linkedin_profile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Profile
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedApplication.funding_raised && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Funding Raised</div>
                        <div>${(selectedApplication.funding_raised / 100).toLocaleString()}</div>
                      </div>
                    )}
                    {selectedApplication.funding_needed && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Funding Needed</div>
                        <div>${(selectedApplication.funding_needed / 100).toLocaleString()}</div>
                      </div>
                    )}
                    {selectedApplication.use_of_funds && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Use of Funds</div>
                        <div className="text-sm">{selectedApplication.use_of_funds}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Technical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedApplication.technology_stack && selectedApplication.technology_stack.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Technology Stack</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.technology_stack.map((tech, index) => (
                          <Badge key={index} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.blockchain_networks && selectedApplication.blockchain_networks.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Blockchain Networks</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.blockchain_networks.map((network, index) => (
                          <Badge key={index} variant="secondary">{network}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplication.custom_networks && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Custom Networks</div>
                      <div className="text-sm">{selectedApplication.custom_networks}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Smart Contracts Deployed</div>
                    <div>{selectedApplication.smart_contracts_deployed ? "Yes" : "No"}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Why join our incubator?</div>
                    <div className="text-sm">{selectedApplication.why_join}</div>
                  </div>
                  
                  {selectedApplication.goals && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Goals for 100 days</div>
                      <div className="text-sm">{selectedApplication.goals}</div>
                    </div>
                  )}

                  {selectedApplication.timeline && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Timeline & Milestones</div>
                      <div className="text-sm">{selectedApplication.timeline}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};