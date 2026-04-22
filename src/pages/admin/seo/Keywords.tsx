import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Download, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import KeywordListTable from "@/components/admin/seo/KeywordListTable";
import KeywordDialog from "@/components/admin/seo/KeywordDialog";
import { Badge } from "@/components/ui/badge";

const Keywords = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [keywords, setKeywords] = useState([]);
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    location: 0,
    product: 0,
    commercial: 0,
    power: 0
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchKeywords();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterKeywords();
  }, [searchQuery, keywords]);

  const fetchKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_keywords")
        .select("*")
        .order("priority", { ascending: true })
        .order("search_volume", { ascending: false });

      if (error) throw error;

      setKeywords(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      toast({
        title: "Error",
        description: "Failed to load keywords",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      active: data.filter(k => k.is_active).length,
      location: data.filter(k => k.keyword_type === 'location').length,
      product: data.filter(k => k.keyword_type === 'product_model').length,
      commercial: data.filter(k => k.keyword_type === 'commercial').length,
      power: data.filter(k => k.keyword_type === 'power_rating').length,
    };
    setStats(stats);
  };

  const filterKeywords = () => {
    if (!searchQuery.trim()) {
      setFilteredKeywords(keywords);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = keywords.filter(k =>
      k.keyword.toLowerCase().includes(query) ||
      k.keyword_type?.toLowerCase().includes(query) ||
      k.city?.toLowerCase().includes(query) ||
      k.state?.toLowerCase().includes(query) ||
      k.product_series?.toLowerCase().includes(query)
    );
    setFilteredKeywords(filtered);
  };

  const handleAddKeyword = () => {
    setSelectedKeyword(null);
    setIsDialogOpen(true);
  };

  const handleEditKeyword = (keyword) => {
    setSelectedKeyword(keyword);
    setIsDialogOpen(true);
  };

  const handleDeleteKeyword = async (id) => {
    try {
      const { error } = await supabase
        .from("seo_keywords")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Keyword deleted successfully",
      });
      fetchKeywords();
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast({
        title: "Error",
        description: "Failed to delete keyword",
        variant: "destructive",
      });
    }
  };

  const handleSaveKeyword = async (keywordData) => {
    try {
      if (selectedKeyword) {
        const { error } = await supabase
          .from("seo_keywords")
          .update(keywordData)
          .eq("id", selectedKeyword.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Keyword updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("seo_keywords")
          .insert([keywordData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Keyword created successfully",
        });
      }
      setIsDialogOpen(false);
      fetchKeywords();
    } catch (error) {
      console.error("Error saving keyword:", error);
      toast({
        title: "Error",
        description: "Failed to save keyword",
        variant: "destructive",
      });
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">SEO Keywords</h1>
              <p className="text-muted-foreground">Manage target keywords and search terms</p>
            </div>
            <Button onClick={handleAddKeyword}>
              <Plus className="mr-2 h-4 w-4" />
              Add Keyword
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Active</div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Location</div>
              <div className="text-2xl font-bold">{stats.location}</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Product</div>
              <div className="text-2xl font-bold">{stats.product}</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Commercial</div>
              <div className="text-2xl font-bold">{stats.commercial}</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Power</div>
              <div className="text-2xl font-bold">{stats.power}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords, type, location, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Keywords Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <KeywordListTable
              keywords={filteredKeywords}
              onEdit={handleEditKeyword}
              onDelete={handleDeleteKeyword}
            />
          )}
        </div>
      </main>
      <Footer />

      <KeywordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        keyword={selectedKeyword}
        onSave={handleSaveKeyword}
      />
    </div>
  );
};

export default Keywords;
