import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ProductRow {
  sku: string;
  name: string;
  series: string;
  power_range: string;
  price: string;
  category: string;
  stock_quantity: string;
  short_description: string;
  description: string;
  is_active: string;
  featured: string;
}

const BulkImport = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate]);

  const downloadTemplate = () => {
    const csvContent = "sku,name,series,power_range,price,category,stock_quantity,short_description,description,is_active,featured\nATV320-001,Altivar ATV320,ATV320,0.18 to 15 kW,285.00,Compact Drives,50,Compact VFD for basic applications,The Altivar ATV320 is a compact variable frequency drive designed for simple applications.,true,false\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const rows: ProductRow[] = lines.slice(1, 11).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row as ProductRow;
      });

      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const rows: ProductRow[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row as ProductRow;
      });

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setProgress(((i + 1) / rows.length) * 100);

        try {
          // Get category ID
          const { data: categoryData } = await supabase
            .from("product_categories")
            .select("id")
            .eq("name", row.category)
            .maybeSingle();

          const productData = {
            sku: row.sku,
            name: row.name,
            series: row.series,
            power_range: row.power_range,
            price: parseFloat(row.price),
            category_id: categoryData?.id || null,
            stock_quantity: parseInt(row.stock_quantity) || 0,
            short_description: row.short_description,
            description: row.description,
            is_active: row.is_active?.toLowerCase() === 'true',
            featured: row.featured?.toLowerCase() === 'true'
          };

          const { error } = await supabase
            .from("products")
            .insert(productData);

          if (error) {
            failedCount++;
            errors.push(`Row ${i + 2}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error: any) {
          failedCount++;
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setResults({ success: successCount, failed: failedCount, errors });
      setImporting(false);
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} products`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} products`);
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Bulk Product Import</h1>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CSV Template</CardTitle>
                <CardDescription>
                  Download the CSV template to ensure your data is formatted correctly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Select a CSV file containing product data (max 3000 products)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="csv-file" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                        <FileText className="h-4 w-4" />
                        {file ? file.name : "Choose File"}
                      </div>
                    </Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file && (
                      <Button onClick={handleImport} disabled={importing}>
                        {importing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Import Products
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {importing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-muted-foreground">
                        Importing products... {Math.round(progress)}%
                      </p>
                    </div>
                  )}

                  {results.success > 0 || results.failed > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Successfully imported: {results.success}</span>
                      </div>
                      {results.failed > 0 && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>Failed to import: {results.failed}</span>
                          </div>
                          {results.errors.length > 0 && (
                            <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                              <h4 className="font-semibold text-sm mb-2">Errors:</h4>
                              <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                                {results.errors.slice(0, 20).map((error, i) => (
                                  <li key={i} className="text-destructive">{error}</li>
                                ))}
                                {results.errors.length > 20 && (
                                  <li className="text-muted-foreground">
                                    ... and {results.errors.length - 20} more errors
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {preview.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview (First 10 rows)</CardTitle>
                  <CardDescription>
                    Review your data before importing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Series</TableHead>
                          <TableHead>Power Range</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-sm">{row.sku}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.series}</TableCell>
                            <TableCell>{row.power_range}</TableCell>
                            <TableCell>{formatCurrency(Number(row.price))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BulkImport;