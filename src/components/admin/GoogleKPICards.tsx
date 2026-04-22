import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KPICardsProps {
  totalProducts: number;
  syncedProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  disapprovedProducts: number;
  notSyncedProducts: number;
  approvalRate: number;
  qualityScore: number;
}

export function GoogleKPICards({
  totalProducts,
  syncedProducts,
  approvedProducts,
  pendingProducts,
  disapprovedProducts,
  notSyncedProducts,
  approvalRate,
  qualityScore,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Products */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-3xl font-bold mt-2">{totalProducts}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {syncedProducts} synced to Google
          </p>
        </CardContent>
      </Card>

      {/* Approved Products */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <h3 className="text-3xl font-bold mt-2 text-green-600">{approvedProducts}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {pendingProducts} pending approval
          </p>
        </CardContent>
      </Card>

      {/* Approval Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
              <h3 className="text-3xl font-bold mt-2">{approvalRate}%</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Badge variant={approvalRate > 80 ? "default" : "secondary"} className="mt-4">
            {approvalRate > 80 ? "Excellent" : "Needs Improvement"}
          </Badge>
        </CardContent>
      </Card>

      {/* Data Quality Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
              <h3 className="text-3xl font-bold mt-2">{qualityScore}%</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Complete product data
          </p>
        </CardContent>
      </Card>

      {/* Status Breakdown Cards */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Not Synced</p>
              <h3 className="text-2xl font-bold mt-2">{notSyncedProducts}</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold mt-2 text-yellow-600">{pendingProducts}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Disapproved</p>
              <h3 className="text-2xl font-bold mt-2 text-red-600">{disapprovedProducts}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Errors</p>
              <h3 className="text-2xl font-bold mt-2 text-orange-600">{disapprovedProducts}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
