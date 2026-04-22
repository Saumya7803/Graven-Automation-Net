import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuotationSummaryProps {
  totalQuotations: number;
  pendingQuotations: number;
  quotedQuotations: number;
  loading?: boolean;
}

export const QuotationSummary = ({
  totalQuotations,
  pendingQuotations,
  quotedQuotations,
  loading,
}: QuotationSummaryProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>My Quotations</CardTitle>
            </div>
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>My Quotations</CardTitle>
          </div>
          <Button onClick={() => navigate("/my-quotations")} className="w-full sm:w-auto">
            View All Quotations
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalQuotations}</p>
              <p className="text-xs text-muted-foreground">Total Quotes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingQuotations}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">{quotedQuotations}</p>
              <p className="text-xs text-muted-foreground">Quoted</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Track your quotation requests and manage approved quotes
        </p>
      </CardContent>
    </Card>
  );
};
