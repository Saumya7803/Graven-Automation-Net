import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className,
  ...props
}: OptimizedImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate WebP path by replacing extension
  const getWebPSrc = (originalSrc: string): string => {
    // If it's already a WebP or external URL, return as-is
    if (originalSrc.includes('.webp') || originalSrc.startsWith('http')) {
      return originalSrc;
    }
    // Replace .jpg, .jpeg, .png with .webp
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string): string => {
    const webpSrc = getWebPSrc(baseSrc);
    const widths = [480, 768, 1024, 1280, 1920];
    
    // For external URLs or if already has size suffix, return single source
    if (baseSrc.startsWith('http') || baseSrc.match(/-\d+w\./)) {
      return webpSrc;
    }

    // Generate srcset with multiple resolutions
    const srcset = widths
      .map(width => {
        const resizedSrc = webpSrc.replace(/(\.[^.]+)$/, `-${width}w$1`);
        return `${resizedSrc} ${width}w`;
      })
      .join(', ');

    return srcset;
  };

  const webpSrc = getWebPSrc(src);
  const srcSet = generateSrcSet(src);

  return (
    <picture>
      {/* WebP source with srcset for modern browsers */}
      {!hasError && (
        <source
          type="image/webp"
          srcSet={srcSet}
          sizes={sizes}
        />
      )}
      
      {/* Fallback to original format */}
      <img
        src={hasError ? src : webpSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => {
          // Fallback to original image if WebP fails
          if (!hasError) {
            setHasError(true);
          }
        }}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </picture>
  );
};
