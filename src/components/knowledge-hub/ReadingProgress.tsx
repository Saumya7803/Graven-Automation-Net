import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
      <div
        className={cn("h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-150")}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
