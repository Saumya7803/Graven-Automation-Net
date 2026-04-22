import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const ShopFinalCTA = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
          Looking for a Specific Automation Part?
        </h2>
        <Button asChild size="lg" variant="secondary" className="font-semibold">
          <Link to="/contact">
            <FileText className="mr-2 h-5 w-5" />
            Request a Quote Now
          </Link>
        </Button>
      </div>
    </section>
  );
};
