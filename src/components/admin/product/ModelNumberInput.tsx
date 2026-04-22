import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Hash,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ModelMaster } from "@/hooks/useModelMaster";
import { QuickAddModelDialog } from "./QuickAddModelDialog";

interface ModelNumberInputProps {
  categorySlug: string;
  brandSlug: string;
  seriesSlug: string;
  value: string;
  onChange: (modelNumber: string) => void;
  onModelMatch: (model: ModelMaster | null) => void;
}

export function ModelNumberInput({
  categorySlug,
  brandSlug,
  seriesSlug,
  value,
  onChange,
  onModelMatch,
}: ModelNumberInputProps) {
  const [searchResults, setSearchResults] = useState<ModelMaster[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelMaster | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Debounced search
  const searchModels = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search with category/brand/series match first
      const { data: exactMatches, error: exactError } = await supabase
        .from("model_master")
        .select("*")
        .eq("category_slug", categorySlug)
        .eq("brand_slug", brandSlug)
        .eq("series_slug", seriesSlug)
        .eq("is_active", true)
        .ilike("model_number", `%${searchTerm}%`)
        .order("model_number")
        .limit(5);

      if (exactError) throw exactError;

      // If no exact matches, search broader (same category/brand, any series)
      let results = (exactMatches || []) as ModelMaster[];
      
      if (results.length === 0) {
        const { data: broaderMatches, error: broaderError } = await supabase
          .from("model_master")
          .select("*")
          .eq("category_slug", categorySlug)
          .eq("brand_slug", brandSlug)
          .eq("is_active", true)
          .ilike("model_number", `%${searchTerm}%`)
          .order("model_number")
          .limit(5);

        if (!broaderError && broaderMatches) {
          results = broaderMatches.map((m) => ({
            ...m,
            specifications: (m.specifications as Record<string, string>) || {},
            key_features: (m.key_features as string[]) || [],
            replacement_models: m.replacement_models || [],
            lifecycle_status: m.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
          }));
        }
      } else {
        results = results.map((m) => ({
          ...m,
          specifications: (m.specifications as Record<string, string>) || {},
          key_features: (m.key_features as string[]) || [],
          replacement_models: m.replacement_models || [],
          lifecycle_status: m.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
        }));
      }

      setSearchResults(results);
      setHasSearched(true);
    } catch (err) {
      console.error("Error searching models:", err);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, [categorySlug, brandSlug, seriesSlug]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && !selectedModel) {
        searchModels(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, searchModels, selectedModel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedModel(null);
    onModelMatch(null);
  };

  const handleSelectModel = (model: ModelMaster) => {
    setSelectedModel(model);
    onChange(model.model_number);
    onModelMatch(model);
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleContinueManually = () => {
    setSearchResults([]);
    setHasSearched(false);
    onModelMatch(null);
  };

  const handleModelAdded = (model: ModelMaster) => {
    setShowQuickAdd(false);
    handleSelectModel(model);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Discontinued":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Discontinued
          </Badge>
        );
      case "Obsolete":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Obsolete
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Step 4: Enter Model Number</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Type to search the catalog or enter a new model number
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter model number (e.g., ATV320U15M2)"
              value={value}
              onChange={handleInputChange}
              className={cn(
                "pl-10 font-mono text-base",
                selectedModel && "border-green-500 bg-green-50 dark:bg-green-950"
              )}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Selected Model Display */}
          {selectedModel && (
            <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      Model Found in Catalog
                    </span>
                  </div>
                  <p className="font-mono font-semibold">{selectedModel.model_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedModel.name}</p>
                </div>
                {getStatusBadge(selectedModel.lifecycle_status)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSelectedModel(null);
                  onModelMatch(null);
                }}
              >
                Change Model
              </Button>
            </div>
          )}

          {/* Search Results */}
          {!selectedModel && searchResults.length > 0 && (
            <div className="rounded-lg border bg-card p-2 space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">
                {searchResults.length} matching model{searchResults.length > 1 ? "s" : ""} found
              </p>
              {searchResults.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{model.model_number}</span>
                      {getStatusBadge(model.lifecycle_status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{model.name}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Use <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* No Match State */}
          {!selectedModel && hasSearched && searchResults.length === 0 && value.length >= 2 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">
                    No matching model found in catalog
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can continue with "{value}" as a new model, or add it to the catalog for future use.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleContinueManually}
                    >
                      Continue with "{value}"
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuickAdd(true)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add to Catalog
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Dialog */}
      <QuickAddModelDialog
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        categorySlug={categorySlug}
        brandSlug={brandSlug}
        seriesSlug={seriesSlug}
        initialModelNumber={value}
        onModelAdded={handleModelAdded}
      />
    </>
  );
}
