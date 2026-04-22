import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Calendar, IndianRupee, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface Quotation {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  final_amount: number;
  quoted_at: string | null;
  expires_at: string | null;
  items_count: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  quoted: "bg-green-100 text-green-800",
  revision_requested: "bg-orange-100 text-orange-800",
  revised: "bg-purple-100 text-purple-800",
  finalized: "bg-emerald-100 text-emerald-800",
  converted_to_order: "bg-gray-100 text-gray-800",
  closed: "bg-red-100 text-red-800",
};

const MyQuotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("quotation_requests")
        .select(`
          *,
          items:quotation_request_items(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((q: any) => ({
        ...q,
        items_count: q.items[0]?.count || 0,
      })) || [];

      setQuotations(formattedData);
    } catch (error: any) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "pending") return q.status === "pending";
    if (selectedTab === "quoted") return ["quoted", "revised"].includes(q.status);
    if (selectedTab === "finalized") return ["finalized", "converted_to_order"].includes(q.status);
    return true;
  });

  const stats = {
    total: quotations.length,
    pending: quotations.filter((q) => q.status === "pending").length,
    quoted: quotations.filter((q) => ["quoted", "revised"].includes(q.status)).length,
    finalized: quotations.filter((q) => ["finalized", "converted_to_order"].includes(q.status)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Quotations</h1>
            <p className="text-muted-foreground">
              View and manage your quotation requests
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quoted</p>
                  <p className="text-2xl font-bold">{stats.quoted}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Finalized</p>
                  <p className="text-2xl font-bold">{stats.finalized}</p>
                </div>
                <FileText className="h-8 w-8 text-emerald-500" />
              </div>
            </Card>
          </div>

          {/* Tabs and List */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="quoted">Quoted</TabsTrigger>
              <TabsTrigger value="finalized">Finalized</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {filteredQuotations.length === 0 ? (
                  <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No quotations found</p>
                    <p className="text-muted-foreground">
                      Your quotation requests will appear here
                    </p>
                  </Card>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <Card key={quotation.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              Quote #{quotation.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <Badge className={statusColors[quotation.status]}>
                              {quotation.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested: {format(new Date(quotation.created_at), "MMM dd, yyyy")}
                          </p>
                          {quotation.quoted_at && (
                            <p className="text-sm text-muted-foreground">
                              Quoted: {format(new Date(quotation.quoted_at), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                        <Button onClick={() => navigate(`/quotations/${quotation.id}`)}>
                          View Details
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Products</p>
                          <p className="font-medium">{quotation.items_count} items</p>
                        </div>
                        {quotation.final_amount > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-medium text-green-600">
                              {formatCurrency(quotation.final_amount)}
                            </p>
                          </div>
                        )}
                        {quotation.expires_at && (
                          <div>
                            <p className="text-sm text-muted-foreground">Expires</p>
                            <p className="font-medium">
                              {format(new Date(quotation.expires_at), "MMM dd, yyyy")}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyQuotations;
