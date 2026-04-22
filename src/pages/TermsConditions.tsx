import SEOHead from "@/components/SEO/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Terms & Conditions - Graven Automation Private Limited | Industrial Automation"
        description="Official terms and conditions governing all interactions, purchases, and services provided by Graven Automation Private Limited."
        keywords="terms and conditions, Graven Automation, purchase terms, B2B terms, industrial automation terms, legal terms"
        canonical="/terms"
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
                <BreadcrumbPage>Terms & Conditions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Terms & Conditions - Graven Automation Private Limited</CardTitle>
              <CardDescription>Last Updated: January 11, 2025</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="mb-6">
                These Terms & Conditions ("Terms") govern all interactions, purchases, and usage of products and services provided by Graven Automation Private Limited ("the Company"). 
                By purchasing from or engaging with the Company, the customer agrees to comply with these Terms.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. General</h2>
                <p className="mb-4">
                  All quotations, orders, invoices, and supplies by the Company are governed strictly by these Terms. 
                  No verbal commitments, promises, or representations shall be valid unless confirmed in writing by the Company.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Pricing and Payment</h2>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Prices are subject to change without prior notice.</li>
                  <li>Payments must be made in full as per the agreed terms on the invoice.</li>
                  <li>Any delay in payment may result in penalties or withholding of further supplies.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Product Information</h2>
                <p className="mb-4">
                  Technical specifications, performance data, and descriptions provided by the Company are for general guidance only. 
                  The customer is solely responsible for ensuring product suitability for their specific application.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Order Confirmation</h2>
                <p className="mb-4">
                  An order is considered confirmed only when accepted in writing by the Company. 
                  The Company reserves the right to cancel or refuse any order at its sole discretion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Warranty</h2>
                <p className="mb-4">
                  Warranty terms (if applicable) shall apply as per manufacturer policy. 
                  Warranty does not cover misuse, wrong installation, overloading, alteration, or negligence by the customer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="mb-4">
                  The Company's liability shall not exceed the invoice value of the product supplied. 
                  The Company shall not be liable for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Business loss</li>
                  <li>Downtime</li>
                  <li>Indirect, incidental, or consequential damages</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Return Policy</h2>
                <p className="mb-4">
                  All returns shall be governed strictly by the Company's <Link to="/return-policy" className="text-primary hover:underline">Return Policy</Link>. 
                  Unauthorized returns will not be accepted or processed.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
                <p className="mb-4">
                  All content, logos, product information, and materials are the property of the Company and may not be reproduced without prior written consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
                <p className="mb-4">
                  These Terms are governed by the laws applicable within India. 
                  Any disputes shall fall under the jurisdiction of the courts located where the Company operates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  For questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="list-none mb-4 space-y-2">
                  <li><strong>Company:</strong> Graven Automation Private Limited</li>
                  <li><strong>Email:</strong> <a href="mailto:info@schneidervfd.com" className="text-primary hover:underline">info@schneidervfd.com</a></li>
                  <li><strong>Phone:</strong> +91 7905350134 / +91 9919089567</li>
                  <li><strong>Address:</strong> 7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - 110015, India</li>
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

export default TermsConditions;