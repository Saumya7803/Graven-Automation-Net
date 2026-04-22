import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Settings, BarChart3, TrendingUp, Package, Eye, MousePointer, Download, FileText, ExternalLink, CheckCircle, Link2, Copy, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGoogleShoppingAnalytics, useSyncHistory, useProductStatusList, useTopIssues } from "@/hooks/useGoogleShoppingAnalytics";
import { usePerformanceSummary } from "@/hooks/useGooglePerformance";
import { GoogleKPICards } from "@/components/admin/GoogleKPICards";
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ValidationResults } from "@/types/googleShopping";

export default function GoogleShoppingDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [feedUrlCopied, setFeedUrlCopied] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useGoogleShoppingAnalytics();
  const { data: syncHistory } = useSyncHistory(30);
  const { data: productStatusList } = useProductStatusList();
  const { data: topIssues } = useTopIssues();
  
  // Get performance data for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: performanceSummary } = usePerformanceSummary(
    sevenDaysAgo.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-products-to-google', {
        body: { mode: 'full' }
      });

      if (error) throw error;

      toast({
        title: "Sync Started",
        description: `Syncing products to Google Merchant Center...`,
      });

      // Refetch analytics after a delay
      setTimeout(() => {
        refetchAnalytics();
      }, 2000);
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to start sync",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadFeed = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-google-shopping-feed', {
        method: 'GET',
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google-shopping-feed-${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Feed Downloaded",
        description: `Product feed generated with ${analytics?.totalProducts || 0} products. Ready to upload to Google Merchant Center.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate feed",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePreviewFeed = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-google-shopping-feed', {
        method: 'GET',
      });

      if (error) throw error;

      // Open in new tab
      const blob = new Blob([data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
    }
  };

  const feedUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-google-shopping-feed`;

  const handleCopyFeedUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    setFeedUrlCopied(true);
    toast({
      title: "URL Copied",
      description: "Feed URL copied to clipboard",
    });
    setTimeout(() => setFeedUrlCopied(false), 2000);
  };

  const handleTestFeed = () => {
    window.open(feedUrl, '_blank');
  };

  const handleValidateFeed = async () => {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-google-shopping-feed');
      
      if (error) throw error;
      
      setValidationResults(data);
      setShowValidation(true);
      
      toast({
        title: data.valid ? "Feed Validation Passed" : "Feed Validation Issues Found",
        description: data.valid 
          ? `${data.productCount} products validated successfully`
          : `Found ${data.errors.length} errors and ${data.warnings.length} warnings`,
        variant: data.valid ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate feed",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  // Prepare chart data
  const statusDistribution = analytics ? [
    { name: 'Approved', value: analytics.approvedProducts, fill: '#22c55e' },
    { name: 'Pending', value: analytics.pendingProducts, fill: '#eab308' },
    { name: 'Disapproved', value: analytics.disapprovedProducts, fill: '#ef4444' },
    { name: 'Not Synced', value: analytics.notSyncedProducts, fill: '#94a3b8' },
  ].filter(item => item.value > 0) : [];

  const syncTrendData = syncHistory?.map(log => ({
    date: new Date(log.created_at).toLocaleDateString(),
    approved: log.products_approved || 0,
    pending: log.products_pending || 0,
    disapproved: log.products_disapproved || 0,
  })) || [];

  // Filter products
  const filteredProducts = productStatusList?.filter(item => {
    const matchesSearch = !searchTerm || 
      item.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'disapproved':
        return <Badge variant="destructive">Disapproved</Badge>;
      case 'error':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Error</Badge>;
      default:
        return <Badge variant="outline">Not Synced</Badge>;
    }
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Google Shopping Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor sync performance and product status
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/google-shopping/performance">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance
            </Button>
          </Link>
          <Button variant="outline" onClick={() => navigate('/admin/google-merchant-settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleSyncAll} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Performance Quick Stats */}
      {performanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Impressions (7d)</p>
                  <h3 className="text-2xl font-bold mt-2">{performanceSummary.totalImpressions.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clicks (7d)</p>
                  <h3 className="text-2xl font-bold mt-2">{performanceSummary.totalClicks.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MousePointer className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CTR (7d)</p>
                  <h3 className="text-2xl font-bold mt-2">{performanceSummary.avgCTR.toFixed(2)}%</h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Full Analytics</p>
                <Link to="/admin/google-shopping/performance">
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics && (
        <>
          {/* KPI Cards */}
          <GoogleKPICards
            totalProducts={analytics.totalProducts}
            syncedProducts={analytics.syncedProducts}
            approvedProducts={analytics.approvedProducts}
            pendingProducts={analytics.pendingProducts}
            disapprovedProducts={analytics.disapprovedProducts}
            notSyncedProducts={analytics.notSyncedProducts}
            approvalRate={analytics.approvalRate}
            qualityScore={analytics.qualityScore}
          />

          {/* Automatic Feed URL Section */}
          <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-green-500/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Automatic Feed URL
                    <Badge className="bg-green-100 text-green-800 border-green-200">Recommended</Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Let Google Merchant Center automatically fetch your product updates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feed URL Display */}
              <div className="p-4 bg-background rounded-lg border space-y-3">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Feed Status: Live & Accessible</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span>⏱️ Updates hourly</span>
                      <span>•</span>
                      <span>📦 {analytics.totalProducts} products</span>
                      <span>•</span>
                      <span>✅ Valid RSS 2.0 format</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Feed URL:</label>
                  <div className="flex gap-2">
                    <Input 
                      value={feedUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyFeedUrl}
                      className="gap-2 whitespace-nowrap"
                    >
                      {feedUrlCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy URL
                        </>
                      )}
                    </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestFeed}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Test Feed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleValidateFeed}
                    disabled={validating}
                    className="gap-2"
                  >
                    {validating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Validate Feed
                      </>
                    )}
                  </Button>
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="p-4 bg-background rounded-lg border space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Setup Instructions for Google Merchant Center
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Go to Google Merchant Center</p>
                      <a 
                        href="https://merchants.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Open Merchant Center
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Navigate to Products → Feeds</p>
                      <p className="text-sm text-muted-foreground">Find the Feeds section in the left menu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Add Feed or Edit Existing</p>
                      <p className="text-sm text-muted-foreground">Click "Add Feed" button</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Choose "Scheduled fetch"</p>
                      <p className="text-sm text-muted-foreground">Instead of file upload, select the scheduled fetch option</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      5
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Enter Feed URL and Set Schedule</p>
                      <p className="text-sm text-muted-foreground">
                        Paste your feed URL above and set update frequency (recommended: every 12 hours)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      6
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Save and Monitor</p>
                      <p className="text-sm text-muted-foreground">
                        Click "Create feed" and monitor the feed status in your dashboard
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg mt-4">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">✨ Benefits of Automatic Fetching:</p>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Zero manual work - Google automatically fetches updates</li>
                    <li>• Always up-to-date - Products sync when you make changes</li>
                    <li>• Hands-free operation - Set it once, forget it</li>
                    <li>• Reduced errors - No manual upload mistakes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {showValidation && validationResults && (
            <Card className={validationResults.valid ? "border-green-500/20" : "border-red-500/20"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResults.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Feed Validation Results
                  <Badge variant={validationResults.valid ? "default" : "destructive"}>
                    {validationResults.valid ? "Valid" : "Issues Found"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Validated {validationResults.productCount} products in {validationResults.summary.validationTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{validationResults.summary.totalProducts}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{validationResults.errors.length}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{validationResults.warnings.length}</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </div>

                {/* Errors List */}
                {validationResults.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Errors ({validationResults.errors.length})
                    </h4>
                    <div className="space-y-2">
                      {validationResults.errors.map((error, idx) => (
                        <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Badge variant="destructive" className="text-xs">{error.field}</Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{error.message}</p>
                              {error.productId && (
                                <p className="text-xs text-muted-foreground mt-1">Product: {error.productId}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings List */}
                {validationResults.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Warnings ({validationResults.warnings.length})
                    </h4>
                    <div className="space-y-2">
                      {validationResults.warnings.map((warning, idx) => (
                        <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              {warning.field}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{warning.message}</p>
                              {warning.productId && (
                                <p className="text-xs text-muted-foreground mt-1">Product: {warning.productId}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {validationResults.valid && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">Feed is Valid!</p>
                      <p className="text-sm text-green-700 mt-1">
                        All {validationResults.productCount} products meet Google Shopping requirements.
                        Your feed is ready to be used in Google Merchant Center.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Feed Download Section */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Manual Product Feed Export
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Download your product feed as XML and manually upload it to Google Merchant Center
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ready to Export</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics.totalProducts} Products</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All active products will be included in the feed
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviewFeed}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleDownloadFeed}
                    disabled={downloading}
                    className="gap-2"
                  >
                    {downloading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Feed
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full justify-between"
                >
                  <span className="font-medium">How to upload to Google Merchant Center</span>
                  <span className="text-muted-foreground">{showInstructions ? '−' : '+'}</span>
                </Button>
                
                {showInstructions && (
                  <div className="p-4 bg-background rounded-lg border space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Download the XML feed</p>
                        <p className="text-sm text-muted-foreground">Click the "Download Feed" button above</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Go to Google Merchant Center</p>
                        <a 
                          href="https://merchants.google.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Open Merchant Center
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Navigate to Products → Feeds</p>
                        <p className="text-sm text-muted-foreground">Find the Feeds section in the left menu</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Create or update feed</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Add Feed" (or update existing) → Select "File upload" → Upload your XML file
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Configure upload schedule</p>
                        <p className="text-sm text-muted-foreground">
                          Choose manual upload or set automatic fetch from URL (if hosting the feed)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mt-4">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Tip:</strong> Download fresh feed each time before uploading to ensure latest product data
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status Distribution</CardTitle>
                <CardDescription>Current sync status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    approved: { label: "Approved", color: "hsl(var(--chart-1))" },
                    pending: { label: "Pending", color: "hsl(var(--chart-2))" },
                    disapproved: { label: "Disapproved", color: "hsl(var(--chart-3))" },
                    notSynced: { label: "Not Synced", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Issues Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Rejection Reasons</CardTitle>
                <CardDescription>Most common issues preventing approval</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Products Affected", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topIssues?.slice(0, 5) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sync Performance Trend */}
          {syncTrendData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance Trend (Last 30 Days)</CardTitle>
                <CardDescription>Track approval rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    approved: { label: "Approved", color: "hsl(var(--chart-1))" },
                    pending: { label: "Pending", color: "hsl(var(--chart-2))" },
                    disapproved: { label: "Disapproved", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={syncTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="pending" stroke="#eab308" strokeWidth={2} />
                      <Line type="monotone" dataKey="disapproved" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Product Status Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status Details</CardTitle>
              <CardDescription>View and manage individual product sync status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search by SKU or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="disapproved">Disapproved</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="not_synced">Not Synced</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => navigate('/admin/google-shopping')}>
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </div>

              <div className="border rounded-lg overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((item: any) => {
                        const hasIssues = item.item_level_issues && 
                          (Array.isArray(item.item_level_issues) ? item.item_level_issues.length > 0 : Object.keys(item.item_level_issues).length > 0);

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-sm">{item.products?.sku}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.products?.name}</TableCell>
                            <TableCell>{getStatusBadge(item.approval_status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {item.last_synced_at 
                                ? formatDistanceToNow(new Date(item.last_synced_at), { addSuffix: true })
                                : 'Never'}
                            </TableCell>
                            <TableCell>
                              {hasIssues ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                  {Array.isArray(item.item_level_issues) ? item.item_level_issues.length : Object.keys(item.item_level_issues).length} issue(s)
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">None</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredProducts.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing {filteredProducts.length} of {productStatusList?.length || 0} products
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
