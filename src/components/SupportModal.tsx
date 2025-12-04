import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageCircle, Clock, AlertCircle, Trash2 } from "lucide-react";
import { db, COLLECTIONS } from "@/integrations/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SupportMessage {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  admin_response?: string;
  created_at: string;
  responded_at?: string;
  parent_message_id?: string;
  replies?: SupportMessage[];
}

export const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium",
    parent_message_id: null as string | null
  });

  const fetchMessages = async () => {
    if (!user) return;
    
    const { data, error } = await db
      .from(COLLECTIONS.SUPPORT_MESSAGES)
      .select('*')
      .eq('user_id', user.id)
      .is('parent_message_id', null)
      .order('created_at', 'desc')
      .execute();

    if (error) {
      console.error('Error fetching support messages:', error);
      return;
    }

    // Fetch replies for each message
    const messagesWithReplies = await Promise.all(
      mainMessages.map(async (message: any) => {
        const messageId = message.$id || message.id;
        const { data: replies } = await db
          .from(COLLECTIONS.SUPPORT_MESSAGES)
          .select('*')
          .eq('parent_message_id', messageId)
          .order('created_at', 'asc')
          .execute();
        
        return { ...message, id: messageId, replies: (replies || []).map((r: any) => ({ ...r, id: r.$id || r.id })) };
      })
    );

    setMessages(messagesWithReplies);
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    // Get all messages with admin responses that are unread
    const { data: unreadMessages } = await db
      .from(COLLECTIONS.SUPPORT_MESSAGES)
      .select('$id')
      .eq('user_id', user.id)
      .neq('admin_response', null)
      .eq('user_read', false)
      .execute();
    
    // Update each message
    if (unreadMessages) {
      await Promise.all(
        unreadMessages.map((msg: any) =>
          db.update(COLLECTIONS.SUPPORT_MESSAGES, msg.$id, { user_read: true })
        )
      );
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await db.insert(COLLECTIONS.SUPPORT_MESSAGES, {
        user_id: user?.id || null,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        parent_message_id: formData.parent_message_id,
      });

      if (error) throw error;

      setShowSuccess(true);
      setFormData({ subject: "", message: "", priority: "medium", parent_message_id: null });
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        fetchMessages();
      }, 2000);

    } catch (error) {
      console.error('Error submitting support message:', error);
      toast({
        title: "Failed to submit message",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  const handleReply = (msg: SupportMessage) => {
    setFormData({
      subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
      message: "",
      priority: "medium",
      parent_message_id: msg.parent_message_id || msg.id
    });
    // Switch to contact tab
    const contactTab = document.querySelector('[value="contact"]') as HTMLElement;
    contactTab?.click();
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Message deleted successfully",
      });
      
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Message Sent Successfully!</h3>
            <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Help & Support
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            {user && <TabsTrigger value="history">My Messages</TabsTrigger>}
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your issue in detail..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">How do I connect my wallet?</h3>
                <p className="text-sm text-muted-foreground">
                  Click on the wallet connection button in the top navigation or use the "Connect Wallet" option in various features.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">How do token migrations work?</h3>
                <p className="text-sm text-muted-foreground">
                  Token migrations allow you to swap old tokens for new ones. Follow the migration portal instructions carefully.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">What is the Incubator program?</h3>
                <p className="text-sm text-muted-foreground">
                  Our incubator helps blockchain projects grow with mentorship, funding opportunities, and technical support.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">How to submit a feature request?</h3>
                <p className="text-sm text-muted-foreground">
                  Use the "Request Feature" option in various parts of the platform to suggest new functionality.
                </p>
              </div>
            </div>
          </TabsContent>

          {user && (
            <TabsContent value="history" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No support messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{msg.subject}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(msg.priority)}>
                              {msg.priority}
                            </Badge>
                            <Badge className={getStatusColor(msg.status)}>
                              {msg.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(msg.created_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                      
                      {msg.admin_response && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Admin Response</span>
                            {msg.responded_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(msg.responded_at), 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{msg.admin_response}</p>
                        </div>
                      )}

                      {/* Show threaded replies */}
                      {msg.replies && msg.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="text-sm font-medium text-muted-foreground border-b pb-1">
                            Conversation Thread
                          </div>
                          {msg.replies.map((reply) => (
                            <div key={reply.id} className="ml-4 border-l-2 border-muted pl-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {reply.admin_response ? 'Admin' : 'You'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reply.created_at), 'MMM dd, HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm">{reply.message}</p>
                              {reply.admin_response && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                  <strong>Admin:</strong> {reply.admin_response}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReply(msg)}
                          className="flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};