import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, FileText, CheckCircle2, ArrowRight } from "lucide-react";

const VFDPriceGuide = () => {
  const [power, setPower] = useState("");
  const [phase, setPhase] = useState("");
  const [features, setFeatures] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const calculatePrice = () => {
    if (!power || !phase) return;

    let basePrice = 0;
    const powerNum = parseFloat(power);

    // Base price calculation based on power
    if (powerNum <= 1) basePrice = 5000;
    else if (powerNum <= 5) basePrice = 8000 + (powerNum - 1) * 2000;
    else if (powerNum <= 15) basePrice = 16000 + (powerNum - 5) * 3000;
    else if (powerNum <= 50) basePrice = 46000 + (powerNum - 15) * 4000;
    else basePrice = 186000 + (powerNum - 50) * 5000;

    // Phase multiplier
    if (phase === "3-phase") basePrice *= 1.3;

    // Features multiplier
    const featureMultipliers: { [key: string]: number } = {
      "basic": 1,
      "standard": 1.2,
      "advanced": 1.5,
      "premium": 2
    };
    basePrice *= featureMultipliers[features] || 1;

    setEstimatedPrice(Math.round(basePrice));
  };

  const faqs = [
    {
      question: "What factors affect VFD pricing in India?",
      answer: "VFD prices depend on power rating (kW/HP), brand (Schneider, ABB, Siemens), phase type (single/three-phase), features (basic/advanced controls), and certifications. Import duties and local availability also impact costs."
    },
    {
      question: "What is the average VFD price range in India?",
      answer: "Entry-level VFDs (0.5-2 HP) start from ₹5,000-₹12,000. Mid-range (3-10 HP) cost ₹15,000-₹50,000. Industrial-grade (15-50 HP) range from ₹60,000-₹2,50,000. Premium models can exceed ₹5,00,000."
    },
    {
      question: "Are Schneider VFDs more expensive than other brands?",
      answer: "Schneider Electric VFDs are competitively priced in the premium segment. While 10-15% costlier than budget brands, they offer superior reliability, global support, and lower lifetime costs through energy savings."
    },
    {
      question: "Should I buy single-phase or three-phase VFD?",
      answer: "Single-phase VFDs suit small applications (<2 HP) with domestic power supply. Three-phase VFDs are essential for industrial motors (>3 HP) and offer better efficiency, but require three-phase input power."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="VFD Price Guide India 2024 | Schneider Electric Drive Pricing & Calculator"
        description="Complete VFD price guide for India. Calculate costs for 0.5 HP to 500 HP Schneider Electric drives. Compare pricing by power rating, features, and phase type. Updated 2024 rates with buying tips."
        keywords="VFD price India, Schneider VFD cost, variable frequency drive pricing, VFD calculator, motor drive price, ATV drive cost, single phase VFD price, 3 phase VFD price"
        canonical="/vfd-price-guide"
      />
      <StructuredData 
        data={[
          generateArticleSchema({
            title: "Complete VFD Price Guide India 2024",
            description: "Comprehensive pricing guide for Variable Frequency Drives with calculator and buying tips",
            author: "Schneider Electric VFD Experts",
            publishedDate: "2024-01-01",
            modifiedDate: new Date().toISOString(),
            image: "/company-logo.png"
          }),
          generateFAQSchema(faqs),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Buying Guides', url: '/vfd-price-guide' },
            { name: 'VFD Price Guide', url: '/vfd-price-guide' }
          ])
        ]} 
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Pricing Guide 2024</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                VFD Price Guide India: Complete Cost Breakdown & Calculator
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find accurate pricing for Schneider Electric Variable Frequency Drives in India. Use our calculator to estimate costs based on power rating, features, and specifications.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/shop">
                    Browse Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Request Quote</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Price Calculator */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-primary" />
                  VFD Price Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="power">Motor Power (HP or kW)</Label>
                  <Input
                    id="power"
                    type="number"
                    placeholder="Enter power rating"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phase">Phase Type</Label>
                  <Select value={phase} onValueChange={setPhase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-phase">Single Phase (220V)</SelectItem>
                      <SelectItem value="3-phase">Three Phase (380-415V)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Feature Level</Label>
                  <Select value={features} onValueChange={setFeatures}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select features" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (Speed control only)</SelectItem>
                      <SelectItem value="standard">Standard (Basic + Display)</SelectItem>
                      <SelectItem value="advanced">Advanced (Ethernet, PLC ready)</SelectItem>
                      <SelectItem value="premium">Premium (IoT, Analytics)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculatePrice} className="w-full" size="lg">
                  Calculate Estimated Price
                </Button>

                {estimatedPrice && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Estimated Price Range</p>
                        <p className="text-3xl font-bold text-primary">
                          ₹{(estimatedPrice * 0.9).toLocaleString('en-IN')} - ₹{(estimatedPrice * 1.1).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          *Prices are indicative and may vary based on market conditions
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Price Tables */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">VFD Price by Power Rating</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Single Phase VFD Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { power: "0.5 HP (0.37 kW)", price: "₹5,000 - ₹8,000" },
                      { power: "1 HP (0.75 kW)", price: "₹7,000 - ₹12,000" },
                      { power: "2 HP (1.5 kW)", price: "₹10,000 - ₹18,000" },
                      { power: "3 HP (2.2 kW)", price: "₹15,000 - ₹25,000" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="font-medium">{item.power}</span>
                        <span className="text-primary font-semibold">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Three Phase VFD Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { power: "5 HP (3.7 kW)", price: "₹18,000 - ₹30,000" },
                      { power: "10 HP (7.5 kW)", price: "₹30,000 - ₹50,000" },
                      { power: "25 HP (18.5 kW)", price: "₹80,000 - ₹1,20,000" },
                      { power: "50 HP (37 kW)", price: "₹1,50,000 - ₹2,50,000" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="font-medium">{item.power}</span>
                        <span className="text-primary font-semibold">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Factors Affecting VFD Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: "Power Rating", desc: "Higher power = higher price. Costs increase exponentially above 25 HP" },
                    { title: "Brand Premium", desc: "Schneider, ABB, Siemens charge 15-30% more than local brands" },
                    { title: "Control Features", desc: "Advanced PLC, Ethernet, IoT capabilities add 20-50% to base cost" },
                    { title: "Enclosure Type", desc: "IP65/IP67 weatherproof enclosures cost 10-15% more than IP20" },
                    { title: "Certifications", desc: "CE, UL, ISI certifications ensure quality but increase price 5-10%" },
                    { title: "Warranty Period", desc: "Extended 3-5 year warranties add 8-12% to initial cost" }
                  ].map((factor, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">{factor.title}</h4>
                        <p className="text-sm text-muted-foreground">{factor.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            <h2 className="text-3xl font-bold mb-4">Get Accurate Pricing for Your Project</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact our experts for detailed quotations based on your specific requirements
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contact">
                  <FileText className="mr-2 h-5 w-5" />
                  Request Quote
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent">
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VFDPriceGuide;
