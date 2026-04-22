import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "@/lib/seo";

const LEGACY_HOME_SRC = "/legacy-home/index.html";

const legacyRouteMap: Record<string, string> = {
  "index.html": "/",
  "aboutus.html": "/about",
  "contactus.html": "/contact",
  "contact.html": "/contact",
  "faq.html": "/faq",
  "privacy.html": "/privacy",
  "terms.html": "/terms",
  "return_shipping.html": "/shipping",
  "payment_methods.html": "/shipping",
  "shop/index.php": "/shop",
};

const Home = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameHeight, setFrameHeight] = useState(1800);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.setAttribute("scrolling", "no");
    iframe.style.overflow = "hidden";

    let resizeObserver: ResizeObserver | null = null;
    let intervalId: number | null = null;
    let cleanupLegacyLinks: (() => void) | null = null;

    const disableLegacyFrameScrolling = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        if (doc.documentElement) {
          doc.documentElement.style.overflow = "hidden";
        }

        if (doc.body) {
          doc.body.style.overflow = "hidden";
        }
      } catch (error) {
        console.error("Unable to disable legacy iframe scrolling", error);
      }
    };

    const removeLegacyPreloader = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const preloaderElements = doc.querySelectorAll<HTMLElement>("#preloader, #loader, .preloader, .th-preloader");
        preloaderElements.forEach((element) => {
          element.style.display = "none";
          element.remove();
        });
      } catch (error) {
        console.error("Unable to remove legacy preloader", error);
      }
    };

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const bodyHeight = doc.body?.scrollHeight ?? 0;
        const docHeight = doc.documentElement?.scrollHeight ?? 0;
        const nextHeight = Math.max(bodyHeight, docHeight, 1200);

        setFrameHeight((current) => (Math.abs(current - nextHeight) > 4 ? nextHeight : current));
      } catch (error) {
        console.error("Unable to measure legacy homepage height", error);
      }
    };

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
      removeLegacyPreloader();
      disableLegacyFrameScrolling();
      updateHeight();
      wireLegacyLinks();

      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        resizeObserver = new ResizeObserver(() => updateHeight());

        if (doc.body) resizeObserver.observe(doc.body);
        if (doc.documentElement) resizeObserver.observe(doc.documentElement);
      } catch (error) {
        console.error("Unable to observe legacy homepage size", error);
      }

      intervalId = window.setInterval(updateHeight, 750);
      window.setTimeout(() => {
        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
      }, 12000);
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      cleanupLegacyLinks?.();
      resizeObserver?.disconnect();
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

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
        src={LEGACY_HOME_SRC}
        title="Graven Automation Homepage"
        scrolling="no"
        className="block w-full"
        style={{ height: `${frameHeight}px`, border: 0, overflow: "hidden" }}
      />
    </div>
  );
};

export default Home;
