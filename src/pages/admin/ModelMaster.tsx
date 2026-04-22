import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useModelMaster, ModelMaster as ModelMasterType } from "@/hooks/useModelMaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { ModelMasterDialog } from "@/components/admin/ModelMasterDialog";
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

const LIFECYCLE_STATUSES = [
  { value: "Active", label: "Active", icon: CheckCircle, color: "bg-green-500" },
  { value: "Discontinued", label: "Discontinued", icon: AlertTriangle, color: "bg-yellow-500" },
  { value: "Obsolete", label: "Obsolete", icon: XCircle, color: "bg-red-500" },
];

export default function ModelMaster() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { models, loading, fetchModels, deleteModel } = useModelMaster();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [seriesFilter, setSeriesFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelMasterType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingModel, setDeletingModel] = useState<ModelMasterType | null>(null);

  // Get available brands based on category filter
  const availableBrands =
    categoryFilter !== "all" ? getBrandsForCategory(categoryFilter) : [];

  // Get available series based on category and brand filter
  const availableSeries =
    categoryFilter !== "all" && brandFilter !== "all"
      ? getSeriesForBrandCategory(brandFilter, categoryFilter)
      : [];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const filters: {
      category_slug?: string;
      brand_slug?: string;
      series_slug?: string;
      lifecycle_status?: string;
      search?: string;
    } = {};

    if (categoryFilter !== "all") filters.category_slug = categoryFilter;
    if (brandFilter !== "all") filters.brand_slug = brandFilter;
    if (seriesFilter !== "all") filters.series_slug = seriesFilter;
    if (statusFilter !== "all") filters.lifecycle_status = statusFilter;
    if (search) filters.search = search;

    fetchModels(filters);
  }, [categoryFilter, brandFilter, seriesFilter, statusFilter, search]);

  // Reset dependent filters when parent changes
  useEffect(() => {
    setBrandFilter("all");
    setSeriesFilter("all");
  }, [categoryFilter]);

  useEffect(() => {
    setSeriesFilter("all");
  }, [brandFilter]);

  const handleAdd = () => {
    setEditingModel(null);
    setDialogOpen(true);
  };

  const handleEdit = (model: ModelMasterType) => {
    setEditingModel(model);
    setDialogOpen(true);
  };

  const handleDeleteClick = (model: ModelMasterType) => {
    setDeletingModel(model);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingModel) {
      await deleteModel(deletingModel.id);
      setDeleteDialogOpen(false);
      setDeletingModel(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = LIFECYCLE_STATUSES.find((s) => s.value === status);
    if (!statusConfig) return null;

    const Icon = statusConfig.icon;
    return (
      <Badge
        variant="secondary"
        className={`${
          status === "Active"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : status === "Discontinued"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // Stats
  const stats = {
    total: models.length,
    active: models.filter((m) => m.lifecycle_status === "Active").length,
    discontinued: models.filter((m) => m.lifecycle_status === "Discontinued").length,
    obsolete: models.filter((m) => m.lifecycle_status === "Obsolete").length,
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Model Master Catalog</h1>
            <p className="text-muted-foreground">
              Manage model numbers and their specifications
            </p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discontinued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.discontinued}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Obsolete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.obsolete}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={brandFilter}
              onValueChange={setBrandFilter}
              disabled={categoryFilter === "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand.value} value={brand.value}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={seriesFilter}
              onValueChange={setSeriesFilter}
              disabled={brandFilter === "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Series</SelectItem>
                {availableSeries.map((series) => (
                  <SelectItem key={series.value} value={series.value}>
                    {series.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {LIFECYCLE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search model number or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No models found</p>
              <p className="text-sm">Add your first model to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-mono font-medium">
                      {model.model_number}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{model.name}</TableCell>
                    <TableCell className="capitalize">{model.category_slug}</TableCell>
                    <TableCell className="capitalize">
                      {model.brand_slug.replace(/-/g, " ")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {model.series_slug.replace(/-/g, " ")}
                    </TableCell>
                    <TableCell>{getStatusBadge(model.lifecycle_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(model)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(model)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <ModelMasterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingModel={editingModel}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete model{" "}
              <span className="font-mono font-bold">{deletingModel?.model_number}</span>?
              This action cannot be undone.
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
    </div>
  );
}
