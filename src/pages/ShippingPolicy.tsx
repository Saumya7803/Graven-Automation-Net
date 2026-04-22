import SEOHead from "@/components/SEO/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Shipping Policy - Graven Automation Private Limited | Industrial Automation"
        description="Official shipping policy for Graven Automation Private Limited. Learn about product dispatch, delivery procedures, and logistics terms."
        keywords="shipping policy, Graven Automation, delivery, dispatch, B2B shipping, industrial automation shipping"
        canonical="/shipping"
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
                <BreadcrumbPage>Shipping Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Shipping Policy - Graven Automation Private Limited</CardTitle>
              <CardDescription>Last Updated: January 11, 2025</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="mb-6">
                This Shipping Policy outlines the procedures and terms for product dispatch, delivery, and logistics handled by Graven Automation Private Limited ("the Company").
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Dispatch Timeline</h2>
                <p className="mb-4">Products are dispatched based on:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Stock availability</li>
                  <li>Order confirmation</li>
                  <li>Payment clearance</li>
                </ul>
                <p className="mb-4">
                  Estimated dispatch timelines may vary and are approximate. The Company will not be held liable for delays caused by logistics partners, transport issues, strikes, or force majeure conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Shipping Method</h2>
                <p className="mb-4">Shipments are managed through:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Reputed courier partners</li>
                  <li>Transport services</li>
                  <li>Company-arranged logistics</li>
                </ul>
                <p className="mb-4">
                  The shipping method is determined by the Company to ensure efficiency and safety.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Delivery Time</h2>
                <p className="mb-4">Delivery time depends on:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Customer's location</li>
                  <li>Courier/transport network</li>
                  <li>Route and transit conditions</li>
                </ul>
                <p className="mb-4">
                  Delays due to external factors are beyond Company control.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Shipping Charges</h2>
                <p className="mb-4">Shipping charges may apply based on:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Weight and dimensions of the product</li>
                  <li>Delivery location</li>
                  <li>Mode of transport</li>
                </ul>
                <p className="mb-4">
                  Charges will be clearly mentioned on invoice or order confirmation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Risk & Responsibility</h2>
                <p className="mb-4">
                  Once the product is handed over to the courier/transport provider, the risk of loss or damage transfers to the customer. 
                  The Company shall not be responsible for delays, damages, or loss occurring during transit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Inspection Upon Delivery</h2>
                <p className="mb-4">
                  Customers must inspect the material immediately upon receipt. 
                  Any transit damage must be reported within 24 hours. 
                  Failure to report within the specified time may result in rejection of claims.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Wrong or Missing Items</h2>
                <p className="mb-4">
                  In case of wrong or missing items, the customer must notify the Company within 24 hours of delivery. 
                  Claims made after this period may not be accepted.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Unauthorized Returns</h2>
                <p className="mb-4">
                  No material should be returned without prior written approval from Graven Automation Private Limited. Unauthorized returns will not be accepted.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  For questions about shipping or delivery:
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

export default ShippingPolicy;