import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Key, Trash2, Plus } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  is_active: boolean;
  permissions: any;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function ApiDocs() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
    fetchApiKeys();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch API keys: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return 'sk_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const hashKey = async (key: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    try {
      const apiKey = generateApiKey();
      const keyHash = await hashKey(apiKey);
      const keyPreview = apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 4);

      const { error } = await supabase
        .from("api_keys")
        .insert([{
          name: newKeyName,
          key_hash: keyHash,
          key_preview: keyPreview,
          created_by: user?.id,
        }]);

      if (error) throw error;

      setGeneratedKey(apiKey);
      setNewKeyName("");
      toast.success("API key generated successfully");
      fetchApiKeys();
    } catch (error: any) {
      toast.error("Failed to generate API key: " + error.message);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("API key deleted successfully");
      fetchApiKeys();
    } catch (error: any) {
      toast.error("Failed to delete API key: " + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const functionsBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  const exampleCurl = `curl -X GET "${functionsBaseUrl}/crm-api/rfqs?status=pending&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

  const exampleResponse = `{
  "data": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "status": "pending",
      "total_amount": 5000.00,
      "created_at": "2025-01-31T10:00:00Z",
      "quotation_request_items": [...]
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}`;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">Access RFQ and Order data programmatically</p>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate API Key</CardTitle>
                <CardDescription>Create a new API key for CRM integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-grow">
                    <Label htmlFor="keyName">API Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production CRM Key"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleGenerateKey}>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Key
                    </Button>
                  </div>
                </div>

                {generatedKey && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">⚠️ Save this API key now - you won't be able to see it again!</p>
                    <div className="flex gap-2">
                      <Input value={generatedKey} readOnly className="font-mono" />
                      <Button size="sm" onClick={() => copyToClipboard(generatedKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active API Keys</CardTitle>
                <CardDescription>Manage your API keys</CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No API keys generated yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key Preview</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-medium">{key.name}</TableCell>
                          <TableCell className="font-mono">{key.key_preview}</TableCell>
                          <TableCell>
                            {key.last_used_at 
                              ? new Date(key.last_used_at).toLocaleString()
                              : "Never"
                            }
                          </TableCell>
                          <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {key.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteKey(key.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/crm-api/rfqs</code>
                  </div>
                  <p className="text-sm text-muted-foreground">List all RFQs with filtering</p>
                  <div className="mt-2 text-sm">
                    <strong>Query Parameters:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>status - Filter by RFQ status</li>
                      <li>from_date - Filter from date</li>
                      <li>to_date - Filter to date</li>
                      <li>customer_email - Filter by customer email</li>
                      <li>limit - Results per page (default: 50)</li>
                      <li>offset - Pagination offset (default: 0)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/crm-api/rfqs/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Get single RFQ with all details</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">PATCH</Badge>
                    <code className="text-sm">/crm-api/rfqs/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Update RFQ admin notes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/crm-api/orders</code>
                  </div>
                  <p className="text-sm text-muted-foreground">List all orders with filtering</p>
                  <div className="mt-2 text-sm">
                    <strong>Query Parameters:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>status - Filter by order status</li>
                      <li>payment_status - Filter by payment status</li>
                      <li>from_date - Filter from date</li>
                      <li>to_date - Filter to date</li>
                      <li>customer_email - Filter by customer email</li>
                      <li>limit - Results per page (default: 50)</li>
                      <li>offset - Pagination offset (default: 0)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/crm-api/orders/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Get single order with all details</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">PATCH</Badge>
                    <code className="text-sm">/crm-api/orders/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Update order notes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/crm-api/customers</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Get all customers with RFQ and order counts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>cURL Example</CardTitle>
                <CardDescription>Fetch pending RFQs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{exampleCurl}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(exampleCurl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{exampleResponse}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(exampleResponse)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>JavaScript Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{`const response = await fetch(
  '${functionsBaseUrl}/crm-api/rfqs?status=pending',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
const data = await response.json();
console.log(data);`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
