import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "@/lib/seo";

const LEGACY_HOME_SRC = "/legacy-home/index.html";
const legacyRouteMap: Record<string, string> = {
  "shop/index.php": "/shop",
  "index.html": "/",
  "aboutus.html": "/about",
  "contactus.html": "/contactus.html",
  "contact.html": "/contact",
  "/contact": "/contactus.html",
  "sellus.html": "/sell-us",
  "faq.html": "/faq.html",
  "privacy.html": "/privacy",
  "terms.html": "/terms",
  "return_shipping.html": "/shipping",
  "payment_methods.html": "/shipping",
};

const Home = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [legacySrc] = useState(() => `${LEGACY_HOME_SRC}?v=20260423-2`);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupLegacyLinks: (() => void) | null = null;

    const wireLegacyLinks = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>("a[href]"));
        const listeners: Array<() => void> = [];

        anchors.forEach((anchor) => {
          const rawHref = anchor.getAttribute("href")?.trim();
          if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
            return;
          }

          const matchedEntry = Object.entries(legacyRouteMap).find(([legacyPath]) => rawHref.includes(legacyPath));
          if (!matchedEntry) {
            return;
          }

          const [, appRoute] = matchedEntry;
          const onClick = (event: MouseEvent) => {
            event.preventDefault();
            navigate(appRoute);
            window.scrollTo({ top: 0, behavior: "smooth" });
          };

          anchor.addEventListener("click", onClick);
          listeners.push(() => anchor.removeEventListener("click", onClick));
        });

        cleanupLegacyLinks = () => {
          listeners.forEach((dispose) => dispose());
        };
      } catch (error) {
        console.error("Unable to bridge legacy homepage links", error);
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
        title="Graven Automation - Fastest Growing Industrial Automation Company"
        description="Graven Automation, a leading industrial automation company in India, offers cutting-edge automation solutions globally. Enhance productivity with advanced technology and expertise."
        keywords="Graven Automation, industrial automation company, automation solutions, PLC, VFD, servo motors, industrial spare parts"
        canonical="/"
      />
      <StructuredData data={[generateOrganizationSchema(), generateLocalBusinessSchema()]} />

      <iframe
        ref={iframeRef}
        src={legacySrc}
        title="Graven Automation Homepage"
        scrolling="yes"
        className="block w-full"
        style={{ height: "100dvh", border: 0, overflow: "auto" }}
      />
    </div>
  );
};

export default Home;
