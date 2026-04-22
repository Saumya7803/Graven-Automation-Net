import { Helmet } from "react-helmet-async";

interface SpeakableSchemaProps {
  cssSelector?: string[];
  xpath?: string[];
}

export const SpeakableSchema = ({ cssSelector, xpath }: SpeakableSchemaProps) => {
  if (!cssSelector && !xpath) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      ...(cssSelector && { cssSelector }),
      ...(xpath && { xpath }),
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
