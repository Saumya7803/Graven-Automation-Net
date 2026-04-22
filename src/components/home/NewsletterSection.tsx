import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const interestOptions = [
    { id: "product_updates", label: "New Product Launches" },
    { id: "technical_articles", label: "Technical Articles & Guides" },
    { id: "case_studies", label: "Case Studies & Success Stories" },
    { id: "promotions", label: "Exclusive Promotions & Offers" },
  ];

  const handleInterestToggle = (interestId: string) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: email.toLowerCase().trim(),
        full_name: fullName.trim() || null,
        company_name: companyName.trim() || null,
        interests: interests,
        source: "homepage",
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail("");
        setFullName("");
        setCompanyName("");
        setInterests([]);
        
        toast({
          title: "Successfully Subscribed!",
          description: "Thank you for subscribing. Check your inbox for updates.",
        });

        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            {isSuccess ? (
              <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-400" />
            ) : (
              <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
            )}
            <h2 className="text-3xl font-bold mb-4">
              {isSuccess ? "You're All Set!" : "Stay Updated with Industry Insights"}
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              {isSuccess
                ? "We'll keep you informed with the latest updates"
                : "Get latest product updates, technical articles, and exclusive offers"}
            </p>
          </div>

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Your email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-foreground"
                  disabled={isSubmitting}
                />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white text-foreground"
                  disabled={isSubmitting}
                />
              </div>

              <Input
                type="text"
                placeholder="Company name (optional)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-white text-foreground"
                disabled={isSubmitting}
              />

              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium mb-2">I'm interested in:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {interestOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={interests.includes(option.id)}
                        onCheckedChange={() => handleInterestToggle(option.id)}
                        className="bg-white border-white data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor={option.id}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
              </Button>
            </form>
          )}

          <p className="text-sm mt-4 text-center text-primary-foreground/60">
            Join <span className="font-semibold text-primary-foreground">5,000+ subscribers</span>. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
