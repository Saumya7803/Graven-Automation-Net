import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestimonialDialog } from "@/components/admin/TestimonialDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Star, Quote, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  created_at: string;
}

export default function TestimonialsList() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTestimonials();
    }
  }, [isAdmin]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTestimonials(data || []);
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

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setDialogOpen(true);
  };

  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testimonialToDelete) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: !testimonial.is_featured })
        .eq("id", testimonial.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Testimonial ${!testimonial.is_featured ? "featured" : "unfeatured"}`,
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_active: !testimonial.is_active })
        .eq("id", testimonial.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Testimonial ${!testimonial.is_active ? "activated" : "deactivated"}`,
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false);
    setEditingTestimonial(null);
    if (success) {
      fetchTestimonials();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.testimonial_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (testimonial.project_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (testimonial.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const featuredCount = testimonials.filter(t => t.is_featured).length;
  const activeCount = testimonials.filter(t => t.is_active).length;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Testimonials Management</h1>
          <p className="text-muted-foreground">
            Manage customer testimonials displayed on your website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
              <Quote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testimonials.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featuredCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Testimonials</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredTestimonials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Quote className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No testimonials found</p>
                </div>
              ) : (
                filteredTestimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{testimonial.customer_name}</h3>
                              {testimonial.customer_title && (
                                <p className="text-sm text-muted-foreground">{testimonial.customer_title}</p>
                              )}
                              <p className="text-sm font-medium text-primary">{testimonial.company_name}</p>
                              <div className="mt-2">
                                {renderStars(testimonial.rating || 5)}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Order: {testimonial.display_order || 0}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            "{testimonial.testimonial_text}"
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {testimonial.is_featured && (
                              <Badge variant="default">Featured</Badge>
                            )}
                            {testimonial.is_active ? (
                              <Badge variant="outline" className="border-green-500 text-green-700">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-500 text-red-700">
                                Inactive
                              </Badge>
                            )}
                            {testimonial.project_type && (
                              <Badge variant="secondary">{testimonial.project_type}</Badge>
                            )}
                            {testimonial.location && (
                              <Badge variant="secondary">{testimonial.location}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(testimonial)}
                            title={testimonial.is_featured ? "Unfeature" : "Feature"}
                          >
                            <Star className={`h-4 w-4 ${testimonial.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(testimonial)}
                            title={testimonial.is_active ? "Deactivate" : "Activate"}
                          >
                            {testimonial.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(testimonial)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <TestimonialDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          testimonial={editingTestimonial}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the testimonial from{" "}
                <strong>{testimonialToDelete?.customer_name}</strong> at{" "}
                <strong>{testimonialToDelete?.company_name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Footer />
    </>
  );
}
