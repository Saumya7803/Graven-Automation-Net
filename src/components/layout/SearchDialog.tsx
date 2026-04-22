import { useState, useEffect } from "react";
import { Search, X, Clock, TrendingUp, Trash2, Tag, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearch,
  clearAllRecentSearches,
} from "@/utils/searchHistory";

interface SearchSuggestion {
  id: string;
  name: string;
  series: string;
  brand?: string;
  power_range?: string;
  short_description?: string;
  category_name?: string;
  is_active?: boolean;
  match_score?: number;
}

interface ParsedQuery {
  brand?: string | null;
  category?: string | null;
  power?: string | null;
  normalizedTerms?: string[];
  expandedTerms?: string[];
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Load recent searches when dialog opens
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setSuggestions([]);
      setParsedQuery(null);
    }
  }, [open]);

  // Fetch popular searches on mount
  useEffect(() => {
    const fetchPopularSearches = async () => {
      const { data } = await supabase
        .from("search_analytics")
        .select("search_query")
        .order("search_count", { ascending: false })
        .limit(5);

      if (data) {
        setPopularSearches(data.map((item) => item.search_query));
      }
    };

    fetchPopularSearches();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setParsedQuery(null);
        return;
      }

      setIsSearching(true);

      try {
        // Use intelligent search edge function
        const { data, error } = await supabase.functions.invoke("intelligent-search", {
          body: { query, limit: 8, includeDiscontinued: true },
        });

        if (error) {
          console.error("Search error:", error);
          // Fallback to basic search
          const { data: fallbackData } = await supabase
            .from("products")
            .select("id, name, series, brand, power_range, is_active, product_categories(name)")
            .ilike("name", `%${query}%`)
            .limit(8);
          
          if (fallbackData) {
            setSuggestions(fallbackData.map((p: any) => ({
              ...p,
              category_name: p.product_categories?.name || null,
            })));
          }
          return;
        }

        if (data?.products) {
          setSuggestions(data.products);
          setParsedQuery(data.parsedQuery);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      saveRecentSearch(finalQuery);
      setRecentSearches(getRecentSearches());

      const resultsCount = suggestions.length;

      try {
        await supabase.functions.invoke("track-search", {
          body: { 
            searchQuery: finalQuery,
            resultsCount
          },
        });
      } catch (error) {
        console.error("Error tracking search:", error);
      }

      navigate(`/shop?search=${encodeURIComponent(finalQuery)}`);
      onOpenChange(false);
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    handleSearch(searchQuery);
  };

  const handleClearRecentSearch = (searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllRecentSearches();
    setRecentSearches([]);
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search Products</DialogTitle>
        
        {/* Search Input */}
        <div className="relative border-b border-border">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products, models, SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-14 pl-12 pr-12 text-lg border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-background"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length === 0 ? (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="border-b border-border">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      onClick={handleClearAllRecentSearches}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{search}</span>
                      </div>
                      <button
                        onClick={(e) => handleClearRecentSearch(search, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Popular Searches</span>
                  </div>
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-foreground capitalize">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {recentSearches.length === 0 && popularSearches.length === 0 && (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  Start typing to search products...
                </div>
              )}
            </>
          ) : (
            /* Product Suggestions */
            <div>
              {/* Parsed Query Interpretation */}
              {parsedQuery && (parsedQuery.brand || parsedQuery.category || parsedQuery.power) && (
                <div className="px-4 py-2 bg-muted/50 border-b border-border flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">Searching for:</span>
                  {parsedQuery.brand && (
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {parsedQuery.brand}
                    </Badge>
                  )}
                  {parsedQuery.category && (
                    <Badge variant="outline" className="text-xs">
                      {parsedQuery.category}
                    </Badge>
                  )}
                  {parsedQuery.power && (
                    <Badge variant="outline" className="text-xs">
                      {parsedQuery.power}
                    </Badge>
                  )}
                </div>
              )}

              {suggestions.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
                    Products
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick(item.id)}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex flex-col gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.is_active === false && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Discontinued
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {item.brand && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {item.brand}
                          </Badge>
                        )}
                        <span>{item.series}</span>
                        {item.power_range && <span>• {item.power_range}</span>}
                        {item.category_name && <span>• {item.category_name}</span>}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => handleSearch()}
                    className="w-full px-4 py-3 text-center text-primary hover:bg-accent transition-colors font-medium"
                  >
                    View all results for "{query}"
                  </button>
                </>
              ) : (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  {isSearching ? "Searching..." : `No products found for "${query}"`}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
