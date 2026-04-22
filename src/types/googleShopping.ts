export interface ValidationIssue {
  type: 'error' | 'warning';
  field: string;
  message: string;
  productId?: string;
}

export interface ValidationSummary {
  totalProducts: number;
  productsWithErrors: number;
  productsWithWarnings: number;
  validationTime: string;
}

export interface ValidationResults {
  valid: boolean;
  productCount: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: ValidationSummary;
}
