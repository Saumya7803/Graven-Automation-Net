import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Loader2, Plus } from "lucide-react";
import { useModelMaster, ModelMaster } from "@/hooks/useModelMaster";

interface QuickAddModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorySlug: string;
  brandSlug: string;
  seriesSlug: string;
  initialModelNumber: string;
  onModelAdded: (model: ModelMaster) => void;
}

export function QuickAddModelDialog({
  open,
  onOpenChange,
  categorySlug,
  brandSlug,
  seriesSlug,
  initialModelNumber,
  onModelAdded,
}: QuickAddModelDialogProps) {
  const { createModel } = useModelMaster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    model_number: initialModelNumber,
    name: "",
    short_description: "",
    lifecycle_status: "Active" as "Active" | "Discontinued" | "Obsolete",
  });

  // Update model number when initial value changes
  useState(() => {
    setFormData(prev => ({ ...prev, model_number: initialModelNumber }));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.model_number || !formData.name) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newModel = await createModel({
        model_number: formData.model_number,
        name: formData.name,
        short_description: formData.short_description || undefined,
        lifecycle_status: formData.lifecycle_status,
        category_slug: categorySlug,
        brand_slug: brandSlug,
        series_slug: seriesSlug,
        is_active: true,
      });

      if (newModel) {
        onModelAdded(newModel);
        // Reset form
        setFormData({
          model_number: "",
          name: "",
          short_description: "",
          lifecycle_status: "Active",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add to Model Catalog
          </DialogTitle>
          <DialogDescription>
            Add this model to the catalog for future use. This will also auto-fill
            the product details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="model_number">Model Number *</Label>
              <Input
                id="model_number"
                value={formData.model_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, model_number: e.target.value }))
                }
                placeholder="e.g., ATV320U15M2"
                className="font-mono"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Altivar Machine 320 1.5kW Drive"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lifecycle_status">Lifecycle Status</Label>
              <Select
                value={formData.lifecycle_status}
                onValueChange={(value: "Active" | "Discontinued" | "Obsolete") =>
                  setFormData((prev) => ({ ...prev, lifecycle_status: value }))
                }
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

            <div className="grid gap-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    short_description: e.target.value,
                  }))
                }
                placeholder="Brief description of the product..."
                rows={2}
              />
            </div>

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Category:</strong> {categorySlug}
                <br />
                <strong>Brand:</strong> {brandSlug}
                <br />
                <strong>Series:</strong> {seriesSlug}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add & Use Model
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
