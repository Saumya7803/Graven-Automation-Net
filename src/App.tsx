import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { PushNotificationBanner } from "@/components/ui/PushNotificationBanner";

// Eager load critical pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";

// Lazy load category page
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

// Lazy load SEO pages
const SeriesPage = lazy(() => import("./pages/SeriesPage"));
const BuySchneiderVFDIndia = lazy(() => import("./pages/BuySchneiderVFDIndia"));
const SchneiderVFDPriceIndia = lazy(() => import("./pages/SchneiderVFDPriceIndia"));
const PowerRatingPage = lazy(() => import("./pages/PowerRatingPage"));
const VFDGuideHub = lazy(() => import("./pages/VFDGuideHub"));
const VFDGuidePage = lazy(() => import("./pages/VFDGuidePage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const ComponentPage = lazy(() => import("./pages/ComponentPage"));
const ApplicationPage = lazy(() => import("./pages/ApplicationPage"));
const VFDPartsHub = lazy(() => import("./pages/VFDPartsHub"));
const TechnicalResourcePage = lazy(() => import("./pages/TechnicalResourcePage"));
const VFDPriceGuide = lazy(() => import("./pages/VFDPriceGuide"));
const SinglePhaseVFD = lazy(() => import("./pages/SinglePhaseVFD"));
const ThreePhaseVFD = lazy(() => import("./pages/ThreePhaseVFD"));
const ManufacturersIndia = lazy(() => import("./pages/ManufacturersIndia"));
const ResourceHub = lazy(() => import("./pages/ResourceHub"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudyDetail"));

// Lazy load non-critical pages
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ProductComparison = lazy(() => import("./pages/ProductComparison"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const MyQuotations = lazy(() => import("./pages/MyQuotations"));
const CustomerQuotationDetail = lazy(() => import("./pages/QuotationDetail"));
const ProcurementList = lazy(() => import("./pages/ProcurementList"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));

// Lazy load all admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CartRecoveryTemplates = lazy(() => import("./pages/admin/CartRecoveryTemplates"));
const CartRecoveryAnalytics = lazy(() => import("./pages/admin/CartRecoveryAnalytics"));
const EmailCampaigns = lazy(() => import("./pages/admin/EmailCampaigns"));
const CampaignDetail = lazy(() => import("./pages/admin/CampaignDetail"));
const ProductsList = lazy(() => import("./pages/admin/ProductsList"));
const PaymentGateways = lazy(() => import("./pages/admin/PaymentGateways"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const CategoriesList = lazy(() => import("./pages/admin/CategoriesList"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const SearchAnalytics = lazy(() => import("./pages/admin/SearchAnalytics"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const BlogList = lazy(() => import("./pages/admin/BlogList"));
const AddBlogPost = lazy(() => import("./pages/admin/AddBlogPost"));
const BulkImport = lazy(() => import("./pages/admin/BulkImport"));
const OrdersList = lazy(() => import("./pages/admin/OrdersList"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const CustomersList = lazy(() => import("./pages/admin/CustomersList"));
const CustomerDetail = lazy(() => import("./pages/admin/CustomerDetail"));
const QuotationsList = lazy(() => import("./pages/admin/QuotationsList"));
const QuotationDetail = lazy(() => import("./pages/admin/QuotationDetail"));
const WebhookSettings = lazy(() => import("./pages/admin/WebhookSettings"));
const ApiDocs = lazy(() => import("./pages/admin/ApiDocs"));
const TestimonialsList = lazy(() => import("./pages/admin/TestimonialsList"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const SEOKeywords = lazy(() => import("./pages/admin/seo/Keywords"));
const QuestionsList = lazy(() => import("./pages/admin/QuestionsList"));
const CallbacksList = lazy(() => import("./pages/admin/CallbacksList"));
const PushNotifications = lazy(() => import("./pages/admin/PushNotifications"));
const NotificationAnalytics = lazy(() => import("./pages/admin/NotificationAnalytics"));
const AbandonedCarts = lazy(() => import("./pages/admin/AbandonedCarts"));
const CartRecovery = lazy(() => import("./pages/CartRecovery"));
const SequenceAnalytics = lazy(() => import("./pages/admin/SequenceAnalytics"));
const GoogleShoppingBulkUpdate = lazy(() => import("./pages/admin/GoogleShoppingBulkUpdate"));
const GoogleMerchantSettings = lazy(() => import("./pages/admin/GoogleMerchantSettings"));
const GoogleShoppingDashboard = lazy(() => import("./pages/admin/GoogleShoppingDashboard"));
const GoogleShoppingPerformance = lazy(() => import("./pages/admin/GoogleShoppingPerformance"));
const ProcurementListRecovery = lazy(() => import("./pages/admin/ProcurementListRecovery"));
const ProcurementRecoveryTemplates = lazy(() => import("./pages/admin/ProcurementRecoveryTemplates"));
const ProcurementRecovery = lazy(() => import("./pages/ProcurementRecovery"));
const QuickSKUImport = lazy(() => import("./pages/admin/QuickSKUImport"));
const ModelMaster = lazy(() => import("./pages/admin/ModelMaster"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-full max-w-7xl px-4 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const App = () => (
  <TooltipProvider delayDuration={300} skipDelayDuration={100}>
    <CartProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/series/:slug" element={<SeriesPage />} />
            <Route path="/vfd/:power" element={<PowerRatingPage />} />
            <Route path="/buy-schneider-vfd-india" element={<BuySchneiderVFDIndia />} />
            <Route path="/schneider-vfd-price-india" element={<SchneiderVFDPriceIndia />} />
            <Route path="/vfd/:power" element={<PowerRatingPage />} />
            <Route path="/vfd-guide" element={<VFDGuideHub />} />
            <Route path="/vfd-guide/:slug" element={<VFDGuidePage />} />
            <Route path="/resources" element={<ResourceHub />} />
            <Route path="/vfd-vs-soft-starter" element={<ComparisonPage />} />
            <Route path="/vsd-vs-vfd" element={<ComparisonPage />} />
            <Route path="/vfd-parts" element={<VFDPartsHub />} />
            <Route path="/vfd-components/:component" element={<ComponentPage />} />
            <Route path="/solar-vfd" element={<ApplicationPage />} />
            <Route path="/hvac-vfd" element={<ApplicationPage />} />
            <Route path="/pump-vfd" element={<ApplicationPage />} />
            <Route path="/technical/:slug" element={<TechnicalResourcePage />} />
            <Route path="/vfd-price-guide" element={<VFDPriceGuide />} />
            <Route path="/single-phase-vfd" element={<SinglePhaseVFD />} />
            <Route path="/3-phase-vfd" element={<ThreePhaseVFD />} />
            <Route path="/vfd-manufacturers-india" element={<ManufacturersIndia />} />
            <Route path="/location/:slug" element={<LocationPage />} />
            <Route path="/pricing/:slug" element={<PricingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/product-comparison" element={<ProductComparison />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/my-quotations" element={<MyQuotations />} />
            <Route path="/quotations/:id" element={<CustomerQuotationDetail />} />
            <Route path="/procurement-list" element={<ProcurementList />} />
            <Route path="/cart-recovery/:token" element={<CartRecovery />} />
            <Route path="/procurement-recovery/:token" element={<ProcurementRecovery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductsList />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
            <Route path="/admin/products/edit/:id" element={<EditProduct />} />
            <Route path="/admin/categories" element={<CategoriesList />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/analytics/search" element={<SearchAnalytics />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/blog" element={<BlogList />} />
            <Route path="/admin/blog/add" element={<AddBlogPost />} />
            <Route path="/admin/import" element={<BulkImport />} />
            <Route path="/admin/orders" element={<OrdersList />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/customers" element={<CustomersList />} />
            <Route path="/admin/customers/:id" element={<CustomerDetail />} />
            <Route path="/admin/rfq" element={<QuotationsList />} />
            <Route path="/admin/rfq/:id" element={<QuotationDetail />} />
            <Route path="/admin/crm-webhooks" element={<WebhookSettings />} />
            <Route path="/admin/api-docs" element={<ApiDocs />} />
            <Route path="/admin/payment-gateways" element={<PaymentGateways />} />
            <Route path="/admin/testimonials" element={<TestimonialsList />} />
            <Route path="/admin/seo/keywords" element={<SEOKeywords />} />
            <Route path="/admin/questions" element={<QuestionsList />} />
            <Route path="/admin/callbacks" element={<CallbacksList />} />
            <Route path="/admin/email-campaigns" element={<EmailCampaigns />} />
            <Route path="/admin/email-campaigns/:id" element={<CampaignDetail />} />
            <Route path="/admin/push-notifications" element={<PushNotifications />} />
            <Route path="/admin/analytics/notifications" element={<NotificationAnalytics />} />
            <Route path="/admin/abandoned-carts" element={<AbandonedCarts />} />
            <Route path="/admin/cart-recovery-templates" element={<CartRecoveryTemplates />} />
            <Route path="/admin/analytics/cart-recovery" element={<CartRecoveryAnalytics />} />
            <Route path="/admin/analytics/cart-sequences" element={<SequenceAnalytics />} />
            <Route path="/admin/procurement-list-recovery" element={<ProcurementListRecovery />} />
            <Route path="/admin/procurement-recovery-templates" element={<ProcurementRecoveryTemplates />} />
            <Route path="/admin/google-shopping" element={<GoogleShoppingBulkUpdate />} />
            <Route path="/admin/google-shopping/dashboard" element={<GoogleShoppingDashboard />} />
            <Route path="/admin/google-shopping/performance" element={<GoogleShoppingPerformance />} />
            <Route path="/admin/google-merchant-settings" element={<GoogleMerchantSettings />} />
            <Route path="/admin/quick-sku-import" element={<QuickSKUImport />} />
            <Route path="/admin/model-master" element={<ModelMaster />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingWhatsApp />
        <InstallPrompt />
        <PushNotificationBanner />
      </BrowserRouter>
    </CartProvider>
  </TooltipProvider>
);

export default App;
