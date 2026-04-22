import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  customer_name: string;
  customer_title: string | null;
  company_name: string;
  company_logo_url: string | null;
  testimonial_text: string;
  rating: number | null;
  project_type: string | null;
  location: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  display_order: number | null;
}

interface TestimonialDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  testimonial?: Testimonial | null;
}

export function TestimonialDialog({ open, onClose, testimonial }: TestimonialDialogProps) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerTitle, setCustomerTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [rating, setRating] = useState("5");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setCustomerName(testimonial.customer_name);
      setCustomerTitle(testimonial.customer_title || "");
      setCompanyName(testimonial.company_name);
      setCompanyLogoUrl(testimonial.company_logo_url || "");
      setTestimonialText(testimonial.testimonial_text);
      setRating(String(testimonial.rating || 5));
      setProjectType(testimonial.project_type || "");
      setLocation(testimonial.location || "");
      setDisplayOrder(String(testimonial.display_order || 0));
      setIsFeatured(testimonial.is_featured || false);
      setIsActive(testimonial.is_active !== false);
    } else {
      setCustomerName("");
      setCustomerTitle("");
      setCompanyName("");
      setCompanyLogoUrl("");
      setTestimonialText("");
      setRating("5");
      setProjectType("");
      setLocation("");
      setDisplayOrder("0");
      setIsFeatured(false);
      setIsActive(true);
    }
  }, [testimonial, open]);

  const validateForm = () => {
    if (!customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return false;
    }

    if (customerName.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Customer name must be at least 2 characters",
        variant: "destructive",
      });
      return false;
    }

    if (!companyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return false;
    }

    if (companyName.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Company name must be at least 2 characters",
        variant: "destructive",
      });
      return false;
    }

    if (!testimonialText.trim()) {
      toast({
        title: "Validation Error",
        description: "Testimonial text is required",
        variant: "destructive",
      });
      return false;
    }

    if (testimonialText.trim().length < 10) {
      toast({
        title: "Validation Error",
        description: "Testimonial text must be at least 10 characters",
        variant: "destructive",
      });
      return false;
    }

    if (testimonialText.trim().length > 500) {
      toast({
        title: "Validation Error",
        description: "Testimonial text must be less than 500 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = {
        customer_name: customerName.trim(),
        customer_title: customerTitle.trim() || null,
        company_name: companyName.trim(),
        company_logo_url: companyLogoUrl.trim() || null,
        testimonial_text: testimonialText.trim(),
        rating: parseInt(rating),
        project_type: projectType.trim() || null,
        location: location.trim() || null,
        display_order: parseInt(displayOrder),
        is_featured: isFeatured,
        is_active: isActive,
      };

      if (testimonial) {
        // Update existing testimonial
        const { error } = await supabase
          .from("testimonials")
          .update(data)
          .eq("id", testimonial.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        });
      } else {
        // Create new testimonial
        const { error } = await supabase
          .from("testimonials")
          .insert(data);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Testimonial created successfully",
        });
      }

      onClose(true);
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

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {testimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {testimonial
                ? "Update the testimonial details below"
                : "Create a new customer testimonial"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Rajesh Kumar"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customer-title">Customer Title</Label>
                <Input
                  id="customer-title"
                  value={customerTitle}
                  onChange={(e) => setCustomerTitle(e.target.value)}
                  placeholder="e.g., Plant Manager"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., ABC Manufacturing Ltd."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-logo">Company Logo URL</Label>
              <Input
                id="company-logo"
                type="url"
                value={companyLogoUrl}
                onChange={(e) => setCompanyLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="testimonial-text">
                Testimonial Text <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="testimonial-text"
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                placeholder="Share your experience with our products and services..."
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-sm text-muted-foreground text-right">
                {testimonialText.length}/500 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rating">
                  Rating <span className="text-destructive">*</span>
                </Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                    <SelectItem value="1">⭐ (1 star)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display-order">Display Order</Label>
                <Input
                  id="display-order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project-type">Project Type</Label>
                <Input
                  id="project-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g., Manufacturing Automation"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mumbai, India"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is-featured">Featured on Homepage</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this testimonial on the homepage
                  </p>
                </div>
                <Switch
                  id="is-featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is-active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this testimonial visible
                  </p>
                </div>
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : testimonial ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
