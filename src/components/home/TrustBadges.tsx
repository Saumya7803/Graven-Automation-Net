import { Shield, Award, Headphones, Users, Star, Clock } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "100% Genuine",
    description: "Certified Original Products",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Clock,
    title: "12-Month Warranty",
    description: "Extended warranty available",
    color: "text-green-600 dark:text-green-400",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert technical assistance",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Star,
    title: "4.8★ Rating",
    description: "500+ Google Reviews",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: Users,
    title: "5000+ Clients",
    description: "Trusted across India",
    color: "text-orange-600 dark:text-orange-400",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Why Choose Us?</h2>
          <p className="text-muted-foreground">
            Your trusted partner for premium VFD solutions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-3 p-3 rounded-full bg-muted">
                  <Icon className={`h-6 w-6 ${badge.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
