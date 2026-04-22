import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, Bell, StickyNote, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { format } from "date-fns";

interface CommunicationLogProps {
  userId: string;
  adminView?: boolean;
}

const CommunicationLog = ({ userId, adminView = false }: CommunicationLogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ["customer-communications", userId, typeFilter, channelFilter],
    queryFn: async () => {
      let query = supabase
        .from("customer_communications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (typeFilter !== "all") {
        query = query.eq("communication_type", typeFilter);
      }

      if (channelFilter !== "all") {
        query = query.eq("channel", channelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredCommunications = communications.filter(
    (comm) =>
      comm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "push":
        return <Bell className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "note":
        return <StickyNote className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      sent: "default",
      delivered: "secondary",
      failed: "destructive",
      scheduled: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      order_status: "Order Status",
      quotation_status: "Quotation",
      cart_recovery: "Cart Recovery",
      callback: "Callback",
      campaign: "Campaign",
      manual: "Manual",
      order_confirmation: "Order Confirmation",
      cart_reminder: "Cart Reminder",
      revision: "Revision",
      finalized: "Finalized",
    };
    return labels[channel] || channel;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication History
          </CardTitle>
          <CardDescription>
            All emails, notifications, and messages sent {adminView ? "to this customer" : "to you"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="order_status">Order Status</SelectItem>
                <SelectItem value="quotation_status">Quotation</SelectItem>
                <SelectItem value="cart_recovery">Cart Recovery</SelectItem>
                <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                <SelectItem value="callback">Callback</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Communications List */}
          {filteredCommunications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No communications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCommunications.map((comm) => (
                <Collapsible key={comm.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-1 flex-shrink-0">{getIcon(comm.communication_type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="outline" className="text-xs">
                                {comm.communication_type.toUpperCase()}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {getChannelLabel(comm.channel)}
                              </Badge>
                              {getStatusBadge(comm.status)}
                            </div>
                            {comm.subject && (
                              <p className="font-medium text-sm mb-1 truncate">{comm.subject}</p>
                            )}
                            {comm.message_preview && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{comm.message_preview}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>Sent: {format(new Date(comm.sent_at), "MMM d, yyyy 'at' h:mm a")}</span>
                              {comm.opened_at && <span>• Opened</span>}
                              {comm.clicked_at && <span>• Clicked</span>}
                            </div>
                          </div>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(comm.id)}
                            className="flex-shrink-0"
                          >
                            {expandedIds.has(comm.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="mt-3 pt-3 border-t">
                        <div className="space-y-2 text-sm">
                          {comm.full_content && typeof comm.full_content === 'object' && (
                            <div>
                              <p className="font-medium mb-1">Details:</p>
                              <div className="bg-muted/50 rounded p-3 text-xs">
                                {'recipient' in comm.full_content && (
                                  <p>
                                    <span className="font-medium">To:</span> {String(comm.full_content.recipient)}
                                  </p>
                                )}
                                {/* Metadata removed - internal system data not for user display */}
                              </div>
                            </div>
                          )}
                          {comm.failed_reason && (
                            <div>
                              <p className="font-medium text-destructive mb-1">Failed Reason:</p>
                              <p className="text-destructive">{comm.failed_reason}</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationLog;
