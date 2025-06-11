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
  numberOfSteps: z.number().min(1, 'Must have at least 1 step'),
  stepWidth: z.number().min(12, 'Step width must be at least 12 inches'),
  stepDepth: z.number().min(10, 'Step depth must be at least 10 inches'),
  flooringType: z.enum(['hardwood', 'laminate', 'vinyl', 'carpet', 'tile']),
  nosing: z.boolean().default(true),
  riserCovering: z.boolean().default(false),
  wastePercentage: z.number().min(5).max(25),
  materialCost: z.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

interface StairResults {
  totalTreads: number;
  totalRisers: number;
  treadArea: number;
  riserArea: number;
  totalArea: number;
  adjustedArea: number;
  nosingNeeded: number;
  transitionStrips: number;
  totalCost: number;
  installationTips: string[];
}

export default function StairCalculator() {
  const [results, setResults] = useState<StairResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfSteps: 0,
      stepWidth: 36,
      stepDepth: 11,
      flooringType: 'hardwood',
      nosing: true,
      riserCovering: false,
      wastePercentage: 15,
      materialCost: 6.75,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalTreads = data.numberOfSteps;
    const totalRisers = data.riserCovering ? data.numberOfSteps : 0;
    
    const treadArea = (totalTreads * data.stepWidth * data.stepDepth) / 144; // sq ft
    const riserArea = totalRisers > 0 ? (totalRisers * data.stepWidth * 7.5) / 144 : 0; // Assume 7.5" riser height
    const totalArea = treadArea + riserArea;
    const adjustedArea = totalArea * (1 + data.wastePercentage / 100);

    const nosingNeeded = data.nosing ? Math.ceil((totalTreads * data.stepWidth) / 12) : 0; // Linear feet
    const transitionStrips = 2; // Top and bottom transitions

    const totalCost = (adjustedArea * data.materialCost) + (nosingNeeded * 8) + (transitionStrips * 25);

    const installationTips = [
      'Measure each step individually as they may vary',
      'Use appropriate stair nosing for safety and code compliance',
      'Ensure proper expansion gaps at walls',
      'Consider professional installation for curved stairs',
      'Test fit all pieces before final installation',
      'Use construction adhesive for secure attachment'
    ];

    setResults({
      totalTreads,
      totalRisers,
      treadArea,
      riserArea,
      totalArea,
      adjustedArea,
      nosingNeeded,
      transitionStrips,
      totalCost,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Stair Flooring Calculator"
      description="Calculate flooring materials needed for stairs including treads, risers, and nosing."
      metaTitle="Stair Flooring Calculator - Stair Tread & Riser Calculator | FlooringCalc Pro"
      metaDescription="Calculate stair flooring materials for treads, risers, and nosing. Professional stair calculator for hardwood, laminate, and vinyl installations."
      keywords={['stair flooring calculator', 'stair tread calculator', 'stair riser calculator', 'stair nosing calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Stair Specifications</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="numberOfSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Steps</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Number of steps"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stepWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="36"
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
                  name="stepDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Depth (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="11"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="flooringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flooring Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select flooring type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hardwood">Hardwood</SelectItem>
                        <SelectItem value="laminate">Laminate</SelectItem>
                        <SelectItem value="vinyl">Vinyl Plank</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nosing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Stair Nosing</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Safety edge trim
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riserCovering"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Cover Risers</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Vertical face covering
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wastePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="15"
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
                  name="materialCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost per Sq Ft ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="6.75"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Stair Materials'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="hardwood"
              variant="pattern"
            />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Stair Components</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Treads:</span>
                      <span className="font-semibold">{results.totalTreads} pieces</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tread Area:</span>
                      <span className="font-semibold">{results.treadArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.totalRisers > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Risers:</span>
                          <span className="font-semibold">{results.totalRisers} pieces</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Riser Area:</span>
                          <span className="font-semibold">{results.riserArea.toFixed(2)} sq ft</span>
                        </div>
                      </>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Area:</span>
                        <span className="font-semibold text-primary">{results.adjustedArea.toFixed(2)} sq ft</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🪜</div>
                    <p className="text-sm">Enter stair details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Additional Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    {results.nosingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Nosing Needed:</span>
                        <span className="font-semibold">{results.nosingNeeded} linear ft</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Transition Strips:</span>
                      <span className="font-semibold">{results.transitionStrips} pieces</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Additional materials will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Installation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.installationTips.map((tip, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Calculator>
  );
}