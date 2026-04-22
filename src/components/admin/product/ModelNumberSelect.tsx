import { useState, useEffect } from "react";
import { useModelMaster, ModelMaster } from "@/hooks/useModelMaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelNumberSelectProps {
  categorySlug: string;
  brandSlug: string;
  seriesSlug: string;
  selectedModelId: string | null;
  onModelSelect: (model: ModelMaster | null) => void;
  onCustomModel: () => void;
}

export function ModelNumberSelect({
  categorySlug,
  brandSlug,
  seriesSlug,
  selectedModelId,
  onModelSelect,
  onCustomModel,
}: ModelNumberSelectProps) {
  const { getModelsBySelection } = useModelMaster();
  const [models, setModels] = useState<ModelMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      if (!categorySlug || !brandSlug || !seriesSlug) {
        setModels([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const results = await getModelsBySelection(categorySlug, brandSlug, seriesSlug);
      setModels(results);
      setLoading(false);
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, brandSlug, seriesSlug]);

  const filteredModels = search
    ? models.filter(
        (m) =>
          m.model_number.toLowerCase().includes(search.toLowerCase()) ||
          m.name.toLowerCase().includes(search.toLowerCase())
      )
    : models;

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

  const handleModelSelect = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    onModelSelect(model || null);
  };

  if (!categorySlug || !brandSlug || !seriesSlug) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Step 4: Select Model Number</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Found {models.length} models for this selection
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">
                No models found in the catalog for this selection
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                You can{" "}
                <a href="/admin/model-master" className="text-primary underline hover:no-underline">
                  add models to the catalog
                </a>{" "}
                or enter a custom model below
              </p>
              <Button variant="outline" onClick={onCustomModel}>
                Enter Custom Model Number
              </Button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Model List */}
              <RadioGroup
                value={selectedModelId || ""}
                onValueChange={handleModelSelect}
                className="space-y-3"
              >
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className={cn(
                      "relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                      selectedModelId === model.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                    <Label
                      htmlFor={model.id}
                      className="flex-1 cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-base">
                          {model.model_number}
                        </span>
                        {getStatusBadge(model.lifecycle_status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{model.name}</p>
                      {model.short_description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {model.short_description}
                        </p>
                      )}
                      {Object.keys(model.specifications || {}).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(model.specifications)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          {Object.keys(model.specifications).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{Object.keys(model.specifications).length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {filteredModels.length === 0 && search && (
                <p className="text-center text-muted-foreground py-4">
                  No models match your search
                </p>
              )}

              {/* Custom Model Option */}
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={onCustomModel} className="w-full">
                  Or enter custom model number
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
