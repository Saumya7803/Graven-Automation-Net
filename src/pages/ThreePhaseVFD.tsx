import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap, Factory, Award } from "lucide-react";

const ThreePhaseVFD = () => {
  const faqs = [
    {
      question: "What is the advantage of 3-phase VFD over single phase?",
      answer: "Three-phase VFDs offer 5-10% higher efficiency, support motors from 1 HP to 500+ HP, provide smoother power delivery, and are essential for industrial applications. They eliminate motor derating and handle heavy-duty continuous operation."
    },
    {
      question: "Can I use 3-phase VFD with single phase input?",
      answer: "Yes, some 3-phase VFDs accept single-phase input (called 'single to three-phase' VFDs), but they're limited to 3-5 HP. For motors above 5 HP, true three-phase input is mandatory for reliability and efficiency."
    },
    {
      question: "What voltage is required for 3-phase VFD in India?",
      answer: "Indian 3-phase VFDs use 380V-415V, 50Hz supply. Standard is 415V ±10%. Low voltage models (up to 10 HP) use 380V-480V input, while high voltage models (above 150 HP) may use 660V or 11kV with transformers."
    },
    {
      question: "Which 3-phase VFD series is best for industry?",
      answer: "For general industry: ATV320 (1-15 HP), ATV340 (15-75 HP). For heavy duty: ATV630/930 (up to 500 HP). For process control: ATV600 series. For crane/hoisting: ATV340 with brake chopper. Choice depends on application demands."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="3 Phase VFD India | Three Phase Variable Frequency Drive | Industrial Motor Control"
        description="Complete guide to three-phase VFD in India for 1 HP to 500 HP industrial motors. Schneider ATV320, ATV340, ATV630, ATV930 series. 380V-415V drives with technical specs, applications & pricing for manufacturing, process & heavy industry."
        keywords="3 phase VFD, three phase VFD, industrial VFD, 415V VFD, ATV320, ATV630, ATV930, heavy duty VFD, process control drive, factory automation"
        canonical="/3-phase-vfd"
      />
      <StructuredData 
        data={[
          generateArticleSchema({
            title: "Three Phase VFD Complete Guide for Indian Industry",
            description: "Everything about three-phase Variable Frequency Drives for industrial applications",
            author: "Schneider Electric VFD Experts",
            publishedDate: "2024-01-01",
            modifiedDate: new Date().toISOString(),
            image: "/company-logo.png"
          }),
          generateFAQSchema(faqs),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Buying Guides', url: '/vfd-price-guide' },
            { name: 'Three Phase VFD', url: '/3-phase-vfd' }
          ])
        ]} 
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Industrial Solutions</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                3 Phase VFD India: Industrial Motor Control from 1 HP to 500 HP
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Complete range of three-phase Variable Frequency Drives for Indian industry. Schneider Electric ATV series for manufacturing, process control, and heavy-duty applications with 380V-415V, 50Hz input.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/shop?phase=three">
                    View 3-Phase VFDs <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/single-phase-vfd">Compare with Single Phase</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Advantages */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Why 3-Phase VFD for Industrial Applications?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Factory className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Industrial Power</h3>
                  <p className="text-muted-foreground">
                    Support motors from 1 HP to 500+ HP. Handle continuous heavy-duty operation with superior thermal management and reliability.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Maximum Efficiency</h3>
                  <p className="text-muted-foreground">
                    5-10% higher efficiency than single phase. Balanced three-phase power delivery reduces losses and extends motor life.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Motor Derating</h3>
                  <p className="text-muted-foreground">
                    Full motor power utilization. No 20-30% derating required. Get complete nameplate performance from your motors.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Product Range */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Schneider 3-Phase VFD Series</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Badge className="w-fit mb-2">Entry Level</Badge>
                  <CardTitle className="text-lg">ATV320 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold text-primary">1-15 HP</p>
                  <p className="text-sm text-muted-foreground">₹15,000 - ₹80,000</p>
                  <ul className="space-y-1 text-sm">
                    {["Compact design", "Ethernet ready", "Advanced display", "Energy savings"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to="/shop?series=ATV320">View Models</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge className="w-fit mb-2">Mid Range</Badge>
                  <CardTitle className="text-lg">ATV340 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold text-primary">15-75 HP</p>
                  <p className="text-sm text-muted-foreground">₹80,000 - ₹3,50,000</p>
                  <ul className="space-y-1 text-sm">
                    {["Heavy duty", "Advanced control", "Brake chopper", "Multiple apps"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to="/shop?series=ATV340">View Models</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge className="w-fit mb-2">High Power</Badge>
                  <CardTitle className="text-lg">ATV630 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold text-primary">75-200 HP</p>
                  <p className="text-sm text-muted-foreground">₹3,50,000 - ₹12,00,000</p>
                  <ul className="space-y-1 text-sm">
                    {["Process control", "Book-open design", "Modular options", "IIoT ready"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to="/shop?series=ATV630">View Models</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge className="w-fit mb-2">Ultra Power</Badge>
                  <CardTitle className="text-lg">ATV930 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold text-primary">200-500 HP</p>
                  <p className="text-sm text-muted-foreground">₹12,00,000+</p>
                  <ul className="space-y-1 text-sm">
                    {["Mission critical", "Redundant design", "Predictive maint.", "Global support"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to="/shop?series=ATV930">View Models</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">3-Phase VFD Technical Specifications</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Parameter</th>
                        <th className="text-left p-3 font-semibold">Light Duty (≤15 HP)</th>
                        <th className="text-left p-3 font-semibold">Medium Duty (15-75 HP)</th>
                        <th className="text-left p-3 font-semibold">Heavy Duty (75-500 HP)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="p-3 font-medium">Input Voltage</td>
                        <td className="p-3">380-480V, 3-phase</td>
                        <td className="p-3">380-480V, 3-phase</td>
                        <td className="p-3">380-690V, 3-phase</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Frequency</td>
                        <td className="p-3">50/60 Hz</td>
                        <td className="p-3">50/60 Hz</td>
                        <td className="p-3">50/60 Hz</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Output Frequency</td>
                        <td className="p-3">0-500 Hz</td>
                        <td className="p-3">0-500 Hz</td>
                        <td className="p-3">0-500 Hz</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Overload Capacity</td>
                        <td className="p-3">120% for 60s</td>
                        <td className="p-3">150% for 60s</td>
                        <td className="p-3">170% for 60s</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Control Mode</td>
                        <td className="p-3">V/F, SVC</td>
                        <td className="p-3">V/F, SVC, FVC</td>
                        <td className="p-3">V/F, SVC, FVC, Torque</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Communication</td>
                        <td className="p-3">Modbus RTU</td>
                        <td className="p-3">Modbus, Ethernet</td>
                        <td className="p-3">Modbus, Ethernet, Profibus</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">Typical Applications</td>
                        <td className="p-3">Pumps, fans, conveyors</td>
                        <td className="p-3">Mixers, extruders, hoists</td>
                        <td className="p-3">Compressors, mills, cranes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Industry Applications */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">3-Phase VFD by Industry Segment</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  industry: "Manufacturing",
                  apps: ["CNC machines", "Injection molding", "Assembly lines", "Material handling", "Packaging equipment"]
                },
                {
                  industry: "Process Industries",
                  apps: ["Chemical processing", "Food & beverage", "Pharmaceutical", "Paper & pulp", "Textile processing"]
                },
                {
                  industry: "Infrastructure",
                  apps: ["Water treatment", "Wastewater pumps", "HVAC systems", "Building automation", "Lifts & escalators"]
                },
                {
                  industry: "Oil & Gas",
                  apps: ["Pumps", "Compressors", "Drilling rigs", "Pipeline systems", "Storage handling"]
                },
                {
                  industry: "Mining & Metals",
                  apps: ["Conveyors", "Crushers", "Mills", "Hoists & cranes", "Material transport"]
                },
                {
                  industry: "Power Generation",
                  apps: ["Cooling systems", "Feed pumps", "Induced draft fans", "Coal handling", "Water circulation"]
                }
              ].map((segment, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{segment.industry}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {segment.apps.map((app, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Find Your Industrial 3-Phase VFD</h2>
            <p className="text-xl mb-8 opacity-90">
              Expert assistance for selecting the right drive for your application
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/shop?phase=three">Browse 3-Phase VFDs</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent">
                <Link to="/contact">Get Technical Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ThreePhaseVFD;
