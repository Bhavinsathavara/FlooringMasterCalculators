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
  moldingType: z.enum(['quarter-round', 'shoe-molding', 'crown-molding', 'chair-rail', 'wainscoting']),
  material: z.enum(['pine', 'oak', 'maple', 'mdf', 'pvc']),
  doors: z.number().min(0),
  windows: z.number().min(0),
  wastePercentage: z.number().min(10).max(25),
});

type FormData = z.infer<typeof formSchema>;

interface MoldingResults {
  totalPerimeter: number;
  adjustedLength: number;
  moldingNeeded: number;
  nailsNeeded: number;
  caulkNeeded: number;
  totalCost: number;
  cuttingList: string[];
}

export default function MoldingCalculator() {
  const [results, setResults] = useState<MoldingResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      moldingType: 'quarter-round',
      material: 'pine',
      doors: 1,
      windows: 2,
      wastePercentage: 15,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const perimeter = (data.roomLength + data.roomWidth) * 2;
    const doorDeduction = data.doors * 3; // 3 feet per door
    const windowDeduction = data.windows * 4; // 4 feet per window
    const netPerimeter = perimeter - doorDeduction - windowDeduction;
    const adjustedLength = netPerimeter * (1 + data.wastePercentage / 100);

    const moldingNeeded = Math.ceil(adjustedLength / 8); // 8 ft pieces
    const nailsNeeded = Math.ceil(adjustedLength / 12); // 1 lb per 12 ft
    const caulkNeeded = Math.ceil(adjustedLength / 350); // 1 tube per 350 ft

    const materialCosts = {
      pine: 2.85,
      oak: 5.25,
      maple: 6.15,
      mdf: 1.95,
      pvc: 4.35
    };

    const materialCost = moldingNeeded * materialCosts[data.material];
    const nailCost = nailsNeeded * 8.50;
    const caulkCost = caulkNeeded * 4.25;
    const totalCost = materialCost + nailCost + caulkCost;

    const cuttingList = [
      `${Math.floor(adjustedLength / 8)} full 8-foot pieces`,
      `1 piece at ${(adjustedLength % 8).toFixed(1)} feet`,
      'Cut 45° miters for inside corners',
      'Cut 90° joints for outside corners'
    ];

    setResults({
      totalPerimeter: perimeter,
      adjustedLength,
      moldingNeeded,
      nailsNeeded,
      caulkNeeded,
      totalCost,
      cuttingList,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Molding Calculator"
      description="Calculate molding and trim requirements for room finishing."
      metaTitle="Molding Calculator - Trim & Molding Calculator | FlooringCalc Pro"
      metaDescription="Calculate molding materials for baseboards, crown molding, and trim. Professional molding calculator with cutting lists."
      keywords={['molding calculator', 'trim calculator', 'baseboard calculator', 'crown molding calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room & Molding Details</h4>
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
                name="moldingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molding Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quarter-round">Quarter Round</SelectItem>
                        <SelectItem value="shoe-molding">Shoe Molding</SelectItem>
                        <SelectItem value="crown-molding">Crown Molding</SelectItem>
                        <SelectItem value="chair-rail">Chair Rail</SelectItem>
                        <SelectItem value="wainscoting">Wainscoting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Doors</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="windows"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Windows</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Molding Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="hardwood" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Material Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Molding Pieces:</span>
                      <span className="font-semibold">{results.moldingNeeded} pieces</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Length:</span>
                      <span className="font-semibold">{results.adjustedLength.toFixed(1)} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📐</div>
                    <p className="text-sm">Enter room details to calculate</p>
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