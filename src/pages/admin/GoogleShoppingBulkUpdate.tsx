import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Table2, BarChart3, Download, Save, Loader2, CheckCircle2, XCircle, Zap, Copy, RefreshCw, TrendingUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/integrations/supabase/config";
import { CSVUploader } from "@/components/admin/CSVUploader";
import { GoogleCategoryAutocomplete } from "@/components/admin/GoogleCategoryAutocomplete";
import {
  validateImageUrlSync,
  validateCondition,
  validateBrand,
  isGoogleShoppingComplete,
  calculateCompletionPercentage,
} from "@/lib/googleShoppingValidation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  condition: string | null;
  google_product_category: string | null;
  image_url: string | null;
  price: number;
  is_active: boolean;
}

interface ProductUpdate {
  sku: string;
  brand?: string;
  condition?: string;
  google_product_category?: string;
  image_url?: string;
}

export default function GoogleShoppingBulkUpdate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editedProducts, setEditedProducts] = useState<Map<string, Partial<Product>>>(new Map());
  const [csvData, setCsvData] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [productImages, setProductImages] = useState<Map<string, string>>(new Map());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sku');

      if (error) throw error;
      setProducts(data || []);

      // Fetch product images with primary images first
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, image_url, is_primary')
        .order('is_primary', { ascending: false });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      // Create image map (first image per product, prioritizing primary)
      const imageMap = new Map<string, string>();
      if (images) {
        images.forEach((img: any) => {
          if (!imageMap.has(img.product_id)) {
            imageMap.set(img.product_id, img.image_url);
          }
        });
      }
      setProductImages(imageMap);

    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncPrimaryImages = async () => {
    setSyncing(true);
    
    try {
      const { data, error } = await supabase.rpc('sync_primary_images_to_products');
      
      if (error) throw error;
      
      const result = data[0];
      
      toast({
        title: "Image Sync Complete",
        description: `✅ Updated ${result.updated_count} of ${result.total_products} products`,
      });
      
      // Refresh products to show updated data
      await fetchProducts();
      
    } catch (error) {
      console.error('Error syncing images:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync images",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // CSV Upload Functions (using MPN strategy - SKU as identifier)
  const downloadTemplate = () => {
    const headers = ['sku', 'name', 'current_brand', 'new_brand', 'current_condition', 'new_condition', 'current_google_category', 'new_google_category', 'current_image_url', 'new_image_url'];
    const rows = products.map(p => [
      p.sku,
      p.name,
      p.brand || '',
      '', // new_brand
      p.condition || '',
      '', // new_condition
      p.google_product_category || '',
      '', // new_google_category
      p.image_url || '',
      '', // new_image_url
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-shopping-template-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (data: any[]) => {
    setCsvData(data);
    toast({
      title: "CSV Uploaded",
      description: `Loaded ${data.length} rows. Review and apply changes.`,
    });
  };

  const applyCSVUpdates = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    setUploadProgress(0);

    const updates: ProductUpdate[] = csvData.map(row => ({
      sku: row.sku,
      ...(row.new_brand && { brand: row.new_brand }),
      ...(row.new_condition && { condition: row.new_condition }),
      ...(row.new_google_category && { google_product_category: row.new_google_category }),
      ...(row.new_image_url && { image_url: row.new_image_url }),
    })).filter(update => Object.keys(update).length > 1); // Only updates with at least one field

    try {
      const { data, error } = await supabase.functions.invoke('bulk-update-google-shopping', {
        body: { updates }
      });

      if (error) throw error;

      setUploadProgress(100);
      toast({
        title: "Update Complete",
        description: `✅ ${data.success} succeeded, ❌ ${data.failed} failed`,
      });

      // Refresh products
      await fetchProducts();
      setCsvData([]);
    } catch (error) {
      console.error('Error applying updates:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setUploadProgress(0);
    }
  };

  // Inline Editor Functions
  const handleFieldChange = (productId: string, field: keyof Product, value: any) => {
    const current = editedProducts.get(productId) || {};
    setEditedProducts(new Map(editedProducts.set(productId, { ...current, [field]: value })));
  };

  const saveProduct = async (productId: string) => {
    const changes = editedProducts.get(productId);
    if (!changes) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const { error } = await supabase
        .from('products')
        .update(changes)
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Saved",
        description: `Updated ${product.sku}`,
      });

      // Update local state
      setProducts(products.map(p => p.id === productId ? { ...p, ...changes } : p));
      const newEdited = new Map(editedProducts);
      newEdited.delete(productId);
      setEditedProducts(newEdited);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const saveBulk = async () => {
    if (editedProducts.size === 0) {
      toast({
        title: "No Changes",
        description: "No products have been edited",
      });
      return;
    }

    setUpdating(true);

    const updates: ProductUpdate[] = Array.from(editedProducts.entries()).map(([id, changes]) => {
      const product = products.find(p => p.id === id);
      return {
        sku: product!.sku,
        ...changes
      };
    });

    try {
      const { data, error } = await supabase.functions.invoke('bulk-update-google-shopping', {
        body: { updates }
      });

      if (error) throw error;

      toast({
        title: "Bulk Save Complete",
        description: `✅ ${data.success} succeeded, ❌ ${data.failed} failed`,
      });

      await fetchProducts();
      setEditedProducts(new Map());
    } catch (error) {
      console.error('Error bulk saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Smart Actions
  const applyDefaultBrand = () => {
    const selected = Array.from(selectedProducts);
    if (selected.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select products first",
      });
      return;
    }

    selected.forEach(id => {
      handleFieldChange(id, 'brand', 'Schneider Electric');
    });

    toast({
      title: "Applied",
      description: `Set brand to "Schneider Electric" for ${selected.length} products`,
    });
  };

  const applyDefaultCondition = () => {
    const selected = Array.from(selectedProducts);
    if (selected.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select products first",
      });
      return;
    }

    selected.forEach(id => {
      handleFieldChange(id, 'condition', 'new');
    });

    toast({
      title: "Applied",
      description: `Set condition to "new" for ${selected.length} products`,
    });
  };

  const usePrimaryImages = () => {
    const selected = Array.from(selectedProducts);
    if (selected.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select products first",
      });
      return;
    }

    selected.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product?.image_url) {
        handleFieldChange(id, 'image_url', product.image_url);
      }
    });

    toast({
      title: "Applied",
      description: `Used primary images for ${selected.length} products`,
    });
  };

  // Statistics (using MPN strategy - SKU is the identifier)
  const stats = {
    total: products.length,
    complete: products.filter(p => isGoogleShoppingComplete(p)).length,
    missingImage: products.filter(p => !p.image_url && !productImages.has(p.id)).length,
    missingCategory: products.filter(p => !p.google_product_category).length,
  };

  const completionRate = Math.round((stats.complete / stats.total) * 100);

  // Filtered products
  const filteredProducts = products.filter(p =>
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
            <h1 className="text-3xl font-bold">Google Shopping Data Manager</h1>
            <p className="text-muted-foreground">
              Using MPN strategy (SKU as Manufacturer Part Number) - No GTINs required
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/google-shopping/dashboard')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/google-merchant-settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Badge variant={completionRate > 80 ? "default" : "secondary"} className="text-lg px-4 py-2">
            {completionRate}% Complete
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="csv" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv" className="gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <Table2 className="h-4 w-4" />
            Inline Editor
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Quality
          </TabsTrigger>
        </TabsList>

        {/* CSV Upload Tab */}
        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Bulk Upload</CardTitle>
              <CardDescription>
                Download the template, fill in the "new_*" columns, and upload to apply changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CSVUploader
                onFileUpload={handleCSVUpload}
                onDownloadTemplate={downloadTemplate}
              />

              {csvData.length > 0 && (
                <>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Loaded {csvData.length} rows. Review the preview below and click "Apply Changes" to update products.
                    </AlertDescription>
                  </Alert>

                  <div className="border rounded-lg overflow-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>New Brand</TableHead>
                          <TableHead>New Condition</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.slice(0, 10).map((row, idx) => {
                          const brandValid = !row.new_brand || validateBrand(row.new_brand).valid;
                          const conditionValid = !row.new_condition || validateCondition(row.new_condition).valid;
                          const allValid = brandValid && conditionValid;

                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-mono">{row.sku}</TableCell>
                              <TableCell>{row.new_brand || '-'}</TableCell>
                              <TableCell>{row.new_condition || '-'}</TableCell>
                              <TableCell>
                                {allValid ? (
                                  <Badge variant="default" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Invalid
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {csvData.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing first 10 of {csvData.length} rows
                    </p>
                  )}

                  {updating && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-center text-muted-foreground">
                        Updating products... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={applyCSVUpdates}
                    disabled={updating}
                    className="w-full"
                    size="lg"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Apply Changes ({csvData.length} products)
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inline Editor Tab */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inline Product Editor</CardTitle>
                  <CardDescription>
                    Edit products directly in the table
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={saveBulk}
                    disabled={editedProducts.size === 0 || updating}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save All ({editedProducts.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bulk Actions */}
              {selectedProducts.size > 0 && (
                <div className="flex items-center gap-2 p-4 border rounded-lg bg-accent">
                  <Badge>{selectedProducts.size} selected</Badge>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="outline" onClick={applyDefaultBrand}>
                      <Zap className="h-3 w-3 mr-1" />
                      Set Brand
                    </Button>
                    <Button size="sm" variant="outline" onClick={applyDefaultCondition}>
                      <Zap className="h-3 w-3 mr-1" />
                      Set Condition
                    </Button>
                    <Button size="sm" variant="outline" onClick={usePrimaryImages}>
                      <Copy className="h-3 w-3 mr-1" />
                      Use Images
                    </Button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div>
                <Input
                  placeholder="Search by SKU or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Products Table */}
              <div className="border rounded-lg overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProducts.size === filteredProducts.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
                            } else {
                              setSelectedProducts(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>SKU (MPN)</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const edited = editedProducts.get(product.id) || {};
                      const currentBrand = edited.brand ?? product.brand;
                      const currentCondition = edited.condition ?? product.condition;
                      const hasChanges = editedProducts.has(product.id);
                      const completion = calculateCompletionPercentage({ ...product, ...edited });

                      return (
                        <TableRow key={product.id} className={hasChanges ? 'bg-accent/50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedProducts);
                                if (checked) {
                                  newSelected.add(product.id);
                                } else {
                                  newSelected.delete(product.id);
                                }
                                setSelectedProducts(newSelected);
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell className="max-w-xs truncate">{product.name}</TableCell>
                          <TableCell>
                            <Input
                              value={currentBrand || ''}
                              onChange={(e) => handleFieldChange(product.id, 'brand', e.target.value)}
                              placeholder="Enter brand"
                              className="w-40"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={currentCondition || ''}
                              onValueChange={(value) => handleFieldChange(product.id, 'condition', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="refurbished">Refurbished</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={completion === 100 ? "default" : "secondary"}>
                              {completion}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => saveProduct(product.id)}
                              disabled={!hasChanges}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
                <p className="text-xs text-muted-foreground">{completionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missing Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.missingImage}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missing Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.missingCategory}</div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription>
              <strong>MPN Strategy:</strong> Products use SKU as Manufacturer Part Number (MPN) instead of GTIN. 
              Google accepts Brand + MPN for product identification. This eliminates the need for GTINs.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Completion Progress</CardTitle>
              <CardDescription>Overall Google Shopping data completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall</span>
                  <span className="text-sm text-muted-foreground">{completionRate}%</span>
                </div>
                <Progress value={completionRate} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products Missing Data</CardTitle>
              <CardDescription>Review and complete these products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.filter(p => !isGoogleShoppingComplete(p)).slice(0, 10).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-mono text-sm">{product.sku}</p>
                      <p className="text-xs text-muted-foreground">{product.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {calculateCompletionPercentage(product)}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          document.querySelector('[value="table"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export & Actions</CardTitle>
              <CardDescription>Download data, sync images, or preview feed</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={syncPrimaryImages}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Primary Images
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Export Incomplete Products
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`${SUPABASE_URL}/functions/v1/generate-google-shopping-feed`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Google Feed
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
