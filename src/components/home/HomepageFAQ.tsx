import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do you supply genuine automation spare parts?",
    answer:
      "Yes, we source only authentic products from trusted and verified channels. Every component we supply comes with proper documentation and warranty backing.",
  },
  {
    question: "Which industries do you serve?",
    answer:
      "We work with manufacturing, energy, infrastructure, process industries, and OEMs across India. Our solutions cater to diverse industrial automation needs.",
  },
  {
    question: "Can you support urgent or obsolete part requirements?",
    answer:
      "Yes, we specialize in fast sourcing and hard-to-find automation components. Our extensive network helps us locate critical parts quickly to minimize your downtime.",
  },
  {
    question: "Do you provide technical support?",
    answer:
      "Our team assists with product selection, compatibility, and application guidance. We understand industrial systems deeply and provide end-to-end support.",
  },
];

const HomepageFAQ = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Common questions about our automation solutions and services
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-background border rounded-lg px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
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

export default HomepageFAQ;
