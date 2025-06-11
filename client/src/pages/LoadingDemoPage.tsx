import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, FlooringPatternSpinner, FloatingDotsSpinner, PulseSpinner } from '@/components/ui/loading-spinner';
import LoadingOverlay from '@/components/LoadingOverlay';
import Calculator from '@/components/Calculator';

export default function LoadingDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const flooringThemes = [
    { key: 'hardwood', name: 'Hardwood', color: 'bg-amber-100 border-amber-300' },
    { key: 'tile', name: 'Tile', color: 'bg-slate-100 border-slate-300' },
    { key: 'carpet', name: 'Carpet', color: 'bg-red-100 border-red-300' },
    { key: 'vinyl', name: 'Vinyl', color: 'bg-gray-100 border-gray-300' },
    { key: 'bamboo', name: 'Bamboo', color: 'bg-green-100 border-green-300' },
    { key: 'cork', name: 'Cork', color: 'bg-orange-100 border-orange-300' },
    { key: 'concrete', name: 'Concrete', color: 'bg-stone-100 border-stone-300' },
    { key: 'laminate', name: 'Laminate', color: 'bg-yellow-100 border-yellow-300' }
  ] as const;

  const spinnerVariants = [
    { key: 'spinner', name: 'Classic Spinner', component: LoadingSpinner },
    { key: 'pattern', name: 'Flooring Pattern', component: FlooringPatternSpinner },
    { key: 'dots', name: 'Floating Dots', component: FloatingDotsSpinner },
    { key: 'pulse', name: 'Pulse Animation', component: PulseSpinner }
  ];

  const startDemo = (demoKey: string) => {
    setActiveDemo(demoKey);
    setTimeout(() => setActiveDemo(null), 3000);
  };

  return (
    <Calculator
      title="Loading Animation Demo"
      description="Explore our flooring-themed loading animations designed for different calculator types"
      metaTitle="Flooring Calculator Loading Animations Demo"
      metaDescription="Interactive demo showcasing themed loading spinners for flooring calculators with hardwood, tile, carpet, and more material-specific animations."
      keywords={['loading animations', 'flooring themes', 'calculator UI', 'user experience']}
    >
      <div className="space-y-8">
        {/* Spinner Variants Section */}
        <Card>
          <CardHeader>
            <CardTitle>Spinner Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {spinnerVariants.map(({ key, name, component: Component }) => (
                <div key={key} className="text-center space-y-4">
                  <h3 className="font-medium text-sm">{name}</h3>
                  <div className="flex justify-center items-center h-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Component size="lg" theme="hardwood" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flooring Themes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Flooring Material Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flooringThemes.map(({ key, name, color }) => (
                <div key={key} className={`p-4 rounded-lg border-2 ${color} text-center space-y-3`}>
                  <h3 className="font-medium text-sm">{name}</h3>
                  <div className="flex justify-center">
                    <FlooringPatternSpinner size="md" theme={key as any} />
                  </div>
                  <div className="flex justify-center space-x-2">
                    <LoadingSpinner size="sm" theme={key as any} />
                    <FloatingDotsSpinner size="sm" theme={key as any} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo Section */}
        <Card className="relative">
          <CardHeader>
            <CardTitle>Interactive Loading Overlay Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flooringThemes.map(({ key, name }) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => startDemo(key)}
                  disabled={activeDemo !== null}
                  className="h-20 flex flex-col space-y-2"
                >
                  <FlooringPatternSpinner size="sm" theme={key as any} />
                  <span className="text-xs">{name} Demo</span>
                </Button>
              ))}
            </div>
            
            <LoadingOverlay
              isLoading={activeDemo !== null}
              theme={activeDemo as any}
              variant="pattern"
              className="rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Size Comparison Section */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <h3 className="font-medium">Small (sm)</h3>
                <div className="flex justify-center items-center h-12 bg-gray-50 dark:bg-gray-800 rounded">
                  <FlooringPatternSpinner size="sm" theme="hardwood" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Medium (md)</h3>
                <div className="flex justify-center items-center h-16 bg-gray-50 dark:bg-gray-800 rounded">
                  <FlooringPatternSpinner size="md" theme="tile" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Large (lg)</h3>
                <div className="flex justify-center items-center h-20 bg-gray-50 dark:bg-gray-800 rounded">
                  <FlooringPatternSpinner size="lg" theme="bamboo" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Basic Usage:</h4>
              <code className="text-sm">
                {`<LoadingSpinner theme="hardwood" size="md" />`}
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Pattern Spinner:</h4>
              <code className="text-sm">
                {`<FlooringPatternSpinner theme="tile" size="lg" />`}
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Full Overlay:</h4>
              <code className="text-sm">
                {`<LoadingOverlay isLoading={true} theme="bamboo" variant="pattern" />`}
              </code>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>Available Themes:</strong> hardwood, tile, carpet, vinyl, bamboo, cork, concrete, laminate, default</p>
              <p><strong>Available Sizes:</strong> sm, md, lg</p>
              <p><strong>Spinner Variants:</strong> spinner, pattern, dots, pulse</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Calculator>
  );
}