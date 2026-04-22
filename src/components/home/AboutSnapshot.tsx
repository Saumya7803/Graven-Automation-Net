import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutSnapshot = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Heading */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Who <span className="text-primary">We Are</span>
          </h2>

          {/* Body Content */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            Graven Automation is an industrial automation solutions provider 
            specializing in sourcing and supplying authentic automation spare parts, 
            drives, PLCs, motors, sensors, and control equipment. We work closely 
            with industries to minimize downtime, improve efficiency, and ensure 
            uninterrupted operations.
          </p>

          {/* CTA Link */}
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/about">
              Learn More About Graven Automation
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutSnapshot;
