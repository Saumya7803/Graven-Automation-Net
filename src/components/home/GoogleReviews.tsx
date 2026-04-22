import { Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    name: "Rajesh Kumar",
    rating: 5,
    date: "2 weeks ago",
    text: "Excellent service and genuine Schneider products. Their technical team helped me choose the right VFD for my textile mill. Installation was smooth and professional.",
    verified: true,
  },
  {
    name: "Priya Sharma",
    rating: 5,
    date: "1 month ago",
    text: "Best prices in the market! Ordered ATV320 for our water pumping station. Fast delivery and great after-sales support.",
    verified: true,
  },
  {
    name: "Mohammed Ali",
    rating: 4,
    date: "3 weeks ago",
    text: "Good experience overall. Product quality is top-notch. Delivery took slightly longer than expected but customer service kept me informed.",
    verified: true,
  },
];

export const GoogleReviews = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Rating */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold">Google Reviews</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl font-bold">4.8</span>
              <div className="flex flex-col items-start">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Based on 500+ reviews</span>
              </div>
            </div>

            <Button asChild variant="outline" className="gap-2">
              <a
                href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
                target="_blank"
                rel="noopener noreferrer"
              >
                Write a Review
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground">{review.date}</div>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.text}
                </p>

                {review.verified && (
                  <div className="mt-3 text-xs text-primary">✓ Verified purchase</div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="ghost">
              <a
                href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                See all reviews on Google
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
