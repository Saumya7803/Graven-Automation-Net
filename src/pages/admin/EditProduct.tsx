import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useGoogleProductStatus } from "@/hooks/useGoogleProductStatus";
import { GoogleProductStatusCard } from "@/components/admin/GoogleProductStatusCard";
import { MultiCategorySelect } from "@/components/admin/MultiCategorySelect";
import { PrimaryCategorySelect } from "@/components/admin/product/PrimaryCategorySelect";
import { CategorySpecificFields } from "@/components/admin/product/CategorySpecificFields";
import { BrandSelect } from "@/components/admin/product/BrandSelect";
import { SeriesSelect } from "@/components/admin/product/SeriesSelect";
import { categoryFieldConfigs, getCategorySlugByName } from "@/config/categoryFields";
import { getBrandName, brandSeriesConfig } from "@/config/brandSeriesConfig";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingToGoogle, setSyncingToGoogle] = useState(false);

  const { status: googleStatus, loading: googleStatusLoading, refetch: refetchGoogleStatus } = useGoogleProductStatus(id);

  // Primary category for dynamic fields
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>("");
  const [primaryCategorySlug, setPrimaryCategorySlug] = useState<string | undefined>();
  const [categorySpecificValues, setCategorySpecificValues] = useState<Record<string, string>>({});

  // Brand and Series state
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedSeries, setSelectedSeries] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    series: "",
    power_range: "",
    price: "",
    shipping_cost: "0",
    stock_quantity: "",
    lifecycle_status: "active",
    condition: "new",
    short_description: "",
    description: "",
    category_id: "",
    is_active: true,
    featured: false,
    is_quote_only: false,
  });

  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [newDocuments, setNewDocuments] = useState<Array<{ 
    file: File | null; 
    name: string; 
    type: string; 
    displayOrder: number 
  }>>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Check if the selected category is VFD (to show legacy Series/Power Range fields)
  const isVFDCategory = primaryCategorySlug === 'vfd';

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (id && isAdmin) {
      fetchProduct();
      fetchCategories();
    }
  }, [id, isAdmin]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("product_categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    try {
      const { data: product, error } = await supabase
        .from("products")
        .select(`
          *, 
          product_images(*), 
          product_specifications(*), 
          product_documents(*),
          product_category_mapping(category_id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        name: product.name,
        sku: product.sku,
        series: product.series || "",
        power_range: product.power_range || "",
        price: product.price?.toString() || "",
        shipping_cost: product.shipping_cost?.toString() || "0",
        stock_quantity: product.stock_quantity.toString(),
        lifecycle_status: product.lifecycle_status || "active",
        condition: product.condition || "new",
        short_description: product.short_description || "",
        description: product.description || "",
        category_id: product.category_id || "",
        is_active: product.is_active,
        featured: product.featured,
        is_quote_only: product.is_quote_only || false,
      });

      // Set brand from product
      if (product.brand) {
        // Try to find matching brand slug
        const brandEntry = Object.entries(brandSeriesConfig).find(
          ([_, config]) => config.name.toLowerCase() === product.brand.toLowerCase()
        );
        if (brandEntry) {
          setSelectedBrand(brandEntry[0]);
        }
      }

      // Set series from product
      if (product.series) {
        setSelectedSeries(product.series);
      }

      setExistingImages(product.product_images || []);
      setExistingDocuments(product.product_documents || []);

      // Set selected category IDs from junction table
      const categoryIds = product.product_category_mapping?.map(
        (m: any) => m.category_id
      ) || [];
      setSelectedCategoryIds(categoryIds);

      // Determine primary category
      const primaryCatId = product.category_id || categoryIds[0];
      if (primaryCatId) {
        setPrimaryCategoryId(primaryCatId);
        
        // Fetch category to get slug
        const { data: categoryData } = await supabase
          .from("product_categories")
          .select("name, slug")
          .eq("id", primaryCatId)
          .single();
        
        if (categoryData) {
          const slug = categoryData.slug || getCategorySlugByName(categoryData.name);
          setPrimaryCategorySlug(slug);
          
          // If this category has specific fields, try to populate from existing specs
          if (slug && categoryFieldConfigs[slug]) {
            const config = categoryFieldConfigs[slug];
            const existingSpecs = product.product_specifications || [];
            const specValues: Record<string, string> = {};
            
            config.fields.forEach(field => {
              // Try to find matching spec by label
              const matchingSpec = existingSpecs.find(
                (spec: any) => spec.spec_key.toLowerCase() === field.label.toLowerCase()
              );
              if (matchingSpec) {
                // For select fields, try to match back to value
                if (field.type === 'select' && field.options) {
                  const matchingOption = field.options.find(
                    opt => opt.label.toLowerCase() === matchingSpec.spec_value.toLowerCase()
                  );
                  specValues[field.id] = matchingOption?.value || matchingSpec.spec_value;
                } else {
                  specValues[field.id] = matchingSpec.spec_value;
                }
              }
            });
            
            setCategorySpecificValues(specValues);
            
            // Filter out category-specific specs from manual specs
            const categoryFieldLabels = config.fields.map(f => f.label.toLowerCase());
            const manualSpecs = existingSpecs.filter(
              (spec: any) => !categoryFieldLabels.includes(spec.spec_key.toLowerCase())
            );
            
            setSpecifications(
              manualSpecs.length > 0
                ? manualSpecs.map((spec: any) => ({
                    key: spec.spec_key,
                    value: spec.spec_value,
                  }))
                : [{ key: "", value: "" }]
            );
          } else {
            // No category-specific fields, show all as manual specs
            setSpecifications(
              product.product_specifications?.map((spec: any) => ({
                key: spec.spec_key,
                value: spec.spec_value,
              })) || [{ key: "", value: "" }]
            );
          }
        }
      } else {
        setSpecifications(
          product.product_specifications?.map((spec: any) => ({
            key: spec.spec_key,
            value: spec.spec_value,
          })) || [{ key: "", value: "" }]
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryCategorySelect = (categoryId: string, slug: string | undefined) => {
    setPrimaryCategoryId(categoryId);
    setPrimaryCategorySlug(slug);
    
    // Also add to selected categories if not already there
    if (categoryId && !selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
    }
    
    // Reset category-specific values, brand and series when category changes
    setCategorySpecificValues({});
    setSelectedBrand("");
    setSelectedSeries("");
  };

  const handleBrandChange = (brandSlug: string) => {
    setSelectedBrand(brandSlug);
    // Reset series when brand changes
    setSelectedSeries("");
  };

  const handleSeriesChange = (series: string) => {
    setSelectedSeries(series);
    // Update form data series field
    setFormData(prev => ({ ...prev, series }));
  };

  const handleCategorySpecificChange = (fieldId: string, value: string) => {
    setCategorySpecificValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const addNewDocument = () => {
    setNewDocuments([...newDocuments, { file: null, name: "", type: "datasheet", displayOrder: existingDocuments.length + newDocuments.length }]);
  };

  const removeNewDocument = (index: number) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  const updateNewDocument = (index: number, field: string, value: any) => {
    const updated = [...newDocuments];
    updated[index] = { ...updated[index], [field]: value };
    setNewDocuments(updated);
  };

  const handleNewDocumentFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updated = [...newDocuments];
      updated[index].file = file;
      if (!updated[index].name) {
        updated[index].name = file.name.replace(/\.[^/.]+$/, "");
      }
      setNewDocuments(updated);
    }
  };

  const deleteExistingDocument = async (docId: string) => {
    const { error } = await supabase
      .from("product_documents")
      .delete()
      .eq("id", docId);
    
    if (!error) {
      setExistingDocuments(existingDocuments.filter(doc => doc.id !== docId));
      toast({
        title: "Success",
        description: "Document deleted",
      });
    }
  };

  const toggleDocumentActive = async (docId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("product_documents")
      .update({ is_active: !currentStatus })
      .eq("id", docId);
    
    if (!error) {
      setExistingDocuments(existingDocuments.map(doc => 
        doc.id === docId ? { ...doc, is_active: !currentStatus } : doc
      ));
      toast({
        title: "Success",
        description: `Document ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate category-specific required fields
      if (primaryCategorySlug && categoryFieldConfigs[primaryCategorySlug]) {
        const config = categoryFieldConfigs[primaryCategorySlug];
        const missingFields = config.fields
          .filter(f => f.required && !categorySpecificValues[f.id])
          .map(f => f.label);
        
        if (missingFields.length > 0) {
          throw new Error(`Please fill in required fields: ${missingFields.join(', ')}`);
        }
      }

      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({
          name: formData.name,
          sku: formData.sku,
          brand: selectedBrand ? getBrandName(selectedBrand) : null,
          series: selectedSeries || formData.series || null,
          power_range: isVFDCategory ? formData.power_range : (categorySpecificValues['power_range'] || formData.power_range || null),
          price: formData.is_quote_only ? null : parseFloat(formData.price),
          shipping_cost: parseFloat(formData.shipping_cost) || 0,
          stock_quantity: parseInt(formData.stock_quantity),
          lifecycle_status: formData.lifecycle_status,
          condition: formData.condition,
          short_description: formData.short_description,
          description: formData.description,
          category_id: primaryCategoryId || formData.category_id || null,
          is_active: formData.is_active,
          featured: formData.featured,
          is_quote_only: formData.is_quote_only,
        })
        .eq("id", id);

      if (productError) throw productError;

      // Upload new images
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${id}-${Date.now()}-${i}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

          await supabase.from("product_images").insert({
            product_id: id,
            image_url: publicUrl,
            is_primary: existingImages.length === 0 && i === 0,
            display_order: existingImages.length + i,
          });
        }
      }

      // Delete existing specifications and re-insert
      await supabase.from("product_specifications").delete().eq("product_id", id);

      // Prepare all specifications (category-specific + manual)
      const allSpecs: Array<{ key: string; value: string }> = [];
      
      // Add category-specific values as specifications
      if (primaryCategorySlug && categoryFieldConfigs[primaryCategorySlug]) {
        const config = categoryFieldConfigs[primaryCategorySlug];
        config.fields.forEach((field) => {
          const value = categorySpecificValues[field.id];
          if (value) {
            // Get display label for select fields
            let displayValue = value;
            if (field.type === 'select' && field.options) {
              const option = field.options.find(o => o.value === value);
              if (option) displayValue = option.label;
            }
            allSpecs.push({ key: field.label, value: displayValue });
          }
        });
      }
      
      // Add manual specifications
      const validManualSpecs = specifications.filter((spec) => spec.key && spec.value);
      allSpecs.push(...validManualSpecs);

      // Insert all specifications
      if (allSpecs.length > 0) {
        await supabase.from("product_specifications").insert(
          allSpecs.map((spec, index) => ({
            product_id: id,
            spec_key: spec.key,
            spec_value: spec.value,
            display_order: index,
          }))
        );
      }

      // Update category mappings
      await supabase.from("product_category_mapping").delete().eq("product_id", id);
      
      if (selectedCategoryIds.length > 0) {
        const mappings = selectedCategoryIds.map(categoryId => ({
          product_id: id,
          category_id: categoryId
        }));
        
        await supabase.from("product_category_mapping").insert(mappings);
      }

      // Upload new documents
      const validNewDocs = newDocuments.filter((doc) => doc.file && doc.name);
      if (validNewDocs.length > 0) {
        for (let i = 0; i < validNewDocs.length; i++) {
          const doc = validNewDocs[i];
          const file = doc.file!;
          const fileExt = file.name.split(".").pop();
          const fileName = `${id}-${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("product-documents")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("product-documents")
            .getPublicUrl(fileName);

          await supabase.from("product_documents").insert({
            product_id: id,
            document_name: doc.name,
            document_type: doc.type,
            file_url: publicUrl,
            file_size_kb: Math.round(file.size / 1024),
            display_order: doc.displayOrder,
            is_active: true,
          });
        }
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToGoogle = async () => {
    if (!id) return;
    
    setSyncingToGoogle(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-products-to-google', {
        body: { 
          mode: 'selected',
          productIds: [id]
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Started",
        description: "Product is being synced to Google Merchant Center",
      });

      // Refetch status after a delay
      setTimeout(() => {
        refetchGoogleStatus();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncingToGoogle(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <Button variant="outline" onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Category Selection */}
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle>Product Type</CardTitle>
              </CardHeader>
              <CardContent>
                <PrimaryCategorySelect
                  categories={categories}
                  selectedCategoryId={primaryCategoryId}
                  onSelect={handlePrimaryCategorySelect}
                />
              </CardContent>
            </Card>

            {/* Step 2: Brand Selection */}
            {primaryCategorySlug && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Step 2: Select Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <BrandSelect
                    value={selectedBrand}
                    onChange={handleBrandChange}
                    categorySlug={primaryCategorySlug}
                    required
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Series Selection */}
            {primaryCategorySlug && selectedBrand && (
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle>Step 3: Select Series</CardTitle>
                </CardHeader>
                <CardContent>
                  <SeriesSelect
                    value={selectedSeries}
                    onChange={handleSeriesChange}
                    brandSlug={selectedBrand}
                    categorySlug={primaryCategorySlug}
                  />
                </CardContent>
              </Card>
            )}

            {/* Category-Specific Fields */}
            {primaryCategorySlug && selectedBrand && (
              <CategorySpecificFields
                categorySlug={primaryCategorySlug}
                values={categorySpecificValues}
                onChange={handleCategorySpecificChange}
              />
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Power Range - Only show for VFD when brand is not selected yet */}
                {(isVFDCategory && !selectedBrand) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="series">Series *</Label>
                      <Input
                        id="series"
                        name="series"
                        value={formData.series}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., ATV320, ATV630"
                      />
                    </div>
                    <div>
                      <Label htmlFor="power_range">Power Range *</Label>
                      <Input
                        id="power_range"
                        name="power_range"
                        value={formData.power_range}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 0.75kW - 315kW"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Categories (multi-select) */}
                <div>
                  <Label>Additional Categories</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select additional categories this product belongs to
                  </p>
                  <MultiCategorySelect
                    categories={categories.filter(c => c.id !== primaryCategoryId)}
                    selectedCategoryIds={selectedCategoryIds.filter(id => id !== primaryCategoryId)}
                    onChange={(ids) => setSelectedCategoryIds([...ids, primaryCategoryId].filter(Boolean))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (INR) {!formData.is_quote_only && "*"}</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required={!formData.is_quote_only}
                      disabled={formData.is_quote_only}
                      placeholder={formData.is_quote_only ? "Price on request" : "Enter price in ₹"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping_cost">Shipping Cost (₹)</Label>
                    <Input
                      id="shipping_cost"
                      name="shipping_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.shipping_cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Per unit. Set to 0 for free shipping.</p>
                  </div>
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Lifecycle Status & Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lifecycle_status">Lifecycle Status *</Label>
                    <Select
                      value={formData.lifecycle_status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, lifecycle_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="discontinued">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                            Discontinued
                          </div>
                        </SelectItem>
                        <SelectItem value="obsolete">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            End-of-Life
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Indicates product availability status</p>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="refurbished">Refurbished / Tested</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">New or refurbished product</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_quote_only"
                      checked={formData.is_quote_only}
                      onCheckedChange={(checked) => handleSwitchChange("is_quote_only", checked)}
                    />
                    <Label htmlFor="is_quote_only">Quote Only</Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Quote-only products cannot be added to cart and require customer quotation. Price field is optional for quote-only products.
                </p>
              </CardContent>
            </Card>

            {/* Google Shopping Status */}
            {!googleStatusLoading && (
              <GoogleProductStatusCard
                status={googleStatus}
                onSync={handleSyncToGoogle}
                loading={syncingToGoogle}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm mb-2">Existing Images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages.map((img) => (
                        <img
                          key={img.id}
                          src={img.image_url}
                          alt="Product"
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="images">Add New Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageChange}
                  />
                  {newImages.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {newImages.length} new image(s) selected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Additional Specifications
                  <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Spec
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add any additional specifications not covered by the category-specific fields above
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Key"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, "key", e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, "value", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSpecification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Product Documents
                  <Button type="button" variant="outline" size="sm" onClick={addNewDocument}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Existing Documents</Label>
                    {existingDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{doc.document_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={doc.is_active}
                            onCheckedChange={() => toggleDocumentActive(doc.id, doc.is_active)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExistingDocument(doc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {newDocuments.length > 0 && (
                  <div className="space-y-4">
                    <Label>New Documents</Label>
                    {newDocuments.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Document {index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNewDocument(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>File (PDF, DOC, DOCX, XLS, XLSX, DWG, ZIP - Max 10MB)</Label>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip"
                            onChange={(e) => handleNewDocumentFileChange(index, e)}
                          />
                        </div>
                        <div>
                          <Label>Document Name</Label>
                          <Input
                            placeholder="e.g., Product Datasheet"
                            value={doc.name}
                            onChange={(e) => updateNewDocument(index, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Document Type</Label>
                          <Select
                            value={doc.type}
                            onValueChange={(value) => updateNewDocument(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="datasheet">Datasheet</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="catalog">Catalog</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                              <SelectItem value="drawing">Drawing</SelectItem>
                              <SelectItem value="software">Software</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {existingDocuments.length === 0 && newDocuments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents added. Click "Add Document" to upload technical documents.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Product
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
