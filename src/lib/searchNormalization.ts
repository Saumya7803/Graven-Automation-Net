/**
 * Search Normalization Utilities
 * Handles model number normalization and query processing for industrial automation search
 */

/**
 * Normalize a model number by removing spaces, dashes, and converting to lowercase
 * Examples:
 * - "ATV 320 U07N4B" -> "atv320u07n4b"
 * - "6SE7 0.75" -> "6se7075"
 * - "ATV-320-U07N4B" -> "atv320u07n4b"
 */
export function normalizeModelNumber(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\-_.]/g, '') // Remove spaces, dashes, underscores, dots
    .replace(/[^\w]/g, ''); // Remove any remaining special characters
}

/**
 * Normalize a search query while preserving word boundaries for multi-word matching
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes extra spaces
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces to single space
}

/**
 * Extract power rating from a search query
 * Supports formats: "5.5kW", "5.5 kW", "5500W", "7.5HP", etc.
 */
export function extractPowerRating(query: string): { power: string | null; remaining: string } {
  // Match patterns like: 5.5kW, 5.5 kW, 5500W, 7.5HP, 7.5 HP
  const powerPattern = /(\d+(?:\.\d+)?)\s*(kw|w|hp|kva|va)\b/gi;
  const match = powerPattern.exec(query);
  
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    // Normalize to kW format
    let normalizedPower: string;
    if (unit === 'w') {
      normalizedPower = `${value / 1000}kW`;
    } else if (unit === 'hp') {
      normalizedPower = `${(value * 0.746).toFixed(2)}kW`;
    } else if (unit === 'kva' || unit === 'va') {
      normalizedPower = unit === 'va' ? `${value / 1000}kVA` : `${value}kVA`;
    } else {
      normalizedPower = `${value}kW`;
    }
    
    const remaining = query.replace(match[0], '').trim();
    return { power: normalizedPower, remaining };
  }
  
  return { power: null, remaining: query };
}

/**
 * Known brand names for extraction from search queries
 */
const KNOWN_BRANDS = [
  'schneider electric', 'schneider',
  'siemens',
  'allen bradley', 'allen-bradley', 'rockwell',
  'mitsubishi electric', 'mitsubishi',
  'abb',
  'delta',
  'yaskawa',
  'danfoss',
  'omron',
  'fuji',
  'weg',
  'lenze',
  'sew',
  'nord',
  'vacon',
  'hitachi'
];

/**
 * Extract brand name from a search query
 */
export function extractBrand(query: string): { brand: string | null; remaining: string } {
  const lowerQuery = query.toLowerCase();
  
  // Sort by length descending to match longer brand names first
  const sortedBrands = [...KNOWN_BRANDS].sort((a, b) => b.length - a.length);
  
  for (const brand of sortedBrands) {
    if (lowerQuery.includes(brand)) {
      // Create a case-insensitive regex to remove the brand from query
      const regex = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const remaining = query.replace(regex, '').trim().replace(/\s+/g, ' ');
      
      // Return the properly capitalized brand name
      const capitalizedBrand = brand.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { brand: capitalizedBrand, remaining };
    }
  }
  
  return { brand: null, remaining: query };
}

/**
 * Known category keywords for extraction
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'VFD': ['vfd', 'variable frequency drive', 'inverter', 'ac drive', 'drive', 'frequency converter'],
  'PLC': ['plc', 'programmable logic controller', 'controller', 'logic controller', 'cpu'],
  'HMI': ['hmi', 'human machine interface', 'touch panel', 'operator panel', 'display'],
  'Servo': ['servo', 'servo drive', 'servo motor', 'servo amplifier', 'servo amp'],
  'Motor': ['motor', 'electric motor', 'ac motor', 'dc motor'],
  'Sensor': ['sensor', 'proximity', 'photoelectric', 'encoder'],
  'Relay': ['relay', 'contactor', 'overload'],
  'Switch': ['switch', 'limit switch', 'safety switch'],
};

/**
 * Extract category from a search query
 */
export function extractCategory(query: string): { category: string | null; remaining: string } {
  const lowerQuery = query.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    // Sort keywords by length descending to match longer ones first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
      // Use word boundary matching for more accurate detection
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(lowerQuery)) {
        const remaining = query.replace(regex, '').trim().replace(/\s+/g, ' ');
        return { category, remaining };
      }
    }
  }
  
  return { category: null, remaining: query };
}

/**
 * Parse a complete search query and extract structured information
 */
export interface ParsedQuery {
  brand: string | null;
  category: string | null;
  power: string | null;
  normalizedTerms: string[];
  originalQuery: string;
}

export function parseSearchQuery(query: string): ParsedQuery {
  let remaining = normalizeSearchQuery(query);
  
  // Extract components in order
  const { brand, remaining: afterBrand } = extractBrand(remaining);
  remaining = afterBrand;
  
  const { category, remaining: afterCategory } = extractCategory(remaining);
  remaining = afterCategory;
  
  const { power, remaining: afterPower } = extractPowerRating(remaining);
  remaining = afterPower;
  
  // Split remaining into search terms
  const normalizedTerms = remaining
    .split(' ')
    .filter(term => term.length >= 2)
    .map(term => term.trim());
  
  return {
    brand,
    category,
    power,
    normalizedTerms,
    originalQuery: query
  };
}

/**
 * Generate search variations for a model number
 * Helps with fuzzy matching of part numbers
 */
export function generateModelVariations(model: string): string[] {
  const normalized = normalizeModelNumber(model);
  const variations = new Set<string>([normalized, model.toLowerCase()]);
  
  // Add variation without common prefixes/suffixes
  const withoutSpaces = model.replace(/\s/g, '').toLowerCase();
  variations.add(withoutSpaces);
  
  // Add variation with spaces removed between alphanumeric groups
  const withSpaces = model.replace(/([a-z])(\d)/gi, '$1 $2')
    .replace(/(\d)([a-z])/gi, '$1 $2')
    .toLowerCase();
  variations.add(withSpaces);
  
  return Array.from(variations);
}
