import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, MessageSquare, Clock, CheckCircle, AlertTriangle, User, Calendar } from "lucide-react";
import { db, COLLECTIONS } from "@/integrations/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SupportMessage {
  id: string;
  user_id?: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  admin_response?: string;
  admin_id?: string;
  created_at: string;
  responded_at?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
}

interface SupportStats {
  total: number;
  open: number;
  urgent: number;
  responseRate: number;
}

export const SupportManagement = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SupportMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [stats, setStats] = useState<SupportStats>({ total: 0, open: 0, urgent: 0, responseRate: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState("resolved");
  const [isResponding, setIsResponding] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from(COLLECTIONS.SUPPORT_MESSAGES)
        .select('*')
        .order('created_at', 'desc')
        .execute();

      if (error) throw error;

      // Fetch user profiles separately for those who have user_id
      const messagesWithProfiles = await Promise.all((data || []).map(async (msg: any) => {
        if (msg.user_id) {
          const { data: profile } = await db
            .from(COLLECTIONS.PROFILES)
            .select('full_name, email')
            .eq('user_id', msg.user_id)
            .single();
          return { ...msg, id: msg.$id || msg.id, profiles: profile };
        }
        return { ...msg, id: msg.$id || msg.id, profiles: null };
      }));

      setMessages(messagesWithProfiles);
      calculateStats(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching support messages:', error);
      toast({
        title: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: SupportMessage[]) => {
    const total = data.length;
    const open = data.filter(msg => msg.status === 'open').length;
    const urgent = data.filter(msg => msg.priority === 'urgent').length;
    const responded = data.filter(msg => msg.admin_response).length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    setStats({ total, open, urgent, responseRate });
  };

  const filterMessages = () => {
    let filtered = messages;

    if (statusFilter !== "all") {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(msg => msg.priority === priorityFilter);
    }

    setFilteredMessages(filtered);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, statusFilter, priorityFilter]);

  const handleResponse = async () => {
    if (!selectedMessage || !response.trim()) {
      toast({
        title: "Please enter a response",
        variant: "destructive",
      });
      return;
    }

    setIsResponding(true);
    try {
      const { error } = await db.update(
        COLLECTIONS.SUPPORT_MESSAGES,
        selectedMessage.id,
        {
          admin_response: response,
          admin_id: user?.id,
          status: responseStatus,
          responded_at: new Date().toISOString(),
          user_read: false
        }
      );

      if (error) throw error;

      toast({
        title: "Response sent successfully",
      });

      setResponse("");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Messages</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Messages</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.responseRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Refresh */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchMessages} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Support Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No support messages found</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === msg.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(msg.priority)}
                          <h4 className="font-medium text-sm line-clamp-1">{msg.subject}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(msg.priority)}>
                            {msg.priority}
                          </Badge>
                          <Badge className={getStatusColor(msg.status)}>
                            {msg.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), 'MMM dd')}
                        </p>
                        {msg.admin_response && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-1" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{msg.profiles?.full_name || msg.profiles?.email || 'Anonymous'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Details & Response */}
        <Card>
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                      <Badge className={getStatusColor(selectedMessage.status)}>
                        {selectedMessage.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {selectedMessage.profiles?.full_name || selectedMessage.profiles?.email || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(selectedMessage.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedMessage.message}</p>
                </div>

                {selectedMessage.admin_response && (
                  <div>
                    <h4 className="font-medium mb-2">Previous Response</h4>
                    <p className="text-sm bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
                      {selectedMessage.admin_response}
                    </p>
                    {selectedMessage.responded_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Responded on {format(new Date(selectedMessage.responded_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="response-status">Update Status</Label>
                    <Select value={responseStatus} onValueChange={setResponseStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="admin-response">Your Response</Label>
                    <Textarea
                      id="admin-response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleResponse}
                    disabled={isResponding || !response.trim()}
                    className="w-full"
                  >
                    {isResponding ? "Sending..." : "Send Response"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details and respond</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};