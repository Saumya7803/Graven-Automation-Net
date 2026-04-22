import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader2, Edit, Check, X, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addressSchema, type AddressFormData, type AddressValidationResult } from "@/lib/validations/address";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface AddressFormProps {
  title: string;
  description: string;
  address: any;
  onSave: (address: AddressFormData) => Promise<void>;
  canCopyFrom?: any;
  onCopyFrom?: () => void;
  isShippingAddress?: boolean;
  sameAsBilling?: boolean;
  onSameAsBillingChange?: (checked: boolean) => void;
  billingAddress?: any;
}

export const AddressForm = ({
  title,
  description,
  address,
  onSave,
  canCopyFrom,
  onCopyFrom,
  isShippingAddress,
  sameAsBilling,
  onSameAsBillingChange,
  billingAddress,
}: AddressFormProps) => {
  const [isEditing, setIsEditing] = useState(!address);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isLoaded: isMapsLoaded, error: mapsError } = useGoogleMaps();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {},
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = form;

  const validateAddress = async (data: AddressFormData): Promise<AddressValidationResult> => {
    setIsValidating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'validate-address',
        {
          body: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country,
          }
        }
      );

      if (error) throw error;
      return result;
    } catch (error) {
      console.error("Address validation error:", error);
      // Return a default result if validation fails
      return {
        isValid: false,
        isDeliverable: false,
        confidence: 'low',
        message: 'Address validation unavailable. Please double-check your address.'
      };
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    setIsSaving(true);
    
    // Call address validation
    const validation = await validateAddress(data);
    setValidationResult(validation);
    
    // If validation service is unavailable, allow saving with warning
    if (validation.confidence === 'low' && validation.message?.includes('unavailable')) {
      toast.warning(
        "Address validation is currently unavailable. Your address will be saved without verification.",
        { duration: 5000 }
      );
      // Proceed directly to save
      try {
        await onSave(data);
        setIsEditing(false);
        toast.success("Address saved successfully!");
      } catch (error) {
        console.error("Failed to save address:", error);
        toast.error("Failed to save address");
      } finally {
        setIsSaving(false);
      }
      return;
    }
    
    // If address has suggestions, show them but don't block
    if (validation.suggestions && validation.suggestions.length > 0) {
      setShowSuggestions(true);
      setIsSaving(false);
      return;
    }
    
    // If address is invalid but no suggestions, warn but allow save
    if (!validation.isValid || !validation.isDeliverable) {
      toast.warning(
        validation.message || "Address could not be fully verified. Please double-check before proceeding.",
        { duration: 5000 }
      );
    } else {
      toast.success("Address verified!");
    }
    
    // Always proceed with save
    try {
      await onSave(data);
      setIsEditing(false);
      toast.success("Address saved successfully!");
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error("Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset(address || {});
    setIsEditing(false);
  };

  const handlePlaceSelected = (place: any) => {
    form.setValue("street", place.street, { shouldValidate: true });
    form.setValue("city", place.city, { shouldValidate: true });
    form.setValue("state", place.state, { shouldValidate: true });
    form.setValue("zip", place.zip, { shouldValidate: true });
    form.setValue("country", place.country, { shouldValidate: true });
    
    validateAddress({
      street: place.street,
      city: place.city,
      state: place.state,
      zip: place.zip,
      country: place.country,
    });
    
    toast.success("Address auto-filled from suggestion");
  };

  // Auto-validate on field blur with debouncing
  const handleFieldBlur = async () => {
    const values = getValues();
    
    // Only validate if all required fields are filled
    if (values.street && values.city && values.state && values.zip && values.country) {
      const validation = await validateAddress(values as AddressFormData);
      setValidationResult(validation);
    }
  };

  // Debounce the validation to avoid excessive API calls
  let blurTimeout: NodeJS.Timeout;
  const debouncedBlur = () => {
    clearTimeout(blurTimeout);
    blurTimeout = setTimeout(handleFieldBlur, 500);
  };

  return (
    <>
      {/* Address Suggestions Dialog */}
      {showSuggestions && validationResult?.suggestions && (
        <AlertDialog open={showSuggestions} onOpenChange={setShowSuggestions}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Did you mean?</AlertDialogTitle>
              <AlertDialogDescription>
                We found similar addresses. Select one or continue with your original address.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {validationResult.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                  onClick={() => {
                    reset(suggestion.components as AddressFormData);
                    setShowSuggestions(false);
                    setValidationResult(null);
                  }}
                >
                  <p className="font-medium">{suggestion.formattedAddress}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.components.city}, {suggestion.components.state} {suggestion.components.zip}
                  </p>
                </button>
              ))}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={async () => {
                  setShowSuggestions(false);
                  // Proceed with saving the original address
                  try {
                    const data = getValues();
                    await onSave(data as AddressFormData);
                    setIsEditing(false);
                    toast.success("Address saved successfully!");
                  } catch (error) {
                    console.error("Failed to save address:", error);
                    toast.error("Failed to save address");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                Save My Address Anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {!isEditing && address && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Same as Billing Checkbox for Shipping Address */}
        {isShippingAddress && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="same-as-billing" 
                      checked={sameAsBilling}
                      onCheckedChange={onSameAsBillingChange}
                      disabled={!billingAddress}
                    />
                    <Label 
                      htmlFor="same-as-billing" 
                      className={`text-sm font-medium leading-none ${!billingAddress ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      Same as billing address
                    </Label>
                  </div>
                </TooltipTrigger>
                {!billingAddress && (
                  <TooltipContent>
                    <p>Please save billing address first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Show billing address when same as billing is checked */}
        {isShippingAddress && sameAsBilling && billingAddress ? (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Using Billing Address:</p>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">{billingAddress.street}</p>
                <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zip}</p>
                <p>{billingAddress.country}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!isEditing && address ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zip}
                </p>
                <p>{address.country}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {mapsError && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>Address autocomplete unavailable. You can still enter address manually.</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  {isMapsLoaded ? (
                    <AutocompleteInput
                      value={form.watch("street") || ""}
                      onChange={(value) => form.setValue("street", value)}
                      onPlaceSelected={handlePlaceSelected}
                      placeholder="Start typing your address..."
                      disabled={isSaving || isValidating}
                      countryRestriction="in"
                    />
                  ) : !mapsError ? (
                    <div className="relative">
                      <Skeleton className="h-10 w-full" />
                      <div className="absolute inset-0 flex items-center px-3 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading autocomplete...</span>
                      </div>
                    </div>
                  ) : (
                    <Input 
                      id="street" 
                      {...register("street")}
                      placeholder="Enter street address"
                      onBlur={debouncedBlur}
                    />
                  )}
                  {errors.street && (
                    <p className="text-sm text-destructive">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} onBlur={debouncedBlur} />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" {...register("state")} onBlur={debouncedBlur} />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input id="zip" {...register("zip")} onBlur={debouncedBlur} />
                    {errors.zip && (
                      <p className="text-sm text-destructive">{errors.zip.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register("country")} onBlur={debouncedBlur} />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                {/* Address Validation Indicator */}
                {validationResult && !isValidating && (
                  <div className={`p-3 rounded-lg border ${
                    validationResult.isValid && validationResult.isDeliverable
                      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                      : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {validationResult.isValid && validationResult.isDeliverable ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Address Verified ✓</p>
                            {validationResult.formattedAddress && (
                              <p className="text-sm mt-1">
                                Standardized: {validationResult.formattedAddress}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Address Verification Warning</p>
                            <p className="text-sm mt-1">{validationResult.message}</p>
                            <p className="text-sm mt-2 font-medium">You can still save this address if you're confident it's correct.</p>
                            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="p-0 h-auto mt-2"
                                onClick={() => setShowSuggestions(true)}
                              >
                                View suggested addresses →
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Validating Indicator */}
                {isValidating && (
                  <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Validating address...</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSaving || isValidating}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  {address && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving || isValidating}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  {canCopyFrom && onCopyFrom && !isShippingAddress && (
                    <Button type="button" variant="outline" onClick={onCopyFrom}>
                      Copy from Billing
                    </Button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};
