-- First, add new enum values for quotation_status
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'revision_requested';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'revised';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'finalized';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'converted_to_order';