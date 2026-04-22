import { useState, useEffect } from "react";
import { Search, X, Clock, TrendingUp, Trash2, Tag, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  category_name?: string;
  is_active?: boolean;
}

interface ParsedQuery {
  brand?: string | null;
  category?: string | null;
  power?: string | null;
}

export const HeaderSearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const fetchPopularSearches = async () => {
      const { data } = await supabase
        .from("search_analytics")
        .select("search_query")
        .order("search_count", { ascending: false })
        .limit(5);
      if (data) setPopularSearches(data.map((item) => item.search_query));
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
        const { data, error } = await supabase.functions.invoke("intelligent-search", {
          body: { query, limit: 8, includeDiscontinued: true },
        });
        if (error) {
          const { data: fallbackData } = await supabase
            .from("products")
            .select("id, name, series, brand, power_range, is_active")
            .ilike("name", `%${query}%`)
            .limit(8);
          if (fallbackData) setSuggestions(fallbackData.map((p: any) => ({ ...p, category_name: null })));
          return;
        }
        if (data?.products) {
          setSuggestions(data.products);
          setParsedQuery(data.parsedQuery);
        }
      } catch (err) {
        console.error("Search error:", err);
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
      try {
        await supabase.functions.invoke("track-search", { body: { searchQuery: finalQuery, resultsCount: suggestions.length } });
      } catch (error) { console.error("Error tracking search:", error); }
      navigate(`/shop?search=${encodeURIComponent(finalQuery)}`);
      setQuery("");
      setShowSuggestions(false);
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => handleSearch(searchQuery);
  const handleClearRecentSearch = (searchQuery: string, e: React.MouseEvent) => { e.stopPropagation(); clearRecentSearch(searchQuery); setRecentSearches(getRecentSearches()); };
  const handleClearAllRecentSearches = (e: React.MouseEvent) => { e.stopPropagation(); clearAllRecentSearches(); setRecentSearches([]); };
  const handleSuggestionClick = (productId: string) => { navigate(`/product/${productId}`); setQuery(""); setShowSuggestions(false); };

  return (
    <div className="relative w-full">
      <div className="relative group">
        <Input
          type="text"
          placeholder="Search products, models, SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="h-11 pl-11 pr-10 rounded-lg border-2 transition-all duration-300 focus:shadow-xl focus:shadow-primary/20 focus:ring-2 focus:ring-primary/30 bg-background/80 backdrop-blur-sm"
          style={{ borderColor: 'transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(160 84% 39% / 0.3))', backgroundOrigin: 'padding-box, border-box', backgroundClip: 'padding-box, border-box' }}
        />
        <button onClick={() => handleSearch()} className="absolute left-3.5 top-1/2 -translate-y-1/2" type="button" aria-label="Search">
          <Search className="h-5 w-5 text-primary" />
        </button>
        {query && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setQuery("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border-2 border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {query.length === 0 ? (
            <>
              {recentSearches.length > 0 && (
                <div className="border-b border-border/50">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Clock className="h-4 w-4" /><span>Recent Searches</span></div>
                    <button onClick={handleClearAllRecentSearches} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Trash2 className="h-3 w-3" />Clear All</button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button key={index} onClick={() => handleRecentSearchClick(search)} className="w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between group">
                      <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><span>{search}</span></div>
                      <button onClick={(e) => handleClearRecentSearch(search, e)} className="opacity-0 group-hover:opacity-100"><X className="h-4 w-4 text-muted-foreground" /></button>
                    </button>
                  ))}
                </div>
              )}
              {popularSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 text-sm font-medium text-muted-foreground"><TrendingUp className="h-4 w-4" /><span>Popular Searches</span></div>
                  {popularSearches.map((search, index) => (
                    <button key={index} onClick={() => handleRecentSearchClick(search)} className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-primary" /><span className="capitalize">{search}</span>
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length === 0 && popularSearches.length === 0 && <div className="px-4 py-8 text-center text-muted-foreground text-sm">Start typing to search products...</div>}
            </>
          ) : (
            <>
              {parsedQuery && (parsedQuery.brand || parsedQuery.category || parsedQuery.power) && (
                <div className="px-4 py-2 bg-muted/50 border-b flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">Searching for:</span>
                  {parsedQuery.brand && <Badge variant="secondary" className="text-xs"><Tag className="h-3 w-3 mr-1" />{parsedQuery.brand}</Badge>}
                  {parsedQuery.category && <Badge variant="outline" className="text-xs">{parsedQuery.category}</Badge>}
                  {parsedQuery.power && <Badge variant="outline" className="text-xs">{parsedQuery.power}</Badge>}
                </div>
              )}
              {suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <button key={item.id} onClick={() => handleSuggestionClick(item.id)} className="w-full px-4 py-3 text-left hover:bg-accent flex flex-col gap-1 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.is_active === false && <Badge variant="destructive" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Discontinued</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {item.brand && <Badge variant="secondary" className="text-xs font-normal">{item.brand}</Badge>}
                      <span>{item.series}</span>
                      {item.power_range && <span>• {item.power_range}</span>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">{isSearching ? "Searching..." : `No products found for "${query}"`}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
