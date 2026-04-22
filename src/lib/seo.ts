// SEO utility functions and schema generators

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export const defaultSEO: SEOConfig = {
  title: "Graven Automation | Complete Industrial Automation Solutions",
  description: "Graven Automation - A complete solution for industrial automation. Variable Frequency Drives, PLCs, HMIs, and automation products. Contact: sales@gravenautomation.com",
  keywords: "Industrial Automation, VFD, Variable Frequency Drive, PLC, HMI, Motor Control, Automation Solutions, India",
  ogImage: "https://lovable.dev/opengraph-image-p98pqg.png",
  ogType: "website",
};

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Graven Automation",
  "description": "A complete solution for industrial automation - VFDs, PLCs, HMIs, and expert technical support",
  "url": window.location.origin,
  "logo": `${window.location.origin}/favicon.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Sales",
    "email": "sales@gravenautomation.com",
    "areaServed": "IN",
    "availableLanguage": "English"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "sameAs": []
});

export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Graven Automation",
  "description": "Complete industrial automation solutions - VFDs, PLCs, HMIs, and expert support",
  "image": `${window.location.origin}/favicon.png`,
  "email": "sales@gravenautomation.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "url": window.location.origin,
  "priceRange": "₹₹₹",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "14:00"
    }
  ]
});

export const generateProductSchema = (product: {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image_url?: string;
  images?: string[];
  brand?: string;
  sku?: string;
  stock_quantity?: number;
  category?: string;
  is_quote_only?: boolean;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  specifications?: Array<{ name: string; value: string }>;
}) => {
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images && product.images.length > 0 
      ? product.images 
      : (product.image_url || `${window.location.origin}/favicon.png`),
    "sku": product.sku || product.id,
    "mpn": product.sku || product.id,
    "productID": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Graven Automation"
    },
    ...(product.category && { "category": product.category }),
    ...(product.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.aggregateRating.ratingValue,
        "reviewCount": product.aggregateRating.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    ...(product.is_quote_only ? {
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "INR",
        "price": "0",
        "valueAddedTaxIncluded": true,
        "additionalType": "https://schema.org/ContactPagePrice"
      }
    } : {
      "offers": {
        "@type": "Offer",
        "url": `${window.location.origin}/product/${product.id}`,
        "priceCurrency": "INR",
        "price": product.price,
        "priceValidUntil": priceValidUntil.toISOString().split('T')[0],
        "availability": product.stock_quantity && product.stock_quantity > 0 
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition",
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "INR"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "IN"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 2,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 3,
              "maxValue": 7,
              "unitCode": "DAY"
            }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 30,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        },
        "seller": {
          "@type": "Organization",
          "name": "Graven Automation"
        }
      }
    }),
    ...(product.specifications && product.specifications.length > 0 && {
      "additionalProperty": product.specifications.map(spec => ({
        "@type": "PropertyValue",
        "name": spec.name,
        "value": spec.value
      }))
    })
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${window.location.origin}${item.url}`
  }))
});

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  publishedDate: string;
  modifiedDate?: string;
  author?: string;
  image?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": article.image || `${window.location.origin}/favicon.png`,
  "datePublished": article.publishedDate,
  "dateModified": article.modifiedDate || article.publishedDate,
  "author": {
    "@type": "Person",
    "name": article.author || "Graven Automation"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Graven Automation",
    "logo": {
      "@type": "ImageObject",
      "url": `${window.location.origin}/favicon.png`
    }
  }
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Product Review/Rating Schema
export const generateAggregateRatingSchema = (ratings: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": ratings.ratingValue,
  "reviewCount": ratings.reviewCount,
  "bestRating": ratings.bestRating || 5,
  "worstRating": 1
});

// Product Specifications Schema
export const generateProductSpecificationSchema = (specs: Array<{
  name: string;
  value: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "PropertyValue",
  "additionalProperty": specs.map(spec => ({
    "@type": "PropertyValue",
    "name": spec.name,
    "value": spec.value
  }))
});

// Video Schema for Product Demos
export const generateVideoSchema = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  embedUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": video.name,
  "description": video.description,
  "thumbnailUrl": video.thumbnailUrl,
  "uploadDate": video.uploadDate,
  "duration": video.duration,
  ...(video.embedUrl && { "embedUrl": video.embedUrl, "contentUrl": video.embedUrl })
});

// How-To Schema for Installation Guides
export const generateHowToSchema = (guide: {
  name: string;
  description: string;
  totalTime: string;
  steps: Array<{ name: string; text: string; image?: string }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": guide.name,
  "description": guide.description,
  "totalTime": guide.totalTime,
  "step": guide.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && { "image": step.image })
  }))
});

// ItemList Schema for Product Categories
export const generateItemListSchema = (config: {
  name: string;
  description?: string;
  numberOfItems: number;
  items: Array<{
    name: string;
    url: string;
    image?: string;
    price?: number;
    availability?: string;
    position: number;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": config.name,
  ...(config.description && { "description": config.description }),
  "numberOfItems": config.numberOfItems,
  "itemListElement": config.items.map(item => ({
    "@type": "ListItem",
    "position": item.position,
    "item": {
      "@type": "Product",
      "name": item.name,
      "url": `${window.location.origin}${item.url}`,
      ...(item.image && { "image": item.image }),
      ...(item.price && {
        "offers": {
          "@type": "Offer",
          "price": item.price,
          "priceCurrency": "INR",
          "availability": item.availability || "https://schema.org/InStock"
        }
      })
    }
  }))
});

// CollectionPage Schema for Category Landing Pages
export const generateCollectionPageSchema = (config: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  products: Array<{
    id: string;
    name: string;
    url: string;
    image?: string;
    price?: number;
    availability?: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": config.name,
  "description": config.description,
  "url": `${window.location.origin}${config.url}`,
  ...(config.breadcrumbs && { 
    "breadcrumb": generateBreadcrumbSchema(config.breadcrumbs)
  }),
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": config.products.length,
    "itemListElement": config.products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "url": `${window.location.origin}${product.url}`,
        ...(product.image && { "image": product.image }),
        ...(product.price && {
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "INR",
            "availability": product.availability || "https://schema.org/InStock"
          }
        })
      }
    }))
  }
});
