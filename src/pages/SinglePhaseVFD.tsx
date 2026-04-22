import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowRight, Zap, TrendingDown, AlertTriangle } from "lucide-react";

const SinglePhaseVFD = () => {
  const faqs = [
    {
      question: "Can I use single phase VFD for 3-phase motor?",
      answer: "Yes, single phase VFDs convert 230V single-phase input to 3-phase output for motors up to 3 HP. However, motor derating of 20-30% is required. For motors above 3 HP, use three-phase input VFDs for optimal performance."
    },
    {
      question: "What is the maximum HP for single phase VFD?",
      answer: "Single phase VFDs typically support motors from 0.25 HP to 3 HP (0.18 kW to 2.2 kW). Schneider Altivar 12 series goes up to 3 HP. Beyond 3 HP, three-phase input is strongly recommended for efficiency and reliability."
    },
    {
      question: "Are single phase VFDs less efficient?",
      answer: "Single phase VFDs have 5-10% lower efficiency compared to three-phase due to input rectification losses. However, they still save 30-50% energy compared to uncontrolled motors through speed optimization and soft starting."
    },
    {
      question: "Which Schneider single phase VFD should I buy?",
      answer: "For home/small workshop: ATV12 (0.25-3 HP), compact and economical. For commercial: ATV320 single phase variant (better display, more features). For pumps: ATV310 with built-in pump control algorithms."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Single Phase VFD India | 220V to 3-Phase Converter | ATV12 Drives"
        description="Complete guide to single phase Variable Frequency Drives in India. Convert 230V single-phase to 3-phase for motors up to 3 HP. Schneider ATV12, ATV310, ATV320 series with pricing, applications & buying guide."
        keywords="single phase VFD, 220V VFD, single phase to 3 phase, ATV12, ATV310 single phase, home VFD, small workshop motor drive, 1 phase VFD India"
        canonical="/single-phase-vfd"
      />
      <StructuredData 
        data={[
          generateArticleSchema({
            title: "Single Phase VFD Complete Guide India",
            description: "Everything about single-phase Variable Frequency Drives for Indian market",
            author: "Schneider Electric VFD Experts",
            publishedDate: "2024-01-01",
            modifiedDate: new Date().toISOString(),
            image: "/company-logo.png"
          }),
          generateFAQSchema(faqs),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Buying Guides', url: '/vfd-price-guide' },
            { name: 'Single Phase VFD', url: '/single-phase-vfd' }
          ])
        ]} 
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Single Phase Solutions</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Single Phase VFD India: Convert 220V to 3-Phase for Motors
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Run 3-phase motors with single-phase power supply. Perfect for homes, small workshops, and locations without 3-phase electricity. Schneider Electric single phase VFDs from 0.25 HP to 3 HP.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/shop?phase=single">
                    View Single Phase VFDs <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/3-phase-vfd">Compare with 3-Phase</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Single Phase VFD?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No 3-Phase Required</h3>
                  <p className="text-muted-foreground">
                    Run 3-phase motors using standard 230V household electricity. Ideal where 3-phase is unavailable or expensive to install.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingDown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Lower Installation Cost</h3>
                  <p className="text-muted-foreground">
                    Save ₹50,000-₹2,00,000 on 3-phase connection charges. No need for expensive transformer upgrades or new power lines.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Perfect for Small Motors</h3>
                  <p className="text-muted-foreground">
                    Optimal for 0.5-3 HP applications like compressors, pumps, fans, conveyors in workshops and small businesses.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Product Recommendations */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Recommended Single Phase VFD Models</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Badge className="w-fit mb-2">Best Seller</Badge>
                  <CardTitle>Schneider ATV12 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary mb-2">₹7,000 - ₹25,000</p>
                    <p className="text-sm text-muted-foreground">0.25 HP to 3 HP</p>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Compact design (90mm width)",
                      "230V single phase input",
                      "3-phase output for motors",
                      "Basic speed control",
                      "2-year warranty"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/shop?series=ATV12">View ATV12 Models</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Popular</Badge>
                  <CardTitle>Schneider ATV310 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary mb-2">₹12,000 - ₹35,000</p>
                    <p className="text-sm text-muted-foreground">0.5 HP to 3 HP</p>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Built-in pump algorithms",
                      "LCD display with indicators",
                      "Advanced protection features",
                      "Modbus communication",
                      "3-year warranty option"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/shop?series=ATV310">View ATV310 Models</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Premium</Badge>
                  <CardTitle>Schneider ATV320 Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary mb-2">₹18,000 - ₹45,000</p>
                    <p className="text-sm text-muted-foreground">0.5 HP to 3 HP</p>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Graphic LCD display",
                      "Ethernet & USB connectivity",
                      "Advanced motor control",
                      "PLC functions included",
                      "Energy saving mode"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/shop?series=ATV320">View ATV320 Models</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Advantages vs Disadvantages */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Single Phase VFD: Pros & Cons</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                    Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Works with standard 230V household power",
                      "No 3-phase electricity bill (₹1,000-₹3,000/month saved)",
                      "Avoid ₹50K-₹2L 3-phase connection cost",
                      "Easy installation, plug-and-play setup",
                      "Perfect for home workshops & small businesses",
                      "Still provides energy savings (30-50%)",
                      "Soft start reduces mechanical stress",
                      "Lower maintenance than traditional starters"
                    ].map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-6 w-6" />
                    Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Limited to 3 HP maximum power",
                      "5-10% less efficient than 3-phase VFDs",
                      "Motor derating required (20-30%)",
                      "Higher input current draw",
                      "Not suitable for heavy-duty industrial use",
                      "May trip domestic MCB if undersized",
                      "Limited availability in higher ratings",
                      "Slightly higher cost per HP than 3-phase"
                    ].map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Perfect Applications for Single Phase VFD</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Home Workshops", apps: ["Lathe machines", "Drilling machines", "Grinders", "Wood routers"] },
                { title: "Small Businesses", apps: ["Compressors", "Packaging machines", "Conveyor belts", "Mixers"] },
                { title: "Agriculture", apps: ["Water pumps", "Grain cleaners", "Feed mixers", "Chaff cutters"] },
                { title: "Commercial", apps: ["Exhaust fans", "HVAC systems", "Display pumps", "Shop equipment"] }
              ].map((category, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.apps.map((app, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
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
            <h2 className="text-3xl font-bold mb-4">Find the Right Single Phase VFD</h2>
            <p className="text-xl mb-8 opacity-90">
              Browse our complete range or get expert recommendations for your application
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/shop?phase=single">View All Single Phase VFDs</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent">
                <Link to="/contact">Talk to Expert</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SinglePhaseVFD;
