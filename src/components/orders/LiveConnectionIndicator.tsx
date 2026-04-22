import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveConnectionIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date | null;
}

export default function LiveConnectionIndicator({ 
  isConnected, 
  lastUpdate 
}: LiveConnectionIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-muted-foreground">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Connecting...</span>
          </>
        )}
      </div>
      
      {lastUpdate && isConnected && (
        <span className="text-xs text-muted-foreground">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
