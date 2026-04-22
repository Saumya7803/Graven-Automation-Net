import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuestionDetailDialog } from "@/components/admin/QuestionDetailDialog";
import { MessageSquare, Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function QuestionsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ["admin-questions", statusFilter, categoryFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("customer_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (searchQuery) {
        query = query.or(`customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%,question.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["questions-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_questions")
        .select("status, created_at");
      
      if (error) throw error;

      const total = data.length;
      const pending = data.filter(q => q.status === "pending").length;
      const today = data.filter(q => {
        const created = new Date(q.created_at);
        const now = new Date();
        return created.toDateString() === now.toDateString();
      }).length;

      return { total, pending, today };
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      answered: "bg-green-500",
      archived: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      product: "bg-purple-500",
      technical: "bg-orange-500",
      pricing: "bg-green-500",
      delivery: "bg-blue-500",
      installation: "bg-red-500",
      general: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Questions</h1>
          <p className="text-muted-foreground">Manage and respond to customer inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter questions by status, category, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : questions && questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{question.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{question.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{question.question}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(question.category)}>
                        {question.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(question.status)}>
                        {question.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {question.location_page ? (
                        <Badge variant="outline">{question.location_page}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(question.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQuestion(question)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No questions found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQuestion && (
        <QuestionDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          question={selectedQuestion}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}
