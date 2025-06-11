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
  roomLength: z.number().min(0.1),
  roomWidth: z.number().min(0.1),
  occupancyType: z.enum(['residential', 'office', 'retail', 'warehouse', 'industrial']),
  flooringWeight: z.number().min(1).max(20),
  additionalLoad: z.number().min(0),
  safetyFactor: z.number().min(1.5).max(3),
});

type FormData = z.infer<typeof formSchema>;

interface LoadResults {
  roomArea: number;
  deadLoad: number;
  liveLoad: number;
  totalLoad: number;
  loadPerSqFt: number;
  structuralRequirements: string;
  recommendations: string[];
}

export default function FloorLoadCalculator() {
  const [results, setResults] = useState<LoadResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      occupancyType: 'residential',
      flooringWeight: 4,
      additionalLoad: 0,
      safetyFactor: 2,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const roomArea = data.roomLength * data.roomWidth;
    
    const liveLoads = {
      residential: 40,
      office: 50,
      retail: 75,
      warehouse: 125,
      industrial: 150
    };

    const deadLoad = data.flooringWeight + 10; // flooring + structure
    const liveLoad = liveLoads[data.occupancyType];
    const totalLoad = (deadLoad + liveLoad + data.additionalLoad) * data.safetyFactor;
    const loadPerSqFt = totalLoad;

    let structuralRequirements = 'Standard construction adequate';
    if (totalLoad > 150) {
      structuralRequirements = 'Reinforced framing required';
    } else if (totalLoad > 100) {
      structuralRequirements = 'Enhanced structural support recommended';
    }

    const recommendations = [
      'Verify with structural engineer for critical applications',
      'Check local building codes for specific requirements',
      'Consider point loads from heavy equipment',
      'Ensure adequate bearing surfaces at supports'
    ];

    setResults({
      roomArea,
      deadLoad,
      liveLoad,
      totalLoad,
      loadPerSqFt,
      structuralRequirements,
      recommendations,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Floor Load Calculator"
      description="Calculate structural floor load requirements for different occupancy types."
      metaTitle="Floor Load Calculator - Structural Load Calculator | FlooringCalc Pro"
      metaDescription="Calculate floor load requirements for structural design. Professional floor load calculator for dead and live loads."
      keywords={['floor load calculator', 'structural load calculator', 'building load calculator', 'floor capacity calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Load Analysis</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Length (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
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
                  name="roomWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Width (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
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
                name="occupancyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupancy Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential (40 PSF)</SelectItem>
                        <SelectItem value="office">Office (50 PSF)</SelectItem>
                        <SelectItem value="retail">Retail (75 PSF)</SelectItem>
                        <SelectItem value="warehouse">Warehouse (125 PSF)</SelectItem>
                        <SelectItem value="industrial">Industrial (150 PSF)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Load Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="concrete" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Load Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(0)} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dead Load:</span>
                      <span className="font-semibold">{results.deadLoad} PSF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Live Load:</span>
                      <span className="font-semibold">{results.liveLoad} PSF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Load:</span>
                      <span className="font-semibold text-primary">{results.totalLoad.toFixed(0)} PSF</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <span className="font-medium text-blue-800">{results.structuralRequirements}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">⚖️</div>
                    <p className="text-sm">Enter load details to calculate</p>
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