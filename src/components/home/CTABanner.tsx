import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CTAAction {
  text: string;
  to: string;
  icon?: ReactNode;
  external?: boolean;
}

interface CTABannerProps {
  variant?: "primary" | "secondary" | "gradient";
  title: string;
  description: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
  backgroundImage?: string;
  icon?: ReactNode;
}

const CTABanner = ({
  variant = "primary",
  title,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  icon,
}: CTABannerProps) => {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-background border-2 border-primary",
    gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
  };

  const buttonVariant = variant === "secondary" ? "default" : "light";
  const secondaryButtonVariant = variant === "secondary" ? "outline" : "outline-light";

  const ActionButton = ({ action, isPrimary = false }: { action: CTAAction; isPrimary?: boolean }) => {
    const buttonContent = (
      <>
        {action.text}
        {action.icon && <span className="ml-2">{action.icon}</span>}
      </>
    );

    if (action.external) {
      return (
        <Button asChild variant={isPrimary ? buttonVariant : secondaryButtonVariant} size="lg">
          <a href={action.to} target="_blank" rel="noopener noreferrer">
            {buttonContent}
          </a>
        </Button>
      );
    }

    return (
      <Button asChild variant={isPrimary ? buttonVariant : secondaryButtonVariant} size="lg">
        <Link to={action.to}>{buttonContent}</Link>
      </Button>
    );
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="container mx-auto px-4 relative z-10">
        <div className={cn("rounded-2xl p-12 shadow-lg", variantStyles[variant])}>
          <div className="max-w-4xl mx-auto text-center">
            {icon && (
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">{description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ActionButton action={primaryAction} isPrimary />
              {secondaryAction && <ActionButton action={secondaryAction} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
