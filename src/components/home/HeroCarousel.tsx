import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-industrial.jpg";
import { CallbackRequestDialog } from "@/components/location/CallbackRequestDialog";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { generateHeroAlt } from "@/lib/imageAltTags";

const slides = [
  {
    image: heroImage,
    title: "Premium ATV & VFD Solutions",
    subtitle: "Industrial Excellence",
    description: "Discover our comprehensive range of Variable Frequency Drives engineered for precision, efficiency, and reliability in demanding industrial applications.",
    primaryCta: { text: "Call Now", action: "call" },
    secondaryCta: { text: "Request Quote", action: "dialog" },
  },
  {
    image: heroImage,
    badge: "Industry Leading Technology",
    title: "Smart Automation",
    subtitle: "For Modern Industry",
    description: "Transform your operations with intelligent drive systems that optimize energy consumption and maximize productivity across all industrial applications.",
    primaryCta: { text: "View Solutions", to: "/shop" },
    secondaryCta: { text: "Get Consultation", to: "/contact" },
  },
  {
    image: heroImage,
    badge: "24/7 Technical Support",
    title: "Reliable Performance",
    subtitle: "Every Time",
    description: "Experience unmatched reliability with our premium VFD solutions backed by comprehensive support and expert technical guidance.",
    primaryCta: { text: "Browse Catalog", to: "/shop" },
    secondaryCta: { text: "Talk to Expert", to: "/contact" },
  },
];

const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="embla w-full" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 relative">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <OptimizedImage
                  src={slide.image}
                  alt={generateHeroAlt({
                    title: slide.title,
                    subtitle: slide.subtitle,
                    description: slide.description
                  })}
                  width={1920}
                  height={1080}
                  priority={index === 0}
                  sizes="100vw"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
              </div>

              {/* Content */}
              <div className="container mx-auto px-4 relative z-10 min-h-[80vh] flex items-center">
                <div className="max-w-3xl py-20">
                  {slide.badge && (
                    <div className="inline-block mb-6 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
                      <span className="text-sm font-semibold text-primary">{slide.badge}</span>
                    </div>
                  )}

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight animate-fade-in">
                    {slide.title}
                    <span className="text-primary block mt-2">{slide.subtitle}</span>
                  </h1>

                  <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl animate-fade-in">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                    {/* Primary CTA */}
                    {slide.primaryCta.action === "call" ? (
                      <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg">
                        <a href="tel:+917905350134">
                          <Phone className="mr-2 h-6 w-6" />
                          {slide.primaryCta.text}
                        </a>
                      </Button>
                    ) : (
                      <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg">
                        <Link to={slide.primaryCta.to}>
                          {slide.primaryCta.text}
                          <ArrowRight className="ml-2 h-6 w-6" />
                        </Link>
                      </Button>
                    )}
                    
                    {/* Secondary CTA */}
                    {slide.secondaryCta.action === "dialog" ? (
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-2 text-lg px-8 py-6"
                        onClick={() => setShowCallbackDialog(true)}
                      >
                        <FileText className="mr-2 h-6 w-6" />
                        {slide.secondaryCta.text}
                      </Button>
                    ) : (
                      <Button asChild size="lg" variant="outline" className="border-2 text-lg px-8 py-6">
                        <Link to={slide.secondaryCta.to}>
                          <FileText className="mr-2 h-6 w-6" />
                          {slide.secondaryCta.text}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border border-border p-3 rounded-full transition-all hover:scale-110 hidden md:block"
        aria-label="Previous slide - View previous product showcase"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border border-border p-3 rounded-full transition-all hover:scale-110 hidden md:block"
        aria-label="Next slide - View next product showcase"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === selectedIndex
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Callback Dialog */}
      <CallbackRequestDialog
        open={showCallbackDialog}
        onOpenChange={setShowCallbackDialog}
        locationPage="Homepage"
        source="hero_carousel"
      />
    </section>
  );
};

export default HeroCarousel;
