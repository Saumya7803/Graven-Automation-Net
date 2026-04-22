import { Helmet } from "react-helmet-async";
import { SEOConfig, defaultSEO } from "@/lib/seo";

interface SEOHeadProps extends Partial<SEOConfig> {
  dateModified?: string;
  datePublished?: string;
  author?: string;
}

const SEOHead = ({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  canonical,
  ogImage = defaultSEO.ogImage,
  ogType = defaultSEO.ogType,
  dateModified,
  datePublished,
  author,
}: SEOHeadProps) => {
  const fullCanonical = canonical ? `${window.location.origin}${canonical}` : window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Schneider Electric ATV/VFD Solutions" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content={author || "Schneider Electric ATV/VFD Solutions"} />
      {dateModified && <meta property="article:modified_time" content={dateModified} />}
      {datePublished && <meta property="article:published_time" content={datePublished} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Locale and Language */}
      <link rel="alternate" hrefLang="en-IN" href={fullCanonical} />
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />
      <meta property="og:locale" content="en_IN" />
      
      {/* Geographic Meta Tags */}
      <meta name="geo.region" content="IN-DL" />
      <meta name="geo.placename" content="Delhi" />
      <meta name="geo.position" content="28.6517;77.1389" />
      <meta name="ICBM" content="28.6517, 77.1389" />
    </Helmet>
  );
};

export default SEOHead;
