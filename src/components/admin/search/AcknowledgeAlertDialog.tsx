import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AcknowledgeAlertDialogProps {
  alertId: string | null;
  searchQuery: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTION_OPTIONS = [
  { value: 'products_added', label: 'Added products to catalog' },
  { value: 'descriptions_updated', label: 'Updated product descriptions and keywords' },
  { value: 'content_created', label: 'Created content for these search terms' },
  { value: 'seo_updated', label: 'Updated SEO metadata' },
  { value: 'no_action', label: 'No action needed (false positive)' },
  { value: 'later', label: 'Will address later' },
  { value: 'custom', label: 'Other (specify below)' }
];

export const AcknowledgeAlertDialog = ({ 
  alertId, 
  searchQuery,
  open, 
  onClose, 
  onSuccess 
}: AcknowledgeAlertDialogProps) => {
  const [selectedAction, setSelectedAction] = useState('products_added');
  const [customAction, setCustomAction] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAcknowledge = async () => {
    if (!alertId) return;

    setSaving(true);
    try {
      const actionTaken = selectedAction === 'custom' && customAction
        ? customAction
        : ACTION_OPTIONS.find(opt => opt.value === selectedAction)?.label || selectedAction;

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('search_alert_history')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id,
          action_taken: actionTaken
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alert acknowledged successfully');
      onSuccess();
      onClose();
      setSelectedAction('products_added');
      setCustomAction('');
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Acknowledge Alert</DialogTitle>
          <DialogDescription>
            Mark this alert as handled and specify the action taken for: <strong>"{searchQuery}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>What action did you take?</Label>
            <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
              {ACTION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedAction === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customAction">Describe the action taken</Label>
              <Textarea
                id="customAction"
                placeholder="E.g., Created new product category for these items..."
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAcknowledge} disabled={saving}>
            {saving ? 'Saving...' : 'Acknowledge Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};