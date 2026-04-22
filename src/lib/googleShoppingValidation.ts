export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  gtin?: string;
  brand?: string;
  condition?: string;
  google_product_category?: string;
  image_url?: string;
  price: number;
  is_quote_only?: boolean;
}

export interface GoogleShoppingProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  brand: string;
  gtin?: string;
  condition: string;
  price: string;
  availability: string;
  google_product_category: string;
}

// Validate GTIN format (8, 12, 13, or 14 digits for UPC/EAN/ISBN)
export const validateGTIN = (gtin: string): ValidationResult => {
  if (!gtin || gtin.trim() === '') {
    return { valid: true }; // Optional field
  }
  
  const cleanGTIN = gtin.replace(/\s/g, '');
  const validLengths = [8, 12, 13, 14];
  
  if (!/^\d+$/.test(cleanGTIN)) {
    return { valid: false, error: 'GTIN must contain only digits' };
  }
  
  if (!validLengths.includes(cleanGTIN.length)) {
    return { valid: false, error: 'GTIN must be 8, 12, 13, or 14 digits (UPC/EAN/ISBN)' };
  }
  
  return { valid: true };
};

// Validate image URL format
export const validateImageUrl = async (url: string): Promise<ValidationResult> => {
  if (!url || url.trim() === '') {
    return { valid: true }; // Optional field
  }
  
  try {
    new URL(url);
    if (!url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return { valid: false, error: 'Image URL must end with a valid image extension (.jpg, .png, .webp, .gif)' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Synchronous version for immediate validation
export const validateImageUrlSync = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { valid: true };
  }
  
  try {
    new URL(url);
    if (!url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return { valid: false, error: 'Image URL must end with a valid image extension' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Validate condition
export const validateCondition = (condition: string): ValidationResult => {
  if (!condition || condition.trim() === '') {
    return { valid: true }; // Optional field
  }
  
  const validConditions = ['new', 'refurbished', 'used'];
  if (!validConditions.includes(condition.toLowerCase())) {
    return { valid: false, error: 'Condition must be "new", "refurbished", or "used"' };
  }
  
  return { valid: true };
};

// Validate brand
export const validateBrand = (brand: string): ValidationResult => {
  if (!brand || brand.trim() === '') {
    return { valid: true }; // Optional field
  }
  
  if (brand.length > 70) {
    return { valid: false, error: 'Brand must be 70 characters or less' };
  }
  
  return { valid: true };
};

// Suggest Google Product Categories based on product name and series
export const suggestCategory = (productName: string, series?: string): string[] => {
  const categories = [
    'Hardware > Power & Electrical Supplies > Power Controllers & Transformers',
    'Hardware > Electrical Equipment > Variable Frequency Drives',
    'Business & Industrial > Automation & Control > Motor Controls',
    'Hardware > Power & Electrical Supplies > Electrical Motors',
    'Business & Industrial > Material Handling > Conveyor Belts & Accessories',
  ];
  
  // Return most relevant categories based on keywords
  const keywords = (productName + ' ' + (series || '')).toLowerCase();
  
  if (keywords.includes('vfd') || keywords.includes('drive') || keywords.includes('altivar')) {
    return [categories[1], categories[0], categories[2]];
  }
  
  return categories;
};

export const isGoogleShoppingComplete = (product: Product): boolean => {
  // Exclude quote-only products
  if (product.is_quote_only) {
    return false;
  }
  
  return !!(
    product.sku && // MPN is the SKU
    product.brand &&
    product.condition &&
    product.google_product_category &&
    product.image_url
  );
};

// Calculate completion percentage for a product (using MPN strategy)
export const calculateCompletionPercentage = (product: Product): number => {
  const fields = ['sku', 'brand', 'condition', 'google_product_category', 'image_url'];
  const completed = fields.filter(field => product[field as keyof Product]).length;
  return Math.round((completed / fields.length) * 100);
};

// Format product data for Google Shopping XML feed
export const formatForGoogleFeed = (product: Product): GoogleShoppingProduct => {
  return {
    id: product.sku,
    title: product.name,
    description: product.name,
    link: `https://yourwebsite.com/products/${product.sku}`,
    image_link: product.image_url || '',
    brand: product.brand || 'Schneider Electric',
    gtin: product.gtin,
    condition: product.condition || 'new',
    price: `${product.price} INR`,
    availability: 'in stock',
    google_product_category: product.google_product_category || 'Hardware > Power & Electrical Supplies > Power Controllers & Transformers',
  };
};

// Generate test GTIN (for development/testing only)
export const generateTestGTIN = (): string => {
  const length = 13; // EAN-13 format
  let gtin = '';
  for (let i = 0; i < length; i++) {
    gtin += Math.floor(Math.random() * 10);
  }
  return gtin;
};

// Common Google Product Categories for VFDs and industrial equipment
export const COMMON_CATEGORIES = [
  'Hardware > Power & Electrical Supplies > Power Controllers & Transformers',
  'Hardware > Electrical Equipment > Variable Frequency Drives',
  'Business & Industrial > Automation & Control > Motor Controls',
  'Hardware > Power & Electrical Supplies > Electrical Motors',
  'Business & Industrial > Material Handling > Conveyor Belts & Accessories',
  'Business & Industrial > Automation & Control > Programmable Logic Controllers',
  'Hardware > Power & Electrical Supplies > Circuit Breakers',
  'Business & Industrial > Automation & Control > Control Panels',
];
