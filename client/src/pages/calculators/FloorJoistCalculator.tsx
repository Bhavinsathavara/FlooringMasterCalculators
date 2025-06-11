import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calculator from '@/components/Calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LoadingOverlay from '@/components/LoadingOverlay';

const formSchema = z.object({
  spanLength: z.number().min(6).max(32),
  joistSpacing: z.enum(['12', '16', '19.2', '24']),
  lumberGrade: z.enum(['select-structural', 'no1', 'no2', 'stud']),
  species: z.enum(['douglas-fir', 'southern-pine', 'hem-fir', 'spruce-pine-fir']),
  loadType: z.enum(['residential', 'commercial-light', 'commercial-heavy']),
  deflectionLimit: z.enum(['L/240', 'L/360', 'L/480']),
});

type FormData = z.infer<typeof formSchema>;

interface JoistResults {
  recommendedSize: string;
  maxSpan: number;
  deflection: string;
  loadCapacity: number;
  materialCost: number;
  installationTips: string[];
}

export default function FloorJoistCalculator() {
  const [results, setResults] = useState<JoistResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spanLength: 0,
      joistSpacing: '16',
      lumberGrade: 'no2',
      species: 'douglas-fir',
      loadType: 'residential',
      deflectionLimit: 'L/360',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simplified joist sizing logic
    const loads = {
      'residential': 40,
      'commercial-light': 50,
      'commercial-heavy': 80
    };

    const baseLoad = loads[data.loadType];
    const spacing = parseFloat(data.joistSpacing);
    
    let recommendedSize = '2x8';
    let maxSpan = 12;
    
    if (data.spanLength <= 10) {
      recommendedSize = '2x8';
      maxSpan = 11.5;
    } else if (data.spanLength <= 14) {
      recommendedSize = '2x10';
      maxSpan = 15.2;
    } else if (data.spanLength <= 18) {
      recommendedSize = '2x12';
      maxSpan = 18.8;
    } else {
      recommendedSize = 'Engineered I-Joist';
      maxSpan = data.spanLength;
    }

    const deflection = data.deflectionLimit;
    const loadCapacity = baseLoad * (16 / spacing);
    
    const lumberCosts = {
      '2x8': 8.50,
      '2x10': 12.75,
      '2x12': 18.25,
      'Engineered I-Joist': 28.50
    };

    const joistsNeeded = Math.ceil(16 / spacing) + 1; // Per 16 feet
    const materialCost = joistsNeeded * lumberCosts[recommendedSize as keyof typeof lumberCosts];

    const installationTips = [
      'Check local building codes for span requirements',
      'Use proper hangers at beam connections',
      'Crown joists with bow up during installation',
      'Block or cross-bridge at mid-span for long spans',
      'Ensure proper bearing at supports',
      'Consider engineered lumber for longer spans'
    ];

    setResults({
      recommendedSize,
      maxSpan,
      deflection,
      loadCapacity,
      materialCost,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Floor Joist Calculator"
      description="Calculate floor joist requirements for structural flooring support."
      metaTitle="Floor Joist Calculator - Structural Joist Calculator | FlooringCalc Pro"
      metaDescription="Calculate floor joist sizing for structural support. Professional floor joist calculator with span tables and load calculations."
      keywords={['floor joist calculator', 'joist span calculator', 'structural joist calculator', 'floor framing calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Structural Requirements</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="spanLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Span Length (ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joistSpacing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joist Spacing (inches)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12">12" O.C.</SelectItem>
                        <SelectItem value="16">16" O.C.</SelectItem>
                        <SelectItem value="19.2">19.2" O.C.</SelectItem>
                        <SelectItem value="24">24" O.C.</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loadType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential (40 PSF)</SelectItem>
                        <SelectItem value="commercial-light">Commercial Light (50 PSF)</SelectItem>
                        <SelectItem value="commercial-heavy">Commercial Heavy (80 PSF)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Joist Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="hardwood" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Joist Specification</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Recommended Size:</span>
                      <span className="font-semibold text-primary">{results.recommendedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Max Span:</span>
                      <span className="font-semibold">{results.maxSpan.toFixed(1)} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Load Capacity:</span>
                      <span className="font-semibold">{results.loadCapacity} PSF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Material Cost:</span>
                      <span className="font-semibold text-green-600">${results.materialCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🏗️</div>
                    <p className="text-sm">Enter span details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Calculator>
  );
}