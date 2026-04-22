import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, List, Share2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import KnowledgeHubSidebar from "./KnowledgeHubSidebar";
import { useToast } from "@/hooks/use-toast";

interface MobileKnowledgeNavProps {
  currentSlug?: string;
  onTocClick: () => void;
}

const MobileKnowledgeNav = ({ currentSlug, onTocClick }: MobileKnowledgeNavProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="flex items-center justify-around py-2 px-4">
        {/* Home/Hub */}
        <Link to="/vfd-guide">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
            <Home className="h-5 w-5" />
            <span className="text-xs">Hub</span>
          </Button>
        </Link>

        {/* Table of Contents */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTocClick}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <List className="h-5 w-5" />
          <span className="text-xs">Contents</span>
        </Button>

        {/* All Guides */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
              <Menu className="h-5 w-5" />
              <span className="text-xs">Guides</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>All VFD Guides</SheetTitle>
            </SheetHeader>
            <KnowledgeHubSidebar currentSlug={currentSlug} />
          </SheetContent>
        </Sheet>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileKnowledgeNav;
