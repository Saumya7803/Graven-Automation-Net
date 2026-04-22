import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, CheckCircle2, XCircle, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ImportResult {
  existing: string[];
  created: string[];
  errors: { sku: string; error: string }[];
}

const QuickSKUImport = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [skuInput, setSkuInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parsedSKUs, setParsedSKUs] = useState<string[]>([]);

  // Parse SKUs from input (handles newlines, commas, tabs, spaces)
  const parseSKUs = (input: string): string[] => {
    return input
      .split(/[\n,\t]+/)
      .map(sku => sku.trim().toUpperCase())
      .filter(sku => sku.length > 0)
      .filter((sku, index, self) => self.indexOf(sku) === index); // Remove duplicates
  };

  const handleInputChange = (value: string) => {
    setSkuInput(value);
    setParsedSKUs(parseSKUs(value));
    setResult(null);
  };

  const handleImport = async () => {
    if (parsedSKUs.length === 0) {
      toast.error("Please enter at least one SKU");
      return;
    }

    setProcessing(true);
    const importResult: ImportResult = {
      existing: [],
      created: [],
      errors: []
    };

    try {
      // Fetch all existing SKUs in one query
      const { data: existingProducts, error: fetchError } = await supabase
        .from("products")
        .select("sku")
        .in("sku", parsedSKUs);

      if (fetchError) throw fetchError;

      const existingSKUs = new Set(existingProducts?.map(p => p.sku?.toUpperCase()) || []);

      // Separate existing vs new SKUs
      const newSKUs: string[] = [];
      for (const sku of parsedSKUs) {
        if (existingSKUs.has(sku)) {
          importResult.existing.push(sku);
        } else {
          newSKUs.push(sku);
        }
      }

      // Create draft products for new SKUs
      if (newSKUs.length > 0) {
        const productsToInsert = newSKUs.map(sku => ({
          sku,
          name: sku, // Use SKU as initial name
          is_active: false, // Draft status
          price: 0,
          stock_quantity: 0,
          series: "", // Required field
          power_range: "" // Required field
        }));

        const { data: insertedProducts, error: insertError } = await supabase
          .from("products")
          .insert(productsToInsert)
          .select("sku");

        if (insertError) {
          // If bulk insert fails, try individual inserts
          for (const product of productsToInsert) {
            const { error: singleError } = await supabase
              .from("products")
              .insert([product]);

            if (singleError) {
              importResult.errors.push({ sku: product.sku, error: singleError.message });
            } else {
              importResult.created.push(product.sku);
            }
          }
        } else {
          importResult.created = insertedProducts?.map(p => p.sku) || [];
        }
      }

      setResult(importResult);
      
      if (importResult.created.length > 0) {
        toast.success(`Created ${importResult.created.length} draft products`);
      } else if (importResult.existing.length > 0 && importResult.errors.length === 0) {
        toast.info("All SKUs already exist in the system");
      }
    } catch (error: any) {
      toast.error("Import failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quick SKU Import</h1>
              <p className="text-muted-foreground">
                Paste model numbers to quickly add draft products
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Enter SKUs / Model Numbers
                </CardTitle>
                <CardDescription>
                  Paste your SKUs below (one per line, or comma/tab separated)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="ATV320U15M2&#10;ATV320U22M2&#10;ATV320U30M2&#10;&#10;Or paste comma-separated:&#10;ATV320U15M2, ATV320U22M2, ATV320U30M2"
                  value={skuInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={processing}
                />
                
                {parsedSKUs.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {parsedSKUs.length} unique SKU{parsedSKUs.length !== 1 ? "s" : ""} detected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSkuInput("");
                        setParsedSKUs([]);
                        setResult(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={processing || parsedSKUs.length === 0}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Check & Import ({parsedSKUs.length} SKUs)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  View which SKUs were created or already exist
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!result && !processing && (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter SKUs and click "Check & Import" to see results</p>
                  </div>
                )}

                {processing && (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Checking SKUs and creating drafts...</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{result.created.length}</p>
                        <p className="text-sm text-muted-foreground">Created</p>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{result.existing.length}</p>
                        <p className="text-sm text-muted-foreground">Existing</p>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                        <p className="text-sm text-muted-foreground">Errors</p>
                      </div>
                    </div>

                    {/* Created Drafts */}
                    {result.created.length > 0 && (
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Created as Drafts ({result.created.length})
                        </h3>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                          {result.created.map(sku => (
                            <Badge key={sku} variant="secondary" className="font-mono">
                              {sku}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          <Link to="/admin/products?status=draft">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Edit Draft Products
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* Already Existing */}
                    {result.existing.length > 0 && (
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2 text-blue-600">
                          <AlertCircle className="h-4 w-4" />
                          Already Exists ({result.existing.length})
                        </h3>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                          {result.existing.map(sku => (
                            <Badge key={sku} variant="outline" className="font-mono">
                              {sku}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {result.errors.length > 0 && (
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          Errors ({result.errors.length})
                        </h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                          {result.errors.map(({ sku, error }) => (
                            <div key={sku} className="text-sm">
                              <span className="font-mono font-medium">{sku}</span>
                              <span className="text-muted-foreground">: {error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickSKUImport;
