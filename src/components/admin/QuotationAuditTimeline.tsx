import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  FileText, 
  DollarSign, 
  Package, 
  MessageSquare, 
  Clock,
  User,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  change_type: 'status_change' | 'pricing_change' | 'item_change' | 'notes_change' | 'created';
  field_name: string | null;
  old_value: any;
  new_value: any;
  changed_by: string | null;
  change_summary: string;
  metadata: any;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
}

interface QuotationAuditTimelineProps {
  quotationId: string;
}

const changeTypeConfig = {
  created: {
    icon: Clock,
    label: "Created",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  status_change: {
    icon: FileText,
    label: "Status Change",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  pricing_change: {
    icon: DollarSign,
    label: "Pricing Change",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  item_change: {
    icon: Package,
    label: "Item Change",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  notes_change: {
    icon: MessageSquare,
    label: "Notes Change",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
};

export function QuotationAuditTimeline({ quotationId }: QuotationAuditTimelineProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAuditLogs();
  }, [quotationId]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Fetch audit logs with admin details
      const { data: logs, error } = await supabase
        .from("quotation_audit_log")
        .select("*")
        .eq("quotation_request_id", quotationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch admin details for changed_by fields
      const adminIds = logs
        ?.map(log => log.changed_by)
        .filter((id): id is string => id !== null) || [];
      
      const uniqueAdminIds = [...new Set(adminIds)];
      
      if (uniqueAdminIds.length > 0) {
        const { data: customers } = await supabase
          .from("customers")
          .select("user_id, email, full_name")
          .in("user_id", uniqueAdminIds);

        const adminMap = new Map(
          customers?.map(c => [c.user_id, { email: c.email, name: c.full_name }]) || []
        );

        const enrichedLogs = (logs?.map(log => ({
          id: log.id,
          change_type: log.change_type as AuditLogEntry['change_type'],
          field_name: log.field_name,
          old_value: log.old_value,
          new_value: log.new_value,
          changed_by: log.changed_by,
          change_summary: log.change_summary,
          metadata: log.metadata,
          created_at: log.created_at,
          admin_email: log.changed_by ? adminMap.get(log.changed_by)?.email : undefined,
          admin_name: log.changed_by ? adminMap.get(log.changed_by)?.name : undefined,
        })) || []) as AuditLogEntry[];

        setAuditLogs(enrichedLogs);
      } else {
        const typedLogs = (logs?.map(log => ({
          id: log.id,
          change_type: log.change_type as AuditLogEntry['change_type'],
          field_name: log.field_name,
          old_value: log.old_value,
          new_value: log.new_value,
          changed_by: log.changed_by,
          change_summary: log.change_summary,
          metadata: log.metadata,
          created_at: log.created_at,
        })) || []) as AuditLogEntry[];
        
        setAuditLogs(typedLogs);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const filteredLogs = filter === "all" 
    ? auditLogs 
    : auditLogs.filter(log => log.change_type === filter);

  const hasComplexValue = (value: any) => {
    return value && typeof value === 'object' && Object.keys(value).length > 1;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No audit trail available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Changes</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="status_change">Status Changes</SelectItem>
            <SelectItem value="pricing_change">Pricing Changes</SelectItem>
            <SelectItem value="item_change">Item Changes</SelectItem>
            <SelectItem value="notes_change">Notes Changes</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        {filteredLogs.map((log, index) => {
          const config = changeTypeConfig[log.change_type];
          const Icon = config.icon;
          const isExpanded = expandedLogs.has(log.id);
          const showExpandButton = hasComplexValue(log.old_value) || hasComplexValue(log.new_value);

          return (
            <div key={log.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background",
                config.bgColor
              )}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-card rounded-lg border p-4 space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium">{log.change_summary}</span>
                      </div>
                    </div>
                    {showExpandButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(log.id)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Details */}
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t">
                      {log.old_value && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Previous: </span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(log.old_value, null, 2)}
                          </code>
                        </div>
                      )}
                      {log.new_value && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">New: </span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(log.new_value, null, 2)}
                          </code>
                        </div>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Metadata: </span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(log.metadata, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    {log.changed_by && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.admin_name || log.admin_email || "Admin"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
