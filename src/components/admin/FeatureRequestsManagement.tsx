import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { db, COLLECTIONS } from "@/integrations/db";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Eye, 
  Mail, 
  Calendar, 
  Users, 
  Tag,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Code,
  Shield,
  Zap,
  BarChart3,
  Settings
} from "lucide-react";
import { format } from "date-fns";

interface FeatureRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'ui_ux' | 'performance' | 'security' | 'integrations' | 'analytics' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'in_development' | 'completed' | 'rejected';
  use_case?: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  submitted: { label: "Submitted", color: "bg-blue-500", icon: AlertCircle },
  under_review: { label: "Under Review", color: "bg-yellow-500", icon: Clock },
  in_development: { label: "In Development", color: "bg-purple-500", icon: Code },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle }
};

const categoryConfig = {
  ui_ux: { label: "UI/UX", icon: Settings },
  performance: { label: "Performance", icon: Zap },
  security: { label: "Security", icon: Shield },
  integrations: { label: "Integrations", icon: Code },
  analytics: { label: "Analytics", icon: BarChart3 },
  other: { label: "Other", icon: Tag }
};

const priorityConfig = {
  low: { label: "Low", color: "text-green-600" },
  medium: { label: "Medium", color: "text-yellow-600" },
  high: { label: "High", color: "text-orange-600" },
  critical: { label: "Critical", color: "text-red-600" }
};

export const FeatureRequestsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      const { data, error } = await db
        .from(COLLECTIONS.FEATURE_REQUESTS)
        .select('*')
        .order('created_at', 'desc')
        .execute();

      if (error) throw error;
      setRequests(((data || []) as any[]).map((r: any) => ({ ...r, id: r.$id || r.id })) as FeatureRequest[]);
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      toast({
        title: "Error",
        description: "Failed to load feature requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    if (!user) return;

    setUpdatingStatus(true);
    try {
      const { error } = await db.update(
        COLLECTIONS.FEATURE_REQUESTS,
        requestId,
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
        description: `Request status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`
      });

      fetchRequests();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({
          ...selectedRequest,
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
        description: "Failed to update request status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openRequestDetail = (request: FeatureRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setDetailModalOpen(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    const matchesSearch = searchTerm === "" || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: requests.length,
    submitted: requests.filter(r => r.status === 'submitted').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    in_development: requests.filter(r => r.status === 'in_development').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feature requests...</p>
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
            <div className="text-2xl font-bold text-purple-500">{stats.in_development}</div>
            <div className="text-sm text-muted-foreground">In Development</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Feature Requests</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="in_development">In Development</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ui_ux">UI/UX</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="integrations">Integrations</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                  ? "No feature requests match your filters."
                  : "No feature requests submitted yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const statusInfo = statusConfig[request.status];
            const categoryInfo = categoryConfig[request.category];
            const priorityInfo = priorityConfig[request.priority];
            const StatusIcon = statusInfo.icon;
            const CategoryIcon = categoryInfo.icon;
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold line-clamp-1">{request.title}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CategoryIcon className="w-3 h-3" />
                          {categoryInfo.label}
                        </Badge>
                        <Badge variant="outline" className={`${priorityInfo.color} font-medium`}>
                          {priorityInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {request.user_email || 'Unknown User'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {request.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRequestDetail(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Request Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Feature Request Details
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Review & Status Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Current Status</label>
                      <Select 
                        value={selectedRequest.status} 
                        onValueChange={(value) => handleStatusUpdate(selectedRequest.id, value)}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="in_development">In Development</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Submitted</label>
                      <div className="text-sm text-muted-foreground mt-2">
                        {format(new Date(selectedRequest.created_at), 'PPP at p')}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this request..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={() => handleStatusUpdate(selectedRequest.id, selectedRequest.status)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? "Updating..." : "Save Notes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Request Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Title</div>
                      <div className="font-medium">{selectedRequest.title}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Category</div>
                      <div className="flex items-center gap-2">
                        {React.createElement(categoryConfig[selectedRequest.category].icon, { className: "w-4 h-4" })}
                        {categoryConfig[selectedRequest.category].label}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Priority</div>
                      <div className={`font-medium ${priorityConfig[selectedRequest.priority].color}`}>
                        {priorityConfig[selectedRequest.priority].label}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Submitted by</div>
                      <div>{selectedRequest.user_email || 'Unknown User'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{selectedRequest.description}</div>
                  </CardContent>
                </Card>
              </div>

              {selectedRequest.use_case && (
                <Card>
                  <CardHeader>
                    <CardTitle>Use Case</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{selectedRequest.use_case}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};