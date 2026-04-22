import { useEffect, useRef, useState } from "react";
import { Package, Globe, Award, Users } from "lucide-react";

const stats = [
  {
    icon: Package,
    value: 1,
    displayValue: "1M",
    suffix: "+",
    label: "Products Available",
    description: "Massive industrial catalog",
  },
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Clients Served Worldwide",
    description: "Trusted globally",
  },
  {
    icon: Award,
    value: 15,
    suffix: "+",
    label: "Years of Industry Excellence",
    description: "Proven expertise",
  },
  {
    icon: Globe,
    value: 50,
    suffix: "+",
    label: "Countries Served",
    description: "Global footprint",
  },
];

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-y"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-primary">Industry Leaders</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Delivering excellence in industrial automation since inception
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group"
                style={{
                  animation: isVisible
                    ? `fade-in 0.6s ease-out ${index * 0.15}s both`
                    : "none",
                }}
              >
                {/* Icon */}
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all mb-4 group-hover:scale-110">
                  <Icon className="h-10 w-10 text-primary" />
                </div>

                {/* Counter */}
                <div className="mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    displayValue={(stat as any).displayValue}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                    delay={index * 150}
                  />
                </div>

                {/* Label */}
                <h3 className="text-xl font-bold mb-1">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface AnimatedCounterProps {
  value: number;
  displayValue?: string;
  suffix: string;
  isVisible: boolean;
  delay: number;
}

const AnimatedCounter = ({ value, displayValue, suffix, isVisible, delay }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          setShowFinal(true);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, value, delay]);

  return (
    <div className="text-5xl md:text-6xl font-bold text-primary">
      {displayValue && showFinal ? displayValue : count}
      <span className="text-4xl md:text-5xl">{suffix}</span>
    </div>
  );
};

export default StatsSection;
