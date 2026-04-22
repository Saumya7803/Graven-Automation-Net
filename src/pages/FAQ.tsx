import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Product Selection",
    questions: [
      {
        question: "What is a Variable Frequency Drive (VFD)?",
        answer: "A Variable Frequency Drive (VFD) is an electronic device that controls the speed and torque of AC motors by varying the frequency and voltage supplied to the motor. VFDs help optimize energy consumption, reduce mechanical stress, and provide precise motor control in industrial applications.",
      },
      {
        question: "How do I select the right VFD for my motor?",
        answer: "To select the right VFD, consider: 1) Motor power rating (kW or HP), 2) Voltage requirements (230V, 400V, etc.), 3) Current rating, 4) Application type (pump, fan, conveyor), 5) Control requirements (simple or advanced), 6) Environmental conditions (IP rating). Our experts can help you choose - contact us for personalized guidance.",
      },
      {
        question: "What's the difference between ATV12, ATV320, and ATV630 series?",
        answer: "ATV12 is designed for simple applications with basic control. ATV320 offers advanced features like built-in Modbus and Ethernet for connected applications. ATV630 is our premium series with superior performance, multiple communication protocols, and advanced motor control for demanding industrial processes.",
      },
      {
        question: "Can VFDs work with single-phase power supply?",
        answer: "Some VFDs can accept single-phase input power, but they typically output three-phase power to the motor. Check the specific model specifications. Many compact drives like ATV12 and ATV320 support single-phase input for motors up to 3-5 HP.",
      },
    ],
  },
  {
    category: "Installation & Setup",
    questions: [
      {
        question: "Do you offer installation services?",
        answer: "Yes, we provide professional installation services through our certified technicians across major cities in India. We also offer remote commissioning support and comprehensive installation guides with each VFD. Contact us for installation quotes.",
      },
      {
        question: "What electrical protection is required for VFD installation?",
        answer: "VFD installations require: 1) Input circuit breaker or fused disconnect, 2) Proper grounding per local codes, 3) Line reactors or filters for long cable runs, 4) Surge protection devices, 5) Proper ventilation and cooling. Always follow NEC/IEC standards and manufacturer guidelines.",
      },
      {
        question: "Can I install a VFD myself?",
        answer: "While technically skilled persons can install VFDs following the manual, we strongly recommend professional installation by qualified electricians familiar with VFD technology. Improper installation can void warranty, damage equipment, and create safety hazards.",
      },
    ],
  },
  {
    category: "Performance & Energy Savings",
    questions: [
      {
        question: "How can VFDs save energy costs?",
        answer: "VFDs save energy by: 1) Matching motor speed to actual load requirements rather than running at full speed, 2) Reducing mechanical stress and maintenance, 3) Soft-starting motors to reduce inrush current, 4) Optimizing pump and fan applications with cubic law energy savings. Typical savings range from 20-50% depending on the application.",
      },
      {
        question: "What industries use VFDs most?",
        answer: "VFDs are essential in: Manufacturing (conveyors, machine tools), HVAC (air handling, chillers), Water/Wastewater (pumps, blowers), Mining (crushers, conveyors), Oil & Gas (pumps, compressors), Textile (spindles, winders), Food & Beverage (mixers, packaging), and many more industrial applications.",
      },
      {
        question: "Will a VFD improve my power factor?",
        answer: "Yes, VFDs can improve power factor to near unity (0.95-0.98) when properly configured. However, VFDs can also introduce harmonic distortion. We recommend harmonic filters or active front-end drives for sensitive applications or to meet power quality standards.",
      },
    ],
  },
  {
    category: "Troubleshooting & Maintenance",
    questions: [
      {
        question: "How do I troubleshoot common VFD errors?",
        answer: "Common VFD faults and solutions: 1) Overcurrent - Check for motor overload, short circuits, or incorrect parameters, 2) Overvoltage - Check DC bus, regenerative braking, 3) Overtemperature - Improve cooling, clean filters, 4) Ground fault - Check motor and cable insulation. Always refer to the specific drive's manual for fault codes and troubleshooting procedures.",
      },
      {
        question: "What maintenance does a VFD require?",
        answer: "Regular VFD maintenance includes: 1) Clean cooling fans and filters monthly, 2) Check all connections quarterly, 3) Inspect capacitors annually, 4) Monitor temperature and vibration, 5) Update firmware as needed, 6) Keep environment clean and dry. Preventive maintenance extends VFD lifespan from 5-7 years to 10-15 years.",
      },
      {
        question: "How long do VFDs typically last?",
        answer: "With proper maintenance, VFDs typically last 10-15 years. Key factors affecting lifespan: ambient temperature, humidity, load cycling, and maintenance quality. Electrolytic capacitors are usually the first components requiring replacement after 5-7 years in harsh environments.",
      },
    ],
  },
  {
    category: "Ordering & Support",
    questions: [
      {
        question: "What warranty do you provide?",
        answer: "All Schneider Electric VFDs come with a standard 12-month manufacturer warranty covering defects in materials and workmanship. Extended warranty options are available. We also offer comprehensive AMC (Annual Maintenance Contract) plans for worry-free operation.",
      },
      {
        question: "How long does delivery take?",
        answer: "For in-stock items: 2-3 business days for major cities, 5-7 days for remote locations. For special orders or custom configurations: 2-4 weeks depending on model and quantity. Expedited shipping available. Check product pages for current stock status.",
      },
      {
        question: "Do you provide technical support after purchase?",
        answer: "Yes! We offer: 1) Free lifetime technical support via phone/email/WhatsApp, 2) Remote commissioning assistance, 3) On-site support (charged), 4) Training programs for maintenance teams, 5) Firmware updates and parameter optimization. Our expert team is available Mon-Fri 8 AM-6 PM, Sat 9 AM-2 PM.",
      },
      {
        question: "Can I return or exchange a VFD?",
        answer: "Yes, unused VFDs in original packaging can be returned within 15 days of delivery with a 10% restocking fee. Custom-configured or programmed drives may not be returnable. Defective units are replaced under warranty at no cost. Contact our support team to initiate returns.",
      },
    ],
  },
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  const allQuestions = faqs.flatMap((cat) => cat.questions);
  const faqSchema = generateFAQSchema(allQuestions);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="VFD FAQs - Variable Frequency Drive Questions Answered | Schneider Electric"
        description="Get answers to common questions about Variable Frequency Drives. Learn about VFD selection, installation, energy savings, troubleshooting, and technical support."
        keywords="VFD FAQ, variable frequency drive questions, VFD installation, VFD troubleshooting, VFD energy savings, ATV selection guide"
        canonical="/faq"
      />
      <StructuredData
        data={[
          faqSchema,
          generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "FAQ", url: "/faq" },
          ]),
        ]}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              Find answers to common questions about Variable Frequency Drives, installation, maintenance, and our services.
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No questions found matching "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredFaqs.map((category, idx) => (
                  <div key={idx}>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {category.category}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((faq, qIdx) => (
                        <AccordionItem
                          key={qIdx}
                          value={`${idx}-${qIdx}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="text-base font-semibold">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our expert team is ready to help you with personalized guidance for your VFD needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="https://wa.me/917905350134"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-11 px-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
