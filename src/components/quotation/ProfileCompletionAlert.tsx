import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCompletionAlertProps {
  missingFields: string[];
  onClose: () => void;
  userType: 'admin' | 'customer';
  customerEmail?: string;
  customerName?: string;
  quotationId?: string;
  userId?: string;
}

export const ProfileCompletionAlert = ({ 
  missingFields, 
  onClose, 
  userType, 
  customerEmail,
  customerName,
  quotationId,
  userId
}: ProfileCompletionAlertProps) => {
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);

  const handleNotifyCustomer = async () => {
    if (!quotationId || !customerEmail || !customerName) {
      toast.error("Missing required information to send notification");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-profile-completion-reminder', {
        body: {
          quotationId,
          customerEmail,
          customerName,
          missingFields,
          userId
        }
      });

      if (error) throw error;

      toast.success(`Email sent to ${customerEmail} requesting profile completion`);
      onClose();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send email notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AlertDialog open={missingFields.length > 0} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Profile Information Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            {userType === 'admin' 
              ? `The customer (${customerEmail}) needs to complete their profile before a detailed PDF can be generated.`
              : 'Please complete your profile to generate a detailed quotation PDF with all necessary information.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4">
          <p className="text-sm font-medium mb-2 text-foreground">Missing Information:</p>
          <ul className="space-y-1">
            {missingFields.map((field) => (
              <li key={field} className="text-sm flex items-center gap-2 text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {field}
              </li>
            ))}
          </ul>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {userType === 'customer' && (
            <Button onClick={() => {
              navigate('/profile?tab=profile');
              onClose();
            }}>
              Complete Profile
            </Button>
          )}
          {userType === 'admin' && (
            <Button onClick={handleNotifyCustomer} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Notify Customer'
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
