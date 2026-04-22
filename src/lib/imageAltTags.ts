/**
 * SEO-Optimized Alt Tag Generation Utilities
 * Generates keyword-rich, descriptive alt tags for images
 */

interface ProductAltData {
  name: string;
  series: string;
  power_range?: string;
  sku?: string;
  category?: string;
}

interface HeroAltData {
  title: string;
  description: string;
  subtitle?: string;
}

interface BlogAltData {
  title: string;
  category?: string;
}

interface CategoryAltData {
  name: string;
  power_range?: string;
  description?: string;
}

/**
 * Generate SEO-optimized alt tag for product images
 * Format: "Schneider Electric {series} {name} Variable Frequency Drive {power_range} - {sku} - Motor Control VFD for {category} Applications - Available in Delhi Mumbai Bangalore India"
 */
export const generateProductAlt = (product: ProductAltData): string => {
  const parts = [
    "Schneider Electric",
    product.series,
    product.name,
    "Variable Frequency Drive",
  ];

  if (product.power_range) {
    parts.push(product.power_range);
  }

  if (product.sku) {
    parts.push(`- ${product.sku}`);
  }

  parts.push("- Motor Control VFD");

  if (product.category) {
    parts.push(`for ${product.category} Applications`);
  }

  parts.push("- Available in Delhi Mumbai Bangalore India");

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

/**
 * Generate SEO-optimized alt tag for hero/carousel images
 * Format: "{title} - {description} - Schneider Electric VFD Variable Frequency Drives - Industrial Automation Solutions Delhi NCR India"
 */
export const generateHeroAlt = (hero: HeroAltData): string => {
  const parts = [hero.title];

  if (hero.subtitle) {
    parts.push(hero.subtitle);
  }

  parts.push(hero.description);
  parts.push("- Schneider Electric VFD Variable Frequency Drives");
  parts.push("- Industrial Automation Solutions Delhi NCR India");

  return parts.join(" - ").replace(/\s+/g, " ").trim();
};

/**
 * Generate SEO-optimized alt tag for blog/article images
 * Format: "{title} - {category} - Expert VFD Guide by Schneider Electric Specialists Delhi India"
 */
export const generateBlogAlt = (blog: BlogAltData): string => {
  const parts = [blog.title];

  if (blog.category) {
    parts.push(blog.category);
  }

  parts.push("Expert VFD Guide by Schneider Electric Specialists Delhi India");

  return parts.join(" - ").replace(/\s+/g, " ").trim();
};

/**
 * Generate SEO-optimized alt tag for category images
 * Format: "Schneider Electric {name} Series Variable Frequency Drives - {power_range} - {description} - Buy Online Delhi India"
 */
export const generateCategoryAlt = (category: CategoryAltData): string => {
  const parts = [
    "Schneider Electric",
    category.name,
    "Series Variable Frequency Drives",
  ];

  if (category.power_range) {
    parts.push(`- ${category.power_range}`);
  }

  if (category.description) {
    parts.push(`- ${category.description}`);
  }

  parts.push("- Buy Online Delhi India");

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

/**
 * Generate generic SEO-optimized alt tag with location keywords
 */
export const generateGenericAlt = (description: string): string => {
  return `${description} - Schneider Electric VFD Solutions Delhi NCR India`.replace(/\s+/g, " ").trim();
};
