import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Globe, TrendingUp } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateOrganizationSchema } from "@/lib/seo";

const About = () => {
  const stats = [
    { icon: Award, label: "Years of Experience", value: "10+" },
    { icon: Users, label: "Satisfied Clients", value: "2000+" },
    { icon: Globe, label: "Cities Served", value: "50+" },
    { icon: TrendingUp, label: "Products Delivered", value: "25K+" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="About Us | Graven Automation | Industrial Automation Experts"
        description="Graven Automation - A complete solution for industrial automation. 10+ years of expertise in VFDs, PLCs, HMIs, and comprehensive automation solutions. Serving 2000+ clients across India."
        keywords="Graven Automation, industrial automation company, VFD supplier, PLC supplier, automation solutions, India"
        canonical="/about"
      />
      <StructuredData data={generateOrganizationSchema()} />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Graven Automation</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              A complete solution for industrial automation
            </p>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p>
                  Graven Automation has been at the forefront of industrial automation, 
                  providing complete solutions for Variable Frequency Drives, PLCs, HMIs, 
                  and comprehensive automation products. Our deep expertise in automation 
                  technology has made us a trusted partner for industries across India.
                </p>
                <p>
                  We understand that selecting the right automation equipment is critical 
                  to your operation's success. That's why we offer comprehensive solutions, 
                  from product selection and sizing to installation, commissioning, and 
                  ongoing support, ensuring your operations run at peak efficiency.
                </p>
                <p>
                  Our team of certified engineers specializes in automation applications 
                  across all industries—from manufacturing and processing to HVAC and 
                  water treatment. We deliver customized solutions that optimize energy 
                  consumption, improve process control, and reduce operational costs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <stat.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To empower industries with world-class automation solutions that drive 
                    energy efficiency, precise control, and operational excellence. We are 
                    committed to providing exceptional products and support that help our 
                    clients achieve their productivity and sustainability goals.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the most trusted partner in industrial automation, setting new 
                    standards for quality, innovation, and technical expertise. We envision 
                    a future where every industrial process operates at peak efficiency 
                    with reliable automation technology.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Quality</h4>
                  <p className="text-muted-foreground">
                    We never compromise on quality, offering only genuine products with full warranty from trusted manufacturers
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Innovation</h4>
                  <p className="text-muted-foreground">
                    Staying ahead with cutting-edge automation technologies and solutions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Support</h4>
                  <p className="text-muted-foreground">
                    24/7 technical support to ensure your operations never stop
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
