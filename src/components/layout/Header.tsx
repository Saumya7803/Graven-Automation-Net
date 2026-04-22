import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, Phone, User, Home, ShoppingBag, Info, Mail, BookOpen, ClipboardList, ChevronDown, Gauge, Settings, Activity, Cpu, Shield, Box, Search, Package, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useProcurementListContext } from "@/contexts/ProcurementListContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import RequestQuotationDialog from "@/components/rfq/RequestQuotationDialog";
import { AnnouncementBar } from "./AnnouncementBar";
import { SearchDialog } from "./SearchDialog";
import { UserDropdown } from "./UserDropdown";
import gravenLogo from "@/assets/graven-logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Product categories for navigation
const productCategories = [
  {
    id: "vfd",
    name: "Variable Frequency Drives",
    slug: "vfd",
    description: "Complete range of VFDs for all applications",
    icon: Gauge,
  },
  {
    id: "plc",
    name: "PLCs & Controllers",
    slug: "plc",
    description: "Programmable Logic Controllers",
    icon: Cpu,
  },
  {
    id: "hmi",
    name: "HMI Panels",
    slug: "hmi",
    description: "Human Machine Interfaces",
    icon: Settings,
  },
  {
    id: "motors",
    name: "Motors & Drives",
    slug: "motors",
    description: "Industrial motors and servo drives",
    icon: Activity,
  },
  {
    id: "sensors",
    name: "Sensors & Switches",
    slug: "sensors",
    description: "Industrial sensors and safety switches",
    icon: Shield,
  },
  {
    id: "accessories",
    name: "Accessories & Parts",
    slug: "accessories",
    description: "Cables, connectors, and spare parts",
    icon: Box,
  },
];

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const { count: procurementCount } = useProcurementListContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shop", label: "Shop", icon: ShoppingBag },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <AnnouncementBar />
      
      {/* Visual separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-transparent bg-gradient-to-b from-background/95 via-background/90 to-background/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 shadow-lg shadow-primary/5 transition-all duration-300" style={{
        borderImage: 'linear-gradient(90deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.2)) 1',
      }}>
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <div className="flex h-20 items-center justify-between gap-4 lg:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <img 
                  src={gravenLogo} 
                  alt="Graven Automation Logo" 
                  className="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold leading-none tracking-tight text-foreground transition-all duration-300 group-hover:text-primary">
                  Graven Automation
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  Industrial Automation Solutions
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {/* Nav Links - Home and Shop */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group relative px-4 py-2.5 text-sm font-semibold text-foreground rounded-full transition-all duration-300 flex items-center gap-2 hover:scale-105 overflow-hidden before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-primary/10 before:via-primary/10 before:to-orange-500/10 before:opacity-0 before:transition-opacity hover:before:opacity-100"
                  >
                    <Icon className="h-4 w-4 relative z-10 group-hover:-translate-y-1 group-hover:text-primary transition-all duration-300" />
                    <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                      {link.label}
                    </span>
                  </Link>
                );
              })}

              {/* Products Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="group relative px-4 py-2.5 text-sm font-semibold text-foreground rounded-full transition-all duration-300 flex items-center gap-2 hover:scale-105 overflow-hidden bg-transparent hover:bg-transparent data-[state=open]:bg-transparent before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-primary/10 before:via-primary/10 before:to-orange-500/10 before:opacity-0 before:transition-opacity hover:before:opacity-100 data-[state=open]:before:opacity-100 h-auto">
                        <ShoppingBag className="h-4 w-4 relative z-10 group-hover:-translate-y-1 group-hover:text-primary transition-all duration-300" />
                        <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                          Products
                        </span>
                      </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[600px] p-4 bg-popover border rounded-lg shadow-xl">
                        <div className="mb-3 pb-3 border-b">
                          <h3 className="font-semibold text-foreground">Product Categories</h3>
                          <p className="text-sm text-muted-foreground">Browse our complete range of automation products</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {productCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                              <NavigationMenuLink key={category.id} asChild>
                                <Link
                                  to={`/shop?category=${category.slug}`}
                                  className="group/item flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-foreground group-hover/item:text-primary transition-colors">
                                      {category.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {category.description}
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <NavigationMenuLink asChild>
                            <Link
                              to="/shop"
                              className="flex items-center justify-center gap-2 w-full p-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                            >
                              <ShoppingBag className="h-4 w-4" />
                              View All Products
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Icon Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchDialogOpen(true)}
                    className="hidden md:flex relative group hover:bg-primary/10 transition-all duration-300"
                  >
                    <Search className="h-5 w-5 group-hover:text-primary transition-colors" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search products</p>
                </TooltipContent>
              </Tooltip>
              {/* Request Quote Button */}
              <Button
                onClick={() => setQuotationDialogOpen(true)}
                className="hidden lg:flex group relative overflow-hidden px-5 py-2 bg-gradient-to-r from-primary via-primary to-orange-500 hover:from-primary-hover hover:via-primary-hover hover:to-orange-600 shadow-lg shadow-primary/50 hover:shadow-2xl hover:shadow-primary/60 hover:scale-105 transition-all duration-300"
              >
                <Phone className="h-4 w-4 mr-1.5 relative z-10 group-hover:animate-wiggle" />
                <span className="relative z-10 font-semibold text-sm">Request Quote</span>
              </Button>

              {/* Procurement List Icon */}
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/procurement-list" className="relative hidden md:flex">
                      <Button variant="ghost" size="icon" className="relative">
                        <ClipboardList className="h-5 w-5" />
                      </Button>
                      {procurementCount > 0 && (
                        <Badge
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-primary hover:bg-primary shadow-lg ring-2 ring-background"
                        >
                          {procurementCount > 9 ? "9+" : procurementCount}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Procurement List</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Cart with Badge */}
              <div className="relative">
                <CartDrawer />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse-subtle shadow-lg shadow-red-500/50 ring-2 ring-background"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </div>

              {/* User Menu - Hidden on mobile */}
              {user ? (
                <div className="hidden md:block">
                <UserDropdown />
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild className="hidden md:flex relative overflow-hidden border-2 border-transparent bg-gradient-to-r from-primary/10 to-orange-500/10 hover:from-primary/20 hover:to-orange-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group" style={{
                  borderImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(30 90% 55%)) 1',
                }}>
                  <Link to="/auth" className="relative z-10 flex items-center">
                    <User className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    Sign In
                  </Link>
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="relative">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {/* Search Button (Mobile) */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSearchDialogOpen(true);
                      }}
                      className="mb-4 w-full justify-start gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Search products...
                    </Button>

                    {/* Nav Links - Home and Shop */}
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}

                    {/* Products Collapsible */}
                    <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-5 w-5" />
                          Products
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", categoriesOpen && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-8 space-y-2 mt-2">
                        {productCategories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <Link
                              key={category.id}
                              to={`/shop?category=${category.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 p-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-accent"
                            >
                              <Icon className="h-4 w-4" />
                              {category.name}
                            </Link>
                          );
                        })}
                        <Link
                          to="/shop"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-accent"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          View All Products
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Procurement List */}
                    {user && (
                      <Link
                        to="/procurement-list"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                      >
                        <ClipboardList className="h-5 w-5" />
                        Procurement List
                        {procurementCount > 0 && (
                          <Badge className="ml-auto">{procurementCount}</Badge>
                        )}
                      </Link>
                    )}

                    {/* Mobile Request Quote */}
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setQuotationDialogOpen(true);
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Request Quote
                    </Button>

                    {/* Mobile User Actions */}
                    <div className="border-t pt-4 mt-4">
                      {user ? (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                          >
                            <User className="h-5 w-5" />
                            My Profile
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                          >
                            <Package className="h-5 w-5" />
                            My Orders
                          </Link>
                          <Link
                            to="/quotations"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                          >
                            <FileText className="h-5 w-5" />
                            My Quotations
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                            >
                              <Settings className="h-5 w-5" />
                              Admin Panel
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => {
                              signOut();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start gap-3 text-lg font-medium text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                          >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Link
                          to="/auth"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                        >
                          <User className="h-5 w-5" />
                          Sign In
                        </Link>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Request Quotation Dialog */}
      <RequestQuotationDialog 
        open={quotationDialogOpen} 
        onOpenChange={setQuotationDialogOpen}
      />

      {/* Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />
    </>
  );
};

export default Header;
