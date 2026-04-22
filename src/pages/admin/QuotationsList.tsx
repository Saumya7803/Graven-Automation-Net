import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Eye, Filter, Paperclip, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuotationRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  company_name: string | null;
  product_name: string | null;
  quantity: number;
  status: "pending" | "reviewing" | "quoted" | "revision_requested" | "finalized" | "closed";
  attachment_url: string | null;
  created_at: string;
  message: string;
  items_count?: number;
  order_id?: string | null;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  quoted: "bg-green-500/10 text-green-500 border-green-500/20",
  revision_requested: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  finalized: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const QuotationsList = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    quoted: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchQuotations();
      fetchStats();
    }
  }, [isAdmin]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotation_requests")
        .select(`
          *,
          quotation_request_items (count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to include items count
      const quotationsWithCount = (data || []).map((q: any) => ({
        ...q,
        items_count: q.quotation_request_items?.[0]?.count || 0,
      }));
      
      setQuotations(quotationsWithCount);
    } catch (error: any) {
      console.error("Error fetching quotations:", error);
      toast({
        title: "Error",
        description: "Failed to load quotation requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("quotation_requests")
        .select("status");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((q) => q.status === "pending").length || 0,
        reviewing: data?.filter((q) => q.status === "reviewing").length || 0,
        quoted: data?.filter((q) => q.status === "quoted").length || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDelete = async (quotation: QuotationRequest) => {
    try {
      // Check if quotation is finalized (has order)
      const { data: quotationData, error: fetchError } = await supabase
        .from("quotation_requests")
        .select("order_id, status")
        .eq("id", quotation.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Prevent deletion if finalized
      if (quotationData?.order_id) {
        toast({
          title: "Cannot Delete",
          description: "This quotation is finalized and linked to an order. It cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      // Confirm deletion
      const confirmMessage = `Are you sure you want to delete this quotation from ${quotation.customer_name}? This action cannot be undone.`;
      if (!confirm(confirmMessage)) return;

      // Delete related items first (cascade)
      await supabase
        .from("quotation_request_items")
        .delete()
        .eq("quotation_request_id", quotation.id);

      // Delete the quotation
      const { error: deleteError } = await supabase
        .from("quotation_requests")
        .delete()
        .eq("id", quotation.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      });

      // Refresh lists
      fetchQuotations();
      fetchStats();
    } catch (error: any) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete quotation",
        variant: "destructive",
      });
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // If no search term, skip search filter
    if (searchLower) {
      const matchesSearch =
        q.customer_name?.toLowerCase().includes(searchLower) ||
        q.customer_email?.toLowerCase().includes(searchLower) ||
        (q.company_name && q.company_name.toLowerCase().includes(searchLower)) ||
        (q.product_name && q.product_name.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;

    return matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">RFQ Management</h1>
          <p className="text-muted-foreground">
            Manage quotation requests from customers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reviewing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">{stats.reviewing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quoted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{stats.quoted}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-center">
                    <Paperclip className="h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No quotation requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(quotation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quotation.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {quotation.customer_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{quotation.company_name || "-"}</TableCell>
                      <TableCell>
                        {quotation.items_count && quotation.items_count > 0 ? (
                          <Badge variant="secondary">
                            {quotation.items_count} {quotation.items_count === 1 ? 'item' : 'items'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">General Inquiry</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {quotation.attachment_url && (
                          <Paperclip className="h-4 w-4 text-muted-foreground inline" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[quotation.status]} variant="outline">
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/rfq/${quotation.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(quotation)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default QuotationsList;
