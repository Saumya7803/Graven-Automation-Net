import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-3">You're Offline</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold mb-3">Available Offline:</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Recently viewed products</li>
            <li>• Cached product catalog</li>
            <li>• Your cart items</li>
            <li>• Previously loaded pages</li>
          </ul>
        </div>

        <Button onClick={handleRetry} size="lg" className="w-full">
          <RefreshCw className="mr-2 h-5 w-5" />
          Try Again
        </Button>

        <p className="text-sm text-muted-foreground mt-4">
          The app will automatically reconnect when your internet is back
        </p>
      </div>
    </div>
  );
};

export default Offline;
