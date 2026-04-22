const PartnersSection = () => {
  const brands = [
    "Schneider Electric",
    "Siemens",
    "ABB",
    "Rockwell Automation",
    "Mitsubishi Electric",
    "Omron",
    "Delta",
    "Eaton",
    "Danfoss",
    "Yaskawa",
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted <span className="text-primary">Automation Brands</span> We Supply
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We work with globally recognized automation brands to ensure quality, 
            compatibility, and reliability.
          </p>
        </div>

        {/* Brands Ticker */}
        <div className="overflow-hidden bg-muted/30 rounded-xl py-8">
          <div className="flex animate-scroll">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-8 md:px-12 flex items-center justify-center"
              >
                <span className="text-lg md:text-xl font-semibold text-muted-foreground/70 hover:text-primary transition-colors whitespace-nowrap">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          width: fit-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnersSection;
