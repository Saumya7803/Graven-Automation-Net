import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Mail, Clock, TrendingUp, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecoveryTemplateDialog } from "@/components/admin/RecoveryTemplateDialog";
import { SendRecoveryDialog } from "@/components/admin/SendRecoveryDialog";
import { ActiveCartsCard } from "@/components/admin/ActiveCartsCard";

export default function CartRecoveryTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["cart-recovery-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_recovery_templates")
        .select("*")
        .order("stage_number", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cart_recovery_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-recovery-templates"] });
      toast({ title: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("cart_recovery_templates")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-recovery-templates"] });
      toast({ title: "Template status updated" });
    },
  });

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSendWithTemplate = (templateId: string) => {
    setPreselectedTemplateId(templateId);
    setIsSendDialogOpen(true);
  };

  const handleOpenSendDialog = () => {
    setPreselectedTemplateId(undefined);
    setIsSendDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Cart Recovery Templates</h1>
              <p className="text-muted-foreground">
                Manage email and push notification templates for abandoned cart recovery
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Active Carts Card */}
          <ActiveCartsCard onSendEmails={handleOpenSendDialog} />

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates?.filter((t) => t.is_active).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates?.reduce((sum, t) => sum + (t.times_sent || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates?.reduce((sum, t) => sum + (t.conversions || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conv. Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates && templates.length > 0
                    ? (
                        (templates.reduce((sum, t) => sum + (t.conversions || 0), 0) /
                          templates.reduce((sum, t) => sum + (t.times_sent || 1), 0)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Table */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Timing</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => {
                        const convRate =
                          template.times_sent > 0
                            ? ((template.conversions || 0) / template.times_sent) * 100
                            : 0;

                        return (
                          <TableRow key={template.id}>
                            <TableCell>
                              <Badge variant="outline">Stage {template.stage_number}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{template.template_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{template.send_after_hours}h</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {template.discount_type && template.discount_value ? (
                                <Badge variant="secondary">
                                  {template.discount_type === "percentage"
                                    ? `${template.discount_value}%`
                                    : `₹${template.discount_value}`}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {template.times_sent || 0} sent, {template.conversions || 0}{" "}
                                  conv.
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {convRate.toFixed(1)}% rate
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={template.is_active ? "default" : "outline"}
                                onClick={() =>
                                  toggleActiveMutation.mutate({
                                    id: template.id,
                                    isActive: template.is_active,
                                  })
                                }
                              >
                                {template.is_active ? "Active" : "Inactive"}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSendWithTemplate(template.id)}
                                  title="Send emails with this template"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(template)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(template.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No templates found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first cart recovery template
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <RecoveryTemplateDialog
        template={selectedTemplate}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedTemplate(null);
        }}
      />

      <SendRecoveryDialog
        open={isSendDialogOpen}
        onClose={() => {
          setIsSendDialogOpen(false);
          setPreselectedTemplateId(undefined);
        }}
        preselectedTemplateId={preselectedTemplateId}
      />
    </div>
  );
}
