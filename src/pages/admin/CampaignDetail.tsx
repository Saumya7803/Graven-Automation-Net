import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Copy } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      const { data: campaignData } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("id", id)
        .single();

      const { data: deliveriesData } = await supabase
        .from("email_campaign_deliveries")
        .select("*")
        .eq("campaign_id", id)
        .order("created_at", { ascending: false });

      setCampaign(campaignData);
      setDeliveries(deliveriesData || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch campaign details" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto py-6">Loading...</div>;
  if (!campaign) return <div className="container mx-auto py-6">Campaign not found</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/email-campaigns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.subject}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/email-campaigns/${id}/edit`)}>Edit Campaign</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_recipients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successfully Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((campaign.total_sent / (campaign.total_recipients || 1)) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{delivery.customer_email}</TableCell>
                  <TableCell>
                    <Badge variant={delivery.customer_tier === "vip" ? "vip" : delivery.customer_tier === "regular" ? "regular" : "new"}>
                      {delivery.customer_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={delivery.status === "sent" ? "default" : "destructive"}>
                      {delivery.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {delivery.sent_at ? format(new Date(delivery.sent_at), "MMM d, yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-destructive">{delivery.error_message || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
