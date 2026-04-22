import { Award, Users, Package, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsSectionProps {
  yearsExperience: number;
  happyCustomers: number;
  productsInStock: number;
  citiesCovered: number;
}

export const StatsSection = ({
  yearsExperience,
  happyCustomers,
  productsInStock,
  citiesCovered,
}: StatsSectionProps) => {
  const stats = [
    {
      icon: Award,
      value: yearsExperience,
      label: "Years Experience",
      suffix: "+",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      value: happyCustomers,
      label: "Happy Customers",
      suffix: "+",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Package,
      value: productsInStock,
      label: "Products in Stock",
      suffix: "+",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: MapPin,
      value: citiesCovered,
      label: "Cities Covered",
      suffix: "+",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  suffix: string;
  color: string;
  delay: number;
}

const StatCard = ({ icon: Icon, value, label, suffix, color, delay }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`stat-${label}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [label]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 50;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      id={`stat-${label}`}
      className="group relative bg-card rounded-2xl p-6 shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
      
      {/* Icon */}
      <div className={`relative w-12 h-12 mb-4 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Value */}
      <div className="relative text-3xl md:text-4xl font-bold text-foreground mb-2">
        {count.toLocaleString()}{suffix}
      </div>

      {/* Label */}
      <div className="relative text-sm text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
};
