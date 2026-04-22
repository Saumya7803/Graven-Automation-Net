import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Phone, Mail, Building2, Calendar, Clock, MessageSquare, Save, Copy, Bell } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface CallbackDetailDialogProps {
  callbackId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CallbackData = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  reason: string | null;
  message: string | null;
  status: string;
  priority: string;
  source: string | null;
  location_page: string | null;
  admin_notes: string | null;
  outcome: string | null;
  call_duration_minutes: number | null;
  contacted_at: string | null;
  created_at: string;
  scheduled_date_time: string | null;
  reminder_sent_at: string | null;
  follow_up_date: string | null;
};

export function CallbackDetailDialog({ callbackId, open, onOpenChange }: CallbackDetailDialogProps) {
  const [callback, setCallback] = useState<CallbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    if (open && callbackId) {
      fetchCallbackDetails();
    }
  }, [callbackId, open]);

  const fetchCallbackDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("callback_requests")
        .select("*")
        .eq("id", callbackId)
        .single();

      if (error) throw error;

      setCallback(data);
      setStatus(data.status);
      setPriority(data.priority);
      setAdminNotes(data.admin_notes || "");
      setOutcome(data.outcome || "");
      setCallDuration(data.call_duration_minutes?.toString() || "");
      setFollowUpDate(data.follow_up_date || "");
    } catch (error: any) {
      console.error("Error fetching callback details:", error);
      toast({
        title: "Error",
        description: "Failed to load callback details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: any = {
        status,
        priority,
        admin_notes: adminNotes || null,
        outcome: outcome || null,
        call_duration_minutes: callDuration ? parseInt(callDuration) : null,
        follow_up_date: followUpDate || null,
      };

      if (status === "completed" && !callback?.contacted_at) {
        updates.contacted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("callback_requests")
        .update(updates)
        .eq("id", callbackId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Callback request updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating callback:", error);
      toast({
        title: "Error",
        description: "Failed to update callback request.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  if (isLoading || !callback) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Callback Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <div className="font-medium">{callback.customer_name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Company</Label>
                <div className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {callback.company_name || "N/A"}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${callback.customer_email}`} className="text-primary hover:underline">
                    {callback.customer_email}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(callback.customer_email, "Email")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${callback.customer_phone}`} className="text-primary hover:underline">
                    {callback.customer_phone}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(callback.customer_phone, "Phone")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Request Details
            </h3>
            <div className="space-y-3">
              {callback.preferred_date && callback.preferred_time_slot ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Preferred Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(callback.preferred_date), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Time Slot</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="capitalize">{callback.preferred_time_slot}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-500">URGENT</Badge>
                    <span className="font-semibold text-red-900">Immediate Callback Required</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Customer expects a call within 2-5 minutes. Requested {formatDistanceToNow(new Date(callback.created_at), { addSuffix: true })}.
                  </p>
                </div>
              )}
              {callback.reason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <Badge variant="outline" className="capitalize">
                    {callback.reason.replace("_", " ")}
                  </Badge>
                </div>
              )}
              {callback.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Customer Message</Label>
                  <div className="bg-muted/50 p-3 rounded-md flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-1" />
                    <p className="text-sm">{callback.message}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Source</Label>
                  <div className="capitalize">{callback.source?.replace("_", " ") || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location Page</Label>
                  <div>{callback.location_page || "N/A"}</div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <div>{format(new Date(callback.created_at), "PPpp")}</div>
              </div>
              {callback.follow_up_date && (
                <div>
                  <Label className="text-xs text-muted-foreground">Follow-Up Scheduled</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">
                      {format(new Date(callback.follow_up_date), "MMMM dd, yyyy")}
                    </span>
                    {new Date(callback.follow_up_date) < new Date() && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                    {new Date(callback.follow_up_date).toDateString() === new Date().toDateString() && (
                      <Badge className="bg-orange-500">Due Today</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Management Section */}
          <div>
            <h3 className="font-semibold mb-3">Management</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status === "completed" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Outcome</Label>
                      <Select value={outcome} onValueChange={setOutcome}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="quote_sent">Quote Sent</SelectItem>
                          <SelectItem value="order_placed">Order Placed</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Call Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        placeholder="e.g., 15"
                      />
                    </div>
                  </div>
                  
                  {outcome === "follow_up_needed" && (
                    <div>
                      <Label>Follow-Up Date</Label>
                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Schedule when to follow up with this customer
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this callback..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reminder Information */}
          {callback.scheduled_date_time && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Reminder Status
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Scheduled For</Label>
                    <div className="font-medium">
                      {format(new Date(callback.scheduled_date_time), "PPp")}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Reminder Status</Label>
                    <div>
                      {callback.reminder_sent_at ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Sent on {format(new Date(callback.reminder_sent_at), "PPp")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Pending (will be sent 24h before)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.functions.invoke('send-callback-reminders', {
                        body: { callbackIds: [callbackId] }
                      });
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Success",
                        description: "Reminder sent to customer and admin successfully.",
                      });
                      
                      fetchCallbackDetails();
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: "Failed to send reminder: " + error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Send Reminder Now
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
