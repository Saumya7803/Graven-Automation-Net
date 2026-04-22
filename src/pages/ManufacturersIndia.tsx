import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Award, TrendingUp, Shield } from "lucide-react";

const ManufacturersIndia = () => {
  const faqs = [
    {
      question: "Which is the best VFD manufacturer in India?",
      answer: "Schneider Electric leads in technology and reliability, followed by ABB and Siemens for premium applications. For budget options, Delta, Danfoss, and L&T are popular. Choice depends on application criticality, budget, and support requirements."
    },
    {
      question: "Are Chinese VFD brands reliable in India?",
      answer: "Chinese brands like Delta, Inovance, and Veichi offer good value (30-40% cheaper) for non-critical applications. However, premium brands (Schneider, ABB, Siemens) are recommended for industrial, process control, or mission-critical applications."
    },
    {
      question: "Does Schneider manufacture VFDs in India?",
      answer: "Schneider imports ATV drives from France, China, and Malaysia. While not manufactured locally, they have strong Indian service network, warehouses in major cities, and 48-hour delivery. Local assembly is planned for select models."
    },
    {
      question: "Which VFD brand has best after-sales support in India?",
      answer: "Schneider Electric has the most extensive service network (45+ cities), followed by ABB (35+ cities) and Siemens (30+ cities). Response time: Tier-1 cities (24 hrs), Tier-2 (48 hrs), Tier-3 (72 hrs)."
    }
  ];

  const manufacturers = [
    {
      name: "Schneider Electric",
      series: "Altivar (ATV12, ATV320, ATV340, ATV630, ATV930)",
      origin: "France / Global",
      marketShare: "22%",
      priceSegment: "Premium",
      strengths: ["Widest product range", "Best global support", "Energy efficiency", "IoT integration"],
      rating: 4.8,
      warranty: "2-3 years",
      badge: "Recommended",
      link: "/shop"
    },
    {
      name: "ABB",
      series: "ACS series (ACS150, ACS355, ACS580, ACS880)",
      origin: "Switzerland / Sweden",
      marketShare: "18%",
      priceSegment: "Premium",
      strengths: ["Heavy industry focus", "Robust design", "Process control", "Mining applications"],
      rating: 4.7,
      warranty: "2 years",
      badge: "Premium"
    },
    {
      name: "Siemens",
      series: "SINAMICS (G120, G120C, S120, S210)",
      origin: "Germany",
      marketShare: "15%",
      priceSegment: "Premium",
      strengths: ["Automation integration", "Precise control", "German engineering", "PLC compatibility"],
      rating: 4.7,
      warranty: "2 years"
    },
    {
      name: "Delta Electronics",
      series: "VFD-C2000, VFD-M, VFD-E, VFD-VE",
      origin: "Taiwan / China",
      marketShare: "12%",
      priceSegment: "Mid-range",
      strengths: ["Best value for money", "Compact size", "Good quality", "Wide availability"],
      rating: 4.3,
      warranty: "18 months",
      badge: "Best Value"
    },
    {
      name: "Danfoss",
      series: "VLT (Micro, HVAC, Aqua, AutomationDrive)",
      origin: "Denmark",
      marketShare: "10%",
      priceSegment: "Premium",
      strengths: ["HVAC specialist", "Water/wastewater", "Energy savings", "Long lifecycle"],
      rating: 4.6,
      warranty: "2 years"
    },
    {
      name: "L&T (Schneider JV)",
      series: "L&T VFD (based on Schneider)",
      origin: "India (Schneider tech)",
      marketShare: "8%",
      priceSegment: "Mid-range",
      strengths: ["Local manufacturing", "India-specific", "Good support", "Competitive pricing"],
      rating: 4.2,
      warranty: "2 years"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="VFD Manufacturers India | Compare Schneider, ABB, Siemens, Delta, Danfoss, L&T Drives"
        description="Complete comparison of top VFD manufacturers in India. Schneider Electric, ABB, Siemens, Delta, Danfoss, L&T - market share, pricing, features, support network. Find the best Variable Frequency Drive brand for your industry."
        keywords="VFD manufacturers India, Schneider vs ABB, Siemens VFD, Delta drives, best VFD brand India, motor drive suppliers, industrial automation companies"
        canonical="/vfd-manufacturers-india"
      />
      <StructuredData 
        data={[
          generateArticleSchema({
            title: "Top VFD Manufacturers in India - Complete Comparison 2024",
            description: "Detailed analysis of leading Variable Frequency Drive manufacturers serving Indian industry",
            author: "Schneider Electric VFD Experts",
            publishedDate: "2024-01-01",
            modifiedDate: new Date().toISOString(),
            image: "/company-logo.png"
          }),
          generateFAQSchema(faqs),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Buying Guides', url: '/vfd-price-guide' },
            { name: 'VFD Manufacturers', url: '/vfd-manufacturers-india' }
          ])
        ]} 
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Market Analysis 2024</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                VFD Manufacturers India: Compare Top Brands & Find the Best Drive
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive comparison of leading Variable Frequency Drive manufacturers serving India. Market share, pricing, technical capabilities, support network, and recommendations for every industry segment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/shop">
                    Browse Schneider Drives <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/vfd-price-guide">Compare Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Market Overview */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Indian VFD Market Overview</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Market Size</h3>
                  <p className="text-3xl font-bold text-primary mb-2">₹6,800 Cr</p>
                  <p className="text-sm text-muted-foreground">Growing at 12% CAGR (2024)</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Top 6 Brands</h3>
                  <p className="text-3xl font-bold text-primary mb-2">85%</p>
                  <p className="text-sm text-muted-foreground">Market share concentration</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Applications</h3>
                  <p className="text-3xl font-bold text-primary mb-2">15+ Sectors</p>
                  <p className="text-sm text-muted-foreground">Manufacturing, Infrastructure, Process</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Manufacturer Comparison */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Top VFD Manufacturers Comparison</h2>
            
            <div className="grid gap-6">
              {manufacturers.map((mfr, index) => (
                <Card key={index} className={mfr.badge === "Recommended" ? "border-primary shadow-lg" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl">{mfr.name}</CardTitle>
                          {mfr.badge && (
                            <Badge variant={mfr.badge === "Recommended" ? "default" : "secondary"}>
                              {mfr.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{mfr.series}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Market Share</p>
                        <p className="text-2xl font-bold text-primary">{mfr.marketShare}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm font-medium mb-2">Origin</p>
                        <p className="text-sm text-muted-foreground">{mfr.origin}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Price Segment</p>
                        <Badge variant="outline">{mfr.priceSegment}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Rating</p>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold">{mfr.rating}</span>
                          <span className="text-sm text-muted-foreground">/5.0</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Warranty</p>
                        <p className="text-sm text-muted-foreground">{mfr.warranty}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-sm font-medium mb-3">Key Strengths</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {mfr.strengths.map((strength, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {mfr.link && (
                      <Button className="mt-4 w-full" asChild>
                        <Link to={mfr.link}>View {mfr.name} Products</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Selection Guide */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Which VFD Manufacturer Should You Choose?</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Schneider Electric if you need:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Widest product range (0.25 HP to 500 HP)",
                      "Best service network (45+ cities)",
                      "Energy efficiency & sustainability focus",
                      "IoT, cloud, predictive maintenance",
                      "Mix of budget & premium options",
                      "Global quality with local support"
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link to="/shop">View Schneider Products</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Choose Others if:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      { brand: "ABB", use: "Heavy industry, mining, oil & gas (extreme duty cycles)" },
                      { brand: "Siemens", use: "Full automation systems with Siemens PLCs/SCADA" },
                      { brand: "Delta", use: "Budget-conscious projects, OEM applications (30-40% cheaper)" },
                      { brand: "Danfoss", use: "HVAC, water/wastewater, building automation specialists" },
                      { brand: "L&T", use: "India-specific applications, local manufacturing priority" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div>
                          <span className="font-semibold">{item.brand}:</span>
                          <span className="text-muted-foreground"> {item.use}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Price Comparison */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Price Comparison by Power Rating</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Power Rating</th>
                        <th className="text-left p-3 font-semibold">Schneider</th>
                        <th className="text-left p-3 font-semibold">ABB</th>
                        <th className="text-left p-3 font-semibold">Siemens</th>
                        <th className="text-left p-3 font-semibold">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { power: "1 HP", schneider: "₹8,000-12,000", abb: "₹9,000-13,000", siemens: "₹10,000-14,000", delta: "₹5,500-8,000" },
                        { power: "5 HP", schneider: "₹18,000-28,000", abb: "₹20,000-30,000", siemens: "₹22,000-32,000", delta: "₹13,000-20,000" },
                        { power: "10 HP", schneider: "₹32,000-48,000", abb: "₹35,000-52,000", siemens: "₹38,000-55,000", delta: "₹22,000-35,000" },
                        { power: "25 HP", schneider: "₹85,000-1,25,000", abb: "₹90,000-1,35,000", siemens: "₹95,000-1,40,000", delta: "₹60,000-95,000" }
                      ].map((row, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3 font-medium">{row.power}</td>
                          <td className="p-3">{row.schneider}</td>
                          <td className="p-3">{row.abb}</td>
                          <td className="p-3">{row.siemens}</td>
                          <td className="p-3 text-green-600 font-medium">{row.delta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  *Prices are approximate and vary based on features, enclosure type, and market conditions
                </p>
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
            <h2 className="text-3xl font-bold mb-4">Ready to Choose the Right VFD?</h2>
            <p className="text-xl mb-8 opacity-90">
              Get expert recommendations based on your specific application and budget
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/shop">Browse Schneider Catalog</Link>
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

export default ManufacturersIndia;
