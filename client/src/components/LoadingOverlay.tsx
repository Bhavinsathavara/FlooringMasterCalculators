import { LoadingSpinner, FlooringPatternSpinner, FloatingDotsSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  theme?: "hardwood" | "tile" | "carpet" | "vinyl" | "bamboo" | "cork" | "concrete" | "laminate" | "default";
  variant?: "spinner" | "pattern" | "dots";
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingOverlay({
  isLoading,
  message = "Calculating...",
  theme = "default",
  variant = "spinner",
  fullScreen = false,
  className
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  const getLoadingComponent = () => {
    switch (variant) {
      case "pattern":
        return <FlooringPatternSpinner size="lg" theme={theme} />;
      case "dots":
        return <FloatingDotsSpinner size="lg" theme={theme} />;
      default:
        return <LoadingSpinner size="lg" theme={theme} />;
    }
  };

  const getThemeMessage = () => {
    const themeMessages = {
      hardwood: "Calculating hardwood specifications...",
      tile: "Computing tile requirements...",
      carpet: "Measuring carpet needs...",
      vinyl: "Determining vinyl quantities...",
      bamboo: "Calculating bamboo flooring...",
      cork: "Computing cork specifications...",
      concrete: "Analyzing concrete requirements...",
      laminate: "Calculating laminate needs...",
      default: "Processing calculations..."
    };
    return themeMessages[theme] || message;
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-xl max-w-sm mx-4">
          <div className="flex flex-col items-center space-y-4">
            {getLoadingComponent()}
            <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
              {getThemeMessage()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg",
      className
    )}>
      <div className="flex flex-col items-center space-y-3">
        {getLoadingComponent()}
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {getThemeMessage()}
        </p>
      </div>
    </div>
  );
}