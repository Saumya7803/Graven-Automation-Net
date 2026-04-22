import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Mail, Bell, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Template {
  id: string;
  name: string;
  template_type: string;
  stage_number: number;
  send_after_days: number;
  email_subject: string | null;
  email_html: string | null;
  push_title: string | null;
  push_body: string | null;
  is_active: boolean;
  times_sent: number;
  times_clicked: number;
  conversions: number;
}

const ProcurementRecoveryTemplates = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    template_type: "email",
    stage_number: 1,
    send_after_days: 3,
    email_subject: "",
    email_html: "",
    push_title: "",
    push_body: "",
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["procurement-recovery-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_recovery_templates")
        .select("*")
        .order("stage_number", { ascending: true });
      if (error) throw error;
      return data as Template[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingTemplate) {
        const { error } = await supabase
          .from("procurement_recovery_templates")
          .update(data)
          .eq("id", editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("procurement_recovery_templates")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingTemplate ? "Template updated" : "Template created");
      queryClient.invalidateQueries({ queryKey: ["procurement-recovery-templates"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("procurement_recovery_templates")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurement-recovery-templates"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("procurement_recovery_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["procurement-recovery-templates"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      template_type: "email",
      stage_number: 1,
      send_after_days: 3,
      email_subject: "",
      email_html: "",
      push_title: "",
      push_body: "",
    });
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      stage_number: template.stage_number,
      send_after_days: template.send_after_days,
      email_subject: template.email_subject || "",
      email_html: template.email_html || "",
      push_title: template.push_title || "",
      push_body: template.push_body || "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }
    saveMutation.mutate(formData);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "push":
        return <Bell className="h-4 w-4" />;
      case "both":
        return (
          <div className="flex gap-1">
            <Mail className="h-4 w-4" />
            <Bell className="h-4 w-4" />
          </div>
        );
      default:
        return null;
    }
  };

  const calcConversionRate = (template: Template) => {
    if (!template.times_sent) return "0%";
    return `${Math.round((template.conversions / template.times_sent) * 100)}%`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/procurement-list-recovery">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Recovery Templates</h1>
              <p className="text-muted-foreground">Manage procurement list recovery email templates</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates?.reduce((sum, t) => sum + (t.times_sent || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {templates?.reduce((sum, t) => sum + (t.conversions || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Send After</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : templates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">No templates found</TableCell>
                  </TableRow>
                ) : (
                  templates?.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getTypeIcon(template.template_type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Stage {template.stage_number}</Badge>
                      </TableCell>
                      <TableCell>{template.send_after_days} days</TableCell>
                      <TableCell>{template.times_sent || 0}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{calcConversionRate(template)}</span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: template.id, isActive: checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(template)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Stage 1 - Gentle Reminder"
                  />
                </div>
                <div>
                  <Label>Template Type</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="push">Push Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stage Number</Label>
                  <Select
                    value={String(formData.stage_number)}
                    onValueChange={(value) => setFormData({ ...formData, stage_number: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Stage 1</SelectItem>
                      <SelectItem value="2">Stage 2</SelectItem>
                      <SelectItem value="3">Stage 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Send After (days of inactivity)</Label>
                  <Input
                    type="number"
                    value={formData.send_after_days}
                    onChange={(e) => setFormData({ ...formData, send_after_days: parseInt(e.target.value) || 3 })}
                    min={1}
                  />
                </div>
              </div>

              {(formData.template_type === "email" || formData.template_type === "both") && (
                <>
                  <div>
                    <Label>Email Subject</Label>
                    <Input
                      value={formData.email_subject}
                      onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                      placeholder="Your saved products are waiting!"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available placeholders: {"{{customer_name}}, {{company_name}}, {{item_count}}, {{list_value}}"}
                    </p>
                  </div>
                  <div>
                    <Label>Email HTML</Label>
                    <Textarea
                      value={formData.email_html}
                      onChange={(e) => setFormData({ ...formData, email_html: e.target.value })}
                      rows={8}
                      placeholder="<div>...</div>"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {"{{product_list}}"} to insert the formatted product table, {"{{recovery_link}}"} for the recovery URL
                    </p>
                  </div>
                </>
              )}

              {(formData.template_type === "push" || formData.template_type === "both") && (
                <>
                  <div>
                    <Label>Push Title</Label>
                    <Input
                      value={formData.push_title}
                      onChange={(e) => setFormData({ ...formData, push_title: e.target.value })}
                      placeholder="Your saved products!"
                    />
                  </div>
                  <div>
                    <Label>Push Body</Label>
                    <Textarea
                      value={formData.push_body}
                      onChange={(e) => setFormData({ ...formData, push_body: e.target.value })}
                      rows={2}
                      placeholder="You have items waiting in your procurement list"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {editingTemplate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default ProcurementRecoveryTemplates;
