import SEOHead from "@/components/SEO/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Privacy Policy - Graven Automation Private Limited | Industrial Automation"
        description="Official privacy policy for Graven Automation Private Limited. Learn how we collect, use, and protect personal information for business transactions."
        keywords="privacy policy, Graven Automation, data protection, personal information security, B2B privacy, industrial automation privacy"
        canonical="/privacy"
      />
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy - Graven Automation Private Limited</CardTitle>
              <CardDescription>Last Updated: January 11, 2025</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="mb-6 font-medium">
                This Privacy Policy describes how Graven Automation Private Limited ("the Company", "we", "our", "us") 
                collects, uses, stores, and protects personal information. By accessing our website or purchasing our 
                products, you agree to the terms outlined below.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="mb-4">We may collect the following information:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Name, company name, contact number, email address</li>
                  <li>Billing and shipping addresses</li>
                  <li>Purchase history and transaction details</li>
                  <li>Device information, IP address, and browsing activity on our website</li>
                  <li>Any information voluntarily provided by the customer</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Purpose of Data Collection</h2>
                <p className="mb-4">We collect and use customer information solely for:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Processing orders and delivering products</li>
                  <li>Internal record-keeping and operational purposes</li>
                  <li>Improving our services, website functionality, and customer experience</li>
                  <li>Communication regarding orders, updates, or support</li>
                  <li>Compliance with legal and regulatory requirements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Data Protection</h2>
                <p className="mb-4">
                  The Company implements reasonable technical and organizational measures to protect personal data 
                  from unauthorized access, alteration, or disclosure.
                </p>
                <p className="mb-4">
                  However, no data transmission over the internet can be guaranteed as fully secure, and the Company 
                  shall not be held liable for breaches beyond its reasonable control.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Sharing of Information</h2>
                <p className="mb-4">We may share customer data only with:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Delivery partners and logistics providers</li>
                  <li>Payment processors</li>
                  <li>Internal employees responsible for order execution</li>
                  <li>Authorities when required under applicable laws</li>
                </ul>
                <p className="mb-4">
                  <strong>We do not sell or trade personal information to third parties for commercial gains.</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
                <p className="mb-4">
                  Our website may use cookies for analytics, security, and site functionality. Customers may disable 
                  cookies through their browser settings, though some features may not function properly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Customer Rights</h2>
                <p className="mb-4">Customers may request:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Access to the personal data we hold</li>
                  <li>Correction of inaccurate information</li>
                </ul>
                <p className="mb-4">
                  Requests will be addressed in accordance with internal policies and applicable laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Amendments</h2>
                <p className="mb-4">
                  The Company reserves the right to update or modify this Privacy Policy at any time without prior notice. 
                  Continued use of our website indicates acceptance of such changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions or concerns about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none mb-4 space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:info@schneidervfd.com" className="text-primary hover:underline">info@schneidervfd.com</a></li>
                  <li><strong>Phone:</strong> +91 7905350134 / +91 9919089567</li>
                  <li><strong>Address:</strong> Graven Automation Private Limited, 7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - 110015, India</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;