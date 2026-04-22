import { useState, useEffect } from "react";
import { useModelMaster, ModelMaster, ModelMasterInput } from "@/hooks/useModelMaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2 } from "lucide-react";
import { getBrandsForCategory, getSeriesForBrandCategory } from "@/config/brandSeriesConfig";

const CATEGORIES = [
  { value: "vfd", label: "VFD" },
  { value: "plc", label: "PLC" },
  { value: "hmi", label: "HMI" },
  { value: "servo", label: "Servo" },
  { value: "motor", label: "Motor" },
  { value: "relay", label: "Relay" },
  { value: "power-supply", label: "Power Supply" },
  { value: "sensor", label: "Sensor" },
  { value: "contactor", label: "Contactor" },
  { value: "circuit-breaker", label: "Circuit Breaker" },
];

interface ModelMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingModel: ModelMaster | null;
}

export function ModelMasterDialog({
  open,
  onOpenChange,
  editingModel,
}: ModelMasterDialogProps) {
  const { createModel, updateModel, fetchModels } = useModelMaster();
  const [saving, setSaving] = useState(false);

  // Form state
  const [modelNumber, setModelNumber] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [seriesSlug, setSeriesSlug] = useState("");
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState<"Active" | "Discontinued" | "Obsolete">("Active");
  const [powerRange, setPowerRange] = useState("");
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  // Get available brands and series based on selections
  const availableBrands = categorySlug ? getBrandsForCategory(categorySlug) : [];
  const availableSeries =
    categorySlug && brandSlug ? getSeriesForBrandCategory(brandSlug, categorySlug) : [];

  // Reset form when dialog opens/closes or editing model changes
  useEffect(() => {
    if (open && editingModel) {
      setModelNumber(editingModel.model_number);
      setCategorySlug(editingModel.category_slug);
      setBrandSlug(editingModel.brand_slug);
      setSeriesSlug(editingModel.series_slug);
      setName(editingModel.name);
      setShortDescription(editingModel.short_description || "");
      setLifecycleStatus(editingModel.lifecycle_status);
      setPowerRange(editingModel.power_range || "");
      setSpecifications(
        Object.entries(editingModel.specifications || {}).map(([key, value]) => ({
          key,
          value,
        }))
      );
      setKeyFeatures(editingModel.key_features || []);
    } else if (open && !editingModel) {
      // Reset for new model
      setModelNumber("");
      setCategorySlug("");
      setBrandSlug("");
      setSeriesSlug("");
      setName("");
      setShortDescription("");
      setLifecycleStatus("Active");
      setPowerRange("");
      setSpecifications([]);
      setKeyFeatures([]);
    }
  }, [open, editingModel]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (!editingModel) {
      setBrandSlug("");
      setSeriesSlug("");
    }
  }, [categorySlug, editingModel]);

  useEffect(() => {
    if (!editingModel) {
      setSeriesSlug("");
    }
  }, [brandSlug, editingModel]);

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setKeyFeatures([...keyFeatures, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!modelNumber || !categorySlug || !brandSlug || !seriesSlug || !name) {
      return;
    }

    setSaving(true);

    const specsObject = specifications.reduce((acc, spec) => {
      if (spec.key.trim()) {
        acc[spec.key.trim()] = spec.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const input: ModelMasterInput = {
      model_number: modelNumber,
      category_slug: categorySlug,
      brand_slug: brandSlug,
      series_slug: seriesSlug,
      name,
      short_description: shortDescription || undefined,
      lifecycle_status: lifecycleStatus,
      power_range: powerRange || undefined,
      specifications: specsObject,
      key_features: keyFeatures,
    };

    let success = false;
    if (editingModel) {
      const result = await updateModel(editingModel.id, input);
      success = result !== null;
    } else {
      const result = await createModel(input);
      success = result !== null;
    }

    setSaving(false);

    if (success) {
      onOpenChange(false);
      fetchModels();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingModel ? "Edit Model" : "Add New Model"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Category, Brand, Series Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={categorySlug} onValueChange={setCategorySlug}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand *</Label>
                <Select
                  value={brandSlug}
                  onValueChange={setBrandSlug}
                  disabled={!categorySlug}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand.value} value={brand.value}>
                        {brand.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Series *</Label>
                <Select
                  value={seriesSlug}
                  onValueChange={setSeriesSlug}
                  disabled={!brandSlug}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select series" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeries.map((series) => (
                      <SelectItem key={series.value} value={series.value}>
                        {series.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Model Number and Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Model Number *</Label>
                <Input
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="e.g., 2711P-T10C22D9P"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Lifecycle Status</Label>
                <Select
                  value={lifecycleStatus}
                  onValueChange={(v) => setLifecycleStatus(v as "Active" | "Discontinued" | "Obsolete")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                    <SelectItem value="Obsolete">Obsolete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., PanelView 800 10.4 inch Touch Terminal"
              />
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief description of the product..."
                rows={3}
              />
            </div>

            {(categorySlug === "vfd" || categorySlug === "motor" || categorySlug === "servo") && (
              <div className="space-y-2">
                <Label>Power Range</Label>
                <Input
                  value={powerRange}
                  onChange={(e) => setPowerRange(e.target.value)}
                  placeholder="e.g., 0.75kW - 315kW"
                />
              </div>
            )}

            <Separator />

            {/* Specifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Specifications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSpecification}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Spec
                </Button>
              </div>

              {specifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specifications added. Click "Add Spec" to add key-value pairs.
                </p>
              ) : (
                <div className="space-y-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecificationChange(index, "key", e.target.value)
                        }
                        placeholder="Key (e.g., Display Size)"
                        className="flex-1"
                      />
                      <Input
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecificationChange(index, "value", e.target.value)
                        }
                        placeholder="Value (e.g., 10.4 inches)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpecification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Key Features */}
            <div className="space-y-4">
              <Label>Key Features</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {keyFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keyFeatures.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !modelNumber || !categorySlug || !brandSlug || !seriesSlug || !name}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingModel ? "Update Model" : "Create Model"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
