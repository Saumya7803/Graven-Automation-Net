interface ProfileValidation {
  isComplete: boolean;
  missingFields: string[];
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface Customer {
  gst_number?: string | null;
  billing_address?: Address | null;
  shipping_address?: Address | null;
}

export const validateCustomerProfileForPDF = (customer: Customer | null | undefined): ProfileValidation => {
  const missingFields: string[] = [];
  
  if (!customer) {
    return {
      isComplete: false,
      missingFields: ['Customer profile not found']
    };
  }
  
  // Check GST number
  if (!customer.gst_number || customer.gst_number.trim() === '') {
    missingFields.push('GST Number');
  }
  
  // Check billing address
  const billing = customer.billing_address;
  if (!billing || !billing.street || !billing.city || !billing.state || !billing.zip || !billing.country) {
    missingFields.push('Billing Address');
  }
  
  // Check shipping address  
  const shipping = customer.shipping_address;
  if (!shipping || !shipping.street || !shipping.city || !shipping.state || !shipping.zip || !shipping.country) {
    missingFields.push('Shipping Address');
  }
  
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};
