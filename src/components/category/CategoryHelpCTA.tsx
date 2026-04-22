import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryHelpCTAProps {
  categoryName: string;
}

export const CategoryHelpCTA = ({ categoryName }: CategoryHelpCTAProps) => {
  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Not sure which {categoryName} suits your application?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our engineers can help you select the right model based on your technical requirements, 
            application conditions, and budget. Get expert advice at no cost.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="/contact">
                <MessageCircle className="mr-2 h-5 w-5" />
                Talk to an Expert
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="tel:+918000000000">
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Response within 24 hours • Free technical consultation • Pan-India support
          </p>
        </div>
      </div>
    </section>
  );
};
