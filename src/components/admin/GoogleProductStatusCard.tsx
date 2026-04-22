import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ExternalLink, RefreshCw, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GoogleProductStatusCardProps {
  status: {
    approval_status: string;
    last_synced_at: string | null;
    merchant_product_id: string | null;
    item_level_issues: any;
    sync_error: string | null;
    impressions?: number;
    clicks?: number;
  } | null;
  onSync?: () => void;
  loading?: boolean;
}

export function GoogleProductStatusCard({ status, onSync, loading }: GoogleProductStatusCardProps) {
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Google Shopping Status
          </CardTitle>
          <CardDescription>This product has not been synced to Google Merchant Center yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onSync} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync to Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (status.approval_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'disapproved':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Disapproved</Badge>;
      case 'error':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Not Synced</Badge>;
    }
  };

  const hasIssues = status.item_level_issues && 
    (Array.isArray(status.item_level_issues) ? status.item_level_issues.length > 0 : Object.keys(status.item_level_issues).length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Google Shopping Status
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {status.last_synced_at 
            ? `Last synced ${formatDistanceToNow(new Date(status.last_synced_at), { addSuffix: true })}`
            : 'Never synced'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        {status.approval_status === 'approved' && (status.impressions || status.clicks) && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Impressions</p>
              <p className="text-2xl font-bold">{status.impressions || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="text-2xl font-bold">{status.clicks || 0}</p>
            </div>
            {status.impressions && status.clicks && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-lg font-semibold">
                    {((status.clicks / status.impressions) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sync Error */}
        {status.sync_error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{status.sync_error}</AlertDescription>
          </Alert>
        )}

        {/* Item Level Issues */}
        {hasIssues && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Issues detected:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Array.isArray(status.item_level_issues) 
                  ? status.item_level_issues.map((issue: any, idx: number) => (
                      <li key={idx}>
                        {issue.description || issue.servability || issue.code || 'Unknown issue'}
                      </li>
                    ))
                  : Object.entries(status.item_level_issues).map(([key, value]) => (
                      <li key={key}>{`${key}: ${value}`}</li>
                    ))
                }
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onSync} disabled={loading} variant="outline" size="sm">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          {status.merchant_product_id && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://merchants.google.com/mc/products/diagnostics/product/${status.merchant_product_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Google
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
