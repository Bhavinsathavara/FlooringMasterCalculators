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
  finishType: z.enum(['polyurethane', 'water-based', 'oil-based', 'wax', 'penetrating-sealer']),
  coats: z.number().min(1).max(5),
  floorCondition: z.enum(['new', 'previously-finished', 'bare-wood']),
  applicationMethod: z.enum(['brush', 'roller', 'spray']),
});

type FormData = z.infer<typeof formSchema>;

interface FinishingResults {
  roomArea: number;
  finishNeeded: number;
  primerNeeded: number;
  sandingSupplies: number;
  totalCost: number;
  dryingTime: string;
  applicationSteps: string[];
}

export default function FloorFinishingCalculator() {
  const [results, setResults] = useState<FinishingResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      finishType: 'polyurethane',
      coats: 3,
      floorCondition: 'new',
      applicationMethod: 'brush',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const roomArea = data.roomLength * data.roomWidth;
    
    const coverageRates = {
      polyurethane: 500,
      'water-based': 450,
      'oil-based': 400,
      wax: 600,
      'penetrating-sealer': 350
    };

    const coverage = coverageRates[data.finishType];
    const finishPerCoat = roomArea / coverage;
    const finishNeeded = Math.ceil(finishPerCoat * data.coats);

    const needsPrimer = data.floorCondition === 'bare-wood';
    const primerNeeded = needsPrimer ? Math.ceil(roomArea / 400) : 0;

    const sandingSupplies = data.floorCondition !== 'new' ? 85 : 0;

    const finishCosts = {
      polyurethane: 65,
      'water-based': 75,
      'oil-based': 55,
      wax: 45,
      'penetrating-sealer': 50
    };

    const finishCost = finishNeeded * finishCosts[data.finishType];
    const primerCost = primerNeeded * 45;
    const totalCost = finishCost + primerCost + sandingSupplies;

    const dryingTimes = {
      polyurethane: '8-12 hours between coats',
      'water-based': '2-4 hours between coats',
      'oil-based': '12-24 hours between coats',
      wax: '30 minutes between coats',
      'penetrating-sealer': '4-6 hours between coats'
    };

    const applicationSteps = [
      'Ensure room temperature is 65-75°F',
      'Clean floor thoroughly with tack cloth',
      needsPrimer ? 'Apply primer and allow to dry' : '',
      'Apply thin, even coats with chosen method',
      'Sand lightly between coats with 220 grit',
      'Apply final coat without sanding',
      'Allow 24-48 hours before light traffic'
    ].filter(Boolean);

    setResults({
      roomArea,
      finishNeeded,
      primerNeeded,
      sandingSupplies,
      totalCost,
      dryingTime: dryingTimes[data.finishType],
      applicationSteps,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Floor Finishing Calculator"
      description="Calculate materials needed for hardwood floor finishing and refinishing projects."
      metaTitle="Floor Finishing Calculator - Wood Floor Refinishing Calculator | FlooringCalc Pro"
      metaDescription="Calculate floor finishing materials for polyurethane, stain, and wood floor refinishing projects."
      keywords={['floor finishing calculator', 'wood floor refinishing calculator', 'polyurethane calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Finishing Project Details</h4>
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
                name="finishType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finish Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="polyurethane">Polyurethane</SelectItem>
                        <SelectItem value="water-based">Water-Based Finish</SelectItem>
                        <SelectItem value="oil-based">Oil-Based Finish</SelectItem>
                        <SelectItem value="wax">Paste Wax</SelectItem>
                        <SelectItem value="penetrating-sealer">Penetrating Sealer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Coats</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Coat</SelectItem>
                        <SelectItem value="2">2 Coats</SelectItem>
                        <SelectItem value="3">3 Coats (Recommended)</SelectItem>
                        <SelectItem value="4">4 Coats</SelectItem>
                        <SelectItem value="5">5 Coats</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Finishing Materials'}
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
                      <span className="font-medium">Floor Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(0)} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Finish Needed:</span>
                      <span className="font-semibold">{results.finishNeeded} gallons</span>
                    </div>
                    {results.primerNeeded > 0 && (
                      <div className="flex justify-between">
                        <span className="font-medium">Primer Needed:</span>
                        <span className="font-semibold">{results.primerNeeded} gallons</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Drying Time:</span>
                      <span className="font-semibold text-blue-600">{results.dryingTime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🎨</div>
                    <p className="text-sm">Enter project details to calculate</p>
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