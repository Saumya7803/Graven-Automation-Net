import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const HelpCTA = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Not Sure Which Product You Need?
          </h2>
          <p className="text-muted-foreground mb-6">
            Share your application or part requirement and our experts will help you identify the right solution.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/contact">
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to Our Technical Team
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
