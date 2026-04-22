/**
 * Generate OG image URL based on page type and content
 */
export const generateOGImageUrl = (
  type: "product" | "blog" | "category" | "default",
  imageUrl?: string
): string => {
  // If specific image provided, use it
  if (imageUrl) {
    return imageUrl;
  }

  // Default branded OG image
  return "/og-default.png";
};

/**
 * Get optimal OG image for product pages
 */
export const getProductOGImage = (productImage?: string): string => {
  return generateOGImageUrl("product", productImage);
};

/**
 * Get optimal OG image for blog posts
 */
export const getBlogOGImage = (featuredImage?: string): string => {
  return generateOGImageUrl("blog", featuredImage);
};

/**
 * Get optimal OG image for category pages
 */
export const getCategoryOGImage = (categoryImage?: string): string => {
  return generateOGImageUrl("category", categoryImage);
};
