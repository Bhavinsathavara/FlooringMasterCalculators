import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  theme?: "hardwood" | "tile" | "carpet" | "vinyl" | "bamboo" | "cork" | "concrete" | "laminate" | "default";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
};

const themeColors = {
  hardwood: "text-amber-600",
  tile: "text-slate-600", 
  carpet: "text-red-600",
  vinyl: "text-gray-600",
  bamboo: "text-green-600",
  cork: "text-orange-600", 
  concrete: "text-stone-600",
  laminate: "text-yellow-600",
  default: "text-blue-600"
};

export function LoadingSpinner({ 
  size = "md", 
  theme = "default", 
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("inline-block animate-spin", sizeClasses[size], className)}>
      <svg
        className={cn("animate-spin", themeColors[theme])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"
        />
      </svg>
    </div>
  );
}

export function FlooringPatternSpinner({ 
  size = "md", 
  theme = "hardwood",
  className 
}: LoadingSpinnerProps) {
  const patternElements: Record<string, JSX.Element> = {
    hardwood: (
      <div className="relative">
        <div className="flex space-x-0.5 animate-pulse">
          <div className="w-2 bg-amber-600 rounded-sm animate-bounce" style={{ height: '20px', animationDelay: '0ms' }}></div>
          <div className="w-2 bg-amber-700 rounded-sm animate-bounce" style={{ height: '16px', animationDelay: '150ms' }}></div>
          <div className="w-2 bg-amber-500 rounded-sm animate-bounce" style={{ height: '24px', animationDelay: '300ms' }}></div>
          <div className="w-2 bg-amber-800 rounded-sm animate-bounce" style={{ height: '18px', animationDelay: '450ms' }}></div>
        </div>
      </div>
    ),
    tile: (
      <div className="grid grid-cols-2 gap-0.5 animate-pulse">
        <div className="w-3 h-3 bg-slate-600 animate-ping" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-slate-500 animate-ping" style={{ animationDelay: '200ms' }}></div>
        <div className="w-3 h-3 bg-slate-700 animate-ping" style={{ animationDelay: '400ms' }}></div>
        <div className="w-3 h-3 bg-slate-600 animate-ping" style={{ animationDelay: '600ms' }}></div>
      </div>
    ),
    carpet: (
      <div className="relative">
        <div className="flex flex-wrap w-8 animate-pulse">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i}
              className="w-1 h-1 bg-red-600 rounded-full m-0.5 animate-bounce"
              style={{ animationDelay: `${i * 100}ms` }}
            ></div>
          ))}
        </div>
      </div>
    ),
    vinyl: (
      <div className="flex space-x-1 animate-pulse">
        <div className="w-6 h-2 bg-gray-600 rounded animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-6 h-2 bg-gray-500 rounded animate-bounce" style={{ animationDelay: '200ms' }}></div>
        <div className="w-6 h-2 bg-gray-700 rounded animate-bounce" style={{ animationDelay: '400ms' }}></div>
      </div>
    ),
    bamboo: (
      <div className="flex space-x-0.5 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="w-1.5 bg-green-600 rounded-full animate-bounce"
            style={{ 
              height: `${16 + Math.sin(i) * 4}px`,
              animationDelay: `${i * 150}ms` 
            }}
          ></div>
        ))}
      </div>
    ),
    cork: (
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-orange-600 animate-spin"></div>
        <div className="absolute inset-1 rounded-full border-2 border-orange-500 animate-ping"></div>
        <div className="absolute inset-2 rounded-full bg-orange-600 animate-pulse"></div>
      </div>
    ),
    concrete: (
      <div className="flex space-x-1">
        <div className="w-2 h-6 bg-stone-600 animate-pulse"></div>
        <div className="w-2 h-4 bg-stone-500 animate-pulse" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-8 bg-stone-700 animate-pulse" style={{ animationDelay: '400ms' }}></div>
        <div className="w-2 h-5 bg-stone-600 animate-pulse" style={{ animationDelay: '600ms' }}></div>
      </div>
    ),
    laminate: (
      <div className="flex space-x-0.5 animate-pulse">
        <div className="w-3 h-6 bg-yellow-600 rounded animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-4 bg-yellow-500 rounded animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-8 bg-yellow-700 rounded animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    ),
    default: (
      <div className="flex space-x-0.5 animate-pulse">
        <div className="w-2 bg-blue-600 rounded-sm animate-bounce" style={{ height: '20px', animationDelay: '0ms' }}></div>
        <div className="w-2 bg-blue-700 rounded-sm animate-bounce" style={{ height: '16px', animationDelay: '150ms' }}></div>
        <div className="w-2 bg-blue-500 rounded-sm animate-bounce" style={{ height: '24px', animationDelay: '300ms' }}></div>
        <div className="w-2 bg-blue-800 rounded-sm animate-bounce" style={{ height: '18px', animationDelay: '450ms' }}></div>
      </div>
    )
  };

  return (
    <div className={cn("inline-flex items-center justify-center", sizeClasses[size], className)}>
      {patternElements[theme] || patternElements.default}
    </div>
  );
}

export function FloatingDotsSpinner({
  size = "md",
  theme = "default",
  className
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            themeColors[theme],
            size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"
          )}
          style={{ 
            backgroundColor: 'currentColor',
            animationDelay: `${i * 200}ms`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
}

export function PulseSpinner({
  size = "md", 
  theme = "default",
  className
}: LoadingSpinnerProps) {
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className={cn("absolute inset-0 rounded-full animate-ping", themeColors[theme])} 
           style={{ backgroundColor: 'currentColor', opacity: 0.75 }}></div>
      <div className={cn("relative rounded-full", themeColors[theme])} 
           style={{ backgroundColor: 'currentColor', width: '100%', height: '100%' }}></div>
    </div>
  );
}