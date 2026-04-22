import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Twitter, Globe } from "lucide-react";

interface Author {
  id: string;
  name: string;
  bio?: string;
  title?: string;
  expertise?: string[];
  image_url?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface AuthorBioProps {
  author: Author;
  showFullBio?: boolean;
}

export const AuthorBio = ({ author, showFullBio = true }: AuthorBioProps) => {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={author.image_url} alt={author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {author.name}
              </h3>
              {author.title && (
                <p className="text-sm text-muted-foreground">{author.title}</p>
              )}
            </div>

            {showFullBio && author.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {author.bio}
              </p>
            )}

            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {author.expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {author.social_links && (
              <div className="flex gap-3 pt-2">
                {author.social_links.linkedin && (
                  <a
                    href={author.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {author.social_links.twitter && (
                  <a
                    href={author.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {author.social_links.website && (
                  <a
                    href={author.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
