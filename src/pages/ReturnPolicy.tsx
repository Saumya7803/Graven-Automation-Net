import SEOHead from "@/components/SEO/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Return Policy - Graven Automation Private Limited | Industrial Automation"
        description="Official return policy for Graven Automation Private Limited. All sales are final with returns permitted only for verified manufacturing defects, incorrect products, or faulty delivery conditions."
        keywords="return policy, Graven Automation, industrial automation returns, VFD return policy, manufacturing defect returns, B2B return terms"
        canonical="/return-policy"
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
                <BreadcrumbPage>Return Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Return Policy - Graven Automation Private Limited</CardTitle>
              <CardDescription>Last Updated: January 11, 2025</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="mb-6 font-medium">
                The following Return Policy governs all transactions conducted with Graven Automation Private Limited ("the Company"). 
                By purchasing any product from the Company, the customer acknowledges and agrees to comply with the terms set forth below.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. General Policy</h2>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>All sales made by Graven Automation Private Limited are considered final.</li>
                  <li>Returns are permitted strictly and exclusively under conditions where a legitimate issue with the supplied material is established by the Company.</li>
                  <li>No return shall be accepted unless it fully meets the conditions specified in this policy.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Eligibility for Return</h2>
                <p className="mb-4">A return request will be considered only in the following circumstances:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Verified manufacturing defect</li>
                  <li>Incorrect product supplied by the Company</li>
                  <li>Product delivered in a faulty condition not attributable to the customer's handling</li>
                </ul>
                <p className="mb-4">
                  The Company retains sole discretion to determine whether a defect or issue is valid and qualifies for return.
                </p>
                <p className="mb-4"><strong>Returns will not be accepted for:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Wrong product ordered by the customer</li>
                  <li>Change of requirement or preference</li>
                  <li>Incorrect technical selection by the customer</li>
                  <li>Any issue arising from installation, usage, or handling outside Company control</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Verification and Approval Process</h2>
                <p className="mb-4">All return requests are subject to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Internal inspection</li>
                  <li>Technical evaluation</li>
                  <li>Verification of the customer's claim</li>
                </ul>
                <p className="mb-4">
                  A return will be processed only after the Company confirms the issue in writing. 
                  The Company reserves the right to request photographs, videos, test reports, or physical inspection before approving any return.
                </p>
                <p className="mb-4">
                  <strong>Approval or rejection of a return claim shall be decided solely at the discretion of Graven Automation Private Limited 
                  and shall be considered final and binding.</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Condition of Goods for Return</h2>
                <p className="mb-4">If a return is approved, the product must:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Be returned in the same physical and operational condition as supplied</li>
                  <li>Contain all original packaging, labels, manuals, accessories, and documentation</li>
                </ul>
                <p className="mb-4">
                  Any sign of tampering, improper use, installation damage, or alteration will result in immediate rejection of the return claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Return Handling and Logistics</h2>
                <p className="mb-4">
                  All return movements, arrangements, and transportation will be managed solely through the Company's internal procedures.
                </p>
                <p className="mb-4">
                  <strong>Customers are strictly prohibited from sending back any product without prior written authorization from the Company. 
                  Unauthorized returns will not be accepted or processed.</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Remedies and Solutions</h2>
                <p className="mb-4">
                  Upon confirming an issue, the Company will provide a solution based on what it determines to be the best possible 
                  and commercially reasonable remedy, which may include:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Repair of the product</li>
                  <li>Replacement of the product</li>
                  <li>Return and credit adjustment</li>
                </ul>
                <p className="mb-4">The choice of remedy rests exclusively with the Company.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="mb-4">
                  The Company's liability in all return cases shall be limited strictly to the value of the product supplied.
                </p>
                <p className="mb-4"><strong>The Company shall not be liable for:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Downtime or business loss</li>
                  <li>Installation or removal costs</li>
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Any claims beyond the invoice value of the product</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Final Authority</h2>
                <p className="mb-4">
                  All decisions made by Graven Automation Private Limited regarding returns, eligibility, remedies, and outcomes 
                  shall be final, conclusive, and binding on the customer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about our return policy, please contact us:
                </p>
                <ul className="list-none mb-4 space-y-2">
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

export default ReturnPolicy;