import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface KeywordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: any | null;
  onSave: (keyword: any) => void;
}

const KeywordDialog = ({ open, onOpenChange, keyword, onSave }: KeywordDialogProps) => {
  const [formData, setFormData] = useState({
    keyword: "",
    keyword_type: "location",
    search_volume: "",
    keyword_difficulty: "",
    search_intent: "commercial",
    priority: "3",
    country: "India",
    state: "",
    city: "",
    product_series: "",
    power_rating: "",
    target_page_type: "location_page",
    target_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (keyword) {
      setFormData({
        keyword: keyword.keyword || "",
        keyword_type: keyword.keyword_type || "location",
        search_volume: keyword.search_volume?.toString() || "",
        keyword_difficulty: keyword.keyword_difficulty?.toString() || "",
        search_intent: keyword.search_intent || "commercial",
        priority: keyword.priority?.toString() || "3",
        country: keyword.country || "India",
        state: keyword.state || "",
        city: keyword.city || "",
        product_series: keyword.product_series || "",
        power_rating: keyword.power_rating || "",
        target_page_type: keyword.target_page_type || "",
        target_url: keyword.target_url || "",
        is_active: keyword.is_active ?? true,
      });
    } else {
      setFormData({
        keyword: "",
        keyword_type: "location",
        search_volume: "",
        keyword_difficulty: "",
        search_intent: "commercial",
        priority: "3",
        country: "India",
        state: "",
        city: "",
        product_series: "",
        power_rating: "",
        target_page_type: "location_page",
        target_url: "",
        is_active: true,
      });
    }
  }, [keyword, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      search_volume: formData.search_volume ? parseInt(formData.search_volume) : null,
      keyword_difficulty: formData.keyword_difficulty ? parseInt(formData.keyword_difficulty) : null,
      priority: parseInt(formData.priority),
    };

    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{keyword ? "Edit Keyword" : "Add New Keyword"}</DialogTitle>
          <DialogDescription>
            {keyword ? "Update keyword details" : "Add a new target keyword for SEO optimization"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="keyword">Keyword *</Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                placeholder="e.g., VFD in Delhi"
                required
              />
            </div>

            <div>
              <Label htmlFor="keyword_type">Type *</Label>
              <Select
                value={formData.keyword_type}
                onValueChange={(value) => setFormData({ ...formData, keyword_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="product_model">Product Model</SelectItem>
                  <SelectItem value="power_rating">Power Rating</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="near_me">Near Me</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search_intent">Search Intent *</Label>
              <Select
                value={formData.search_intent}
                onValueChange={(value) => setFormData({ ...formData, search_intent: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="navigational">Navigational</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search_volume">Search Volume</Label>
              <Input
                id="search_volume"
                type="number"
                value={formData.search_volume}
                onChange={(e) => setFormData({ ...formData, search_volume: e.target.value })}
                placeholder="e.g., 1200"
              />
            </div>

            <div>
              <Label htmlFor="keyword_difficulty">Keyword Difficulty (1-100)</Label>
              <Input
                id="keyword_difficulty"
                type="number"
                min="1"
                max="100"
                value={formData.keyword_difficulty}
                onChange={(e) => setFormData({ ...formData, keyword_difficulty: e.target.value })}
                placeholder="e.g., 45"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Delhi, Maharashtra"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Mumbai, Delhi"
              />
            </div>

            <div>
              <Label htmlFor="product_series">Product Series</Label>
              <Input
                id="product_series"
                value={formData.product_series}
                onChange={(e) => setFormData({ ...formData, product_series: e.target.value })}
                placeholder="e.g., ATV310, ATV320"
              />
            </div>

            <div>
              <Label htmlFor="power_rating">Power Rating</Label>
              <Input
                id="power_rating"
                value={formData.power_rating}
                onChange={(e) => setFormData({ ...formData, power_rating: e.target.value })}
                placeholder="e.g., 5HP, 7.5kW"
              />
            </div>

            <div>
              <Label htmlFor="target_page_type">Target Page Type</Label>
              <Select
                value={formData.target_page_type}
                onValueChange={(value) => setFormData({ ...formData, target_page_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select page type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location_page">Location Page</SelectItem>
                  <SelectItem value="pricing_page">Pricing Page</SelectItem>
                  <SelectItem value="product_page">Product Page</SelectItem>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="international_page">International Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="target_url">Target URL</Label>
              <Input
                id="target_url"
                value={formData.target_url}
                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                placeholder="/location/delhi or /pricing/atv310"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {keyword ? "Update" : "Create"} Keyword
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KeywordDialog;
