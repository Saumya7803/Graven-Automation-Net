import { Helmet } from "react-helmet-async";

interface Author {
  name: string;
  bio?: string;
  title?: string;
  image_url?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface AuthorSchemaProps {
  author: Author;
}

export const AuthorSchema = ({ author }: AuthorSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    ...(author.bio && { description: author.bio }),
    ...(author.title && { jobTitle: author.title }),
    ...(author.image_url && { image: author.image_url }),
    ...(author.social_links && {
      sameAs: Object.values(author.social_links).filter(Boolean),
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
