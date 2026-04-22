import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface CategoryFAQProps {
  categoryName: string;
  categorySlug: string;
  faqs?: FAQ[] | null;
}

// Fallback FAQs by category type
const FALLBACK_FAQS: Record<string, FAQ[]> = {
  vfd: [
    {
      question: "What power ratings are available?",
      answer: "Our VFDs are available in various power ratings from 0.37kW to 630kW to suit different motor capacities and industrial applications. The right size depends on your motor specifications and application requirements."
    },
    {
      question: "Do these VFDs support multiple control modes?",
      answer: "Yes, most VFDs support multiple control modes including V/F control, sensorless vector control, and closed-loop vector control for different application requirements and precision needs."
    },
    {
      question: "What communication protocols are supported?",
      answer: "These VFDs typically support Modbus RTU, Modbus TCP, CANopen, and some models support Profibus and EtherCAT for industrial network integration with PLCs and SCADA systems."
    },
    {
      question: "Is technical support available after purchase?",
      answer: "Yes, we provide comprehensive technical support including phone support, email assistance, and remote troubleshooting for all our products. Our engineers can help with installation and commissioning."
    },
    {
      question: "Can I get bulk pricing for multiple units?",
      answer: "Yes, we offer competitive bulk pricing for orders of 5 units or more. Contact our sales team for a customized quotation based on your requirements."
    }
  ],
  plc: [
    {
      question: "How do I choose the right PLC for my application?",
      answer: "Consider factors like I/O count (with 20% expansion margin), processing speed requirements, communication protocols needed, and programming language support. Our engineers can help you select the right model."
    },
    {
      question: "Can I expand the I/O count later?",
      answer: "Yes, modular PLCs allow you to add expansion modules for additional digital and analog I/O points. Check the maximum module count supported by each CPU."
    },
    {
      question: "What programming software is required?",
      answer: "Each brand has its own programming environment. We can provide guidance on software requirements and licensing options for your selected PLC platform."
    },
    {
      question: "Do you provide programming support?",
      answer: "While we primarily supply hardware, our technical team can assist with basic configuration and troubleshooting. For complex programming projects, we can recommend qualified system integrators."
    },
    {
      question: "Are spare parts available for discontinued models?",
      answer: "We maintain stock of spare parts for many discontinued models. Contact us with your part number and we'll check availability and suggest alternatives if needed."
    }
  ],
  hmi: [
    {
      question: "What screen sizes are available?",
      answer: "We offer HMI panels ranging from 4\" compact displays to 21\"+ industrial monitors. The right size depends on viewing distance, information density, and mounting space."
    },
    {
      question: "Are these HMIs compatible with my PLC?",
      answer: "Most HMIs support multiple PLC brands through built-in drivers. Check the compatibility list or contact us with your PLC model for verification."
    },
    {
      question: "What is the IP rating for these panels?",
      answer: "Front panel ratings typically range from IP65 to IP67 for washdown and dusty environments. Rear ratings vary by model. Check specifications for your environmental requirements."
    },
    {
      question: "Do you provide configuration software?",
      answer: "Configuration software is typically provided by the HMI manufacturer. We can provide guidance on software downloads, licensing, and basic setup."
    },
    {
      question: "Can I transfer projects between different HMI sizes?",
      answer: "Within the same brand family, projects can often be transferred with automatic scaling. Cross-brand migration may require recreation of screens."
    }
  ],
  servo: [
    {
      question: "How do I size a servo motor for my application?",
      answer: "Calculate peak and continuous torque requirements, speed range, and inertia ratio. Our technical team can assist with motor selection based on your load parameters."
    },
    {
      question: "What's the difference between incremental and absolute encoders?",
      answer: "Incremental encoders require homing after power-up, while absolute encoders maintain position memory. Absolute encoders are preferred for applications requiring immediate position knowledge."
    },
    {
      question: "Are servo drives and motors sold separately?",
      answer: "Yes, drives and motors can be purchased separately, but they must be compatible. We can help match drives to motors or supply complete systems."
    },
    {
      question: "Do you offer tuning and commissioning support?",
      answer: "We provide technical guidance for basic tuning. For complex multi-axis systems, we can recommend qualified integrators for on-site commissioning."
    },
    {
      question: "What safety features are available?",
      answer: "Many servo drives include Safe Torque Off (STO) and other safety functions for machine safety compliance. Check specifications for SIL/PLd ratings."
    }
  ],
  default: [
    {
      question: "Are all products genuine and authorized?",
      answer: "Yes, all our products are sourced from authorized distributors and verified for authenticity. We provide documentation and warranties as applicable."
    },
    {
      question: "What is your delivery timeframe?",
      answer: "In-stock items ship within 1-2 business days. For out-of-stock items, we provide estimated delivery times based on supplier availability. Contact us for urgent requirements."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes, our technical team provides pre-sales consultation, product selection assistance, and post-sales support for installation and troubleshooting."
    },
    {
      question: "Can you source discontinued parts?",
      answer: "We maintain relationships with multiple suppliers and can often source discontinued parts. Contact us with your part number for availability check."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes, we offer competitive pricing for bulk orders. Contact our sales team for quotations on larger quantities or project requirements."
    }
  ]
};

export const CategoryFAQ = ({ categoryName, categorySlug, faqs }: CategoryFAQProps) => {
  // Determine which fallback to use based on category slug
  const getFallbackKey = (slug: string): string => {
    const lowerSlug = slug.toLowerCase();
    if (lowerSlug.includes('vfd') || lowerSlug.includes('drive') || lowerSlug.includes('inverter')) return 'vfd';
    if (lowerSlug.includes('plc') || lowerSlug.includes('controller')) return 'plc';
    if (lowerSlug.includes('hmi') || lowerSlug.includes('panel') || lowerSlug.includes('display')) return 'hmi';
    if (lowerSlug.includes('servo')) return 'servo';
    return 'default';
  };

  const fallbackKey = getFallbackKey(categorySlug);
  const displayFaqs = faqs && faqs.length > 0 
    ? faqs 
    : FALLBACK_FAQS[fallbackKey] || FALLBACK_FAQS.default;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Common questions about {categoryName}
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {displayFaqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-background rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
