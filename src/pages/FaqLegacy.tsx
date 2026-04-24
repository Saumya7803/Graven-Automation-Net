import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SEOHead from "@/components/SEO/SEOHead";

const LEGACY_FAQ_SRC = "/legacy-home/faq.html";

const legacyRouteMap: Record<string, string> = {
  "shop/index.php": "/shop",
  "index.html": "/",
  "aboutus.html": "/about",
  "contactus.html": "/contactus.html",
  "contact.html": "/contact",
  "/contact": "/contactus.html",
  "sellus.html": "/sell-us",
  "#aboutus": "/about",
  "#service-sec": "/shop",
  "#faq-sec": "/faq.html",
  "#contact-sec": "/contactus.html",
  "faq.html": "/faq.html",
  "privacy.html": "/privacy",
  "terms.html": "/terms",
  "return_shipping.html": "/shipping",
  "payment_methods.html": "/shipping",
};

const FaqLegacy = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [legacySrc] = useState(() => `${LEGACY_FAQ_SRC}?v=20260424-1`);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupLegacyLinks: (() => void) | null = null;

    const wireLegacyLinks = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const onDocumentClick = (event: MouseEvent) => {
          const target = event.target as Element | null;
          const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
          if (!anchor) return;

          const rawHref = anchor.getAttribute("href")?.trim();
          if (!rawHref || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
            return;
          }

          const matchedEntry = Object.entries(legacyRouteMap).find(([legacyPath]) => rawHref.includes(legacyPath));
          if (!matchedEntry) {
            return;
          }

          const [, appRoute] = matchedEntry;
          event.preventDefault();
          event.stopPropagation();
          navigate(appRoute);
          window.scrollTo({ top: 0, behavior: "smooth" });
        };

        doc.addEventListener("click", onDocumentClick, true);

        cleanupLegacyLinks = () => {
          doc.removeEventListener("click", onDocumentClick, true);
        };
      } catch (error) {
        console.error("Unable to bridge legacy FAQ links", error);
      }
    };

    const handleLoad = () => {
      wireLegacyLinks();
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      cleanupLegacyLinks?.();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="FAQs | Graven Automation"
        description="Frequently asked questions about Graven Automation products and services."
        canonical="/faq.html"
      />

      <iframe
        ref={iframeRef}
        src={legacySrc}
        title="FAQs"
        scrolling="yes"
        className="block w-full"
        style={{ height: "100dvh", border: 0, overflow: "auto" }}
      />
    </div>
  );
};

export default FaqLegacy;
