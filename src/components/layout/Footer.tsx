import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground pb-[env(safe-area-inset-bottom)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Graven Automation</h3>
            <p className="text-sm text-secondary-foreground/80">
              A complete solution for industrial automation. Variable Frequency Drives, PLCs, HMIs, and expert technical support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-sm hover:text-primary transition-colors">Shop</Link></li>
              <li><Link to="/about" className="text-sm hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-md font-semibold mb-4">Policies</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/shipping" className="text-sm hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="text-sm hover:text-primary transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-md font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:sales@gravenautomation.com" className="text-sm hover:text-primary transition-colors">
                  sales@gravenautomation.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} Graven Automation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
