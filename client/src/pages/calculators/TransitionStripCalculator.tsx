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
  numberOfTransitions: z.number().min(1),
  transitionType: z.enum(['t-molding', 'reducer', 'threshold', 'quarter-round', 'stair-nose']),
  material: z.enum(['oak', 'maple', 'cherry', 'vinyl', 'aluminum', 'brass']),
  totalLength: z.number().min(0.1),
  wastePercentage: z.number().min(5).max(20),
});

type FormData = z.infer<typeof formSchema>;

interface TransitionResults {
  totalLength: number;
  adjustedLength: number;
  piecesNeeded: number;
  totalCost: number;
  installationTips: string[];
}

export default function TransitionStripCalculator() {
  const [results, setResults] = useState<TransitionResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfTransitions: 1,
      transitionType: 't-molding',
      material: 'oak',
      totalLength: 0,
      wastePercentage: 10,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const adjustedLength = data.totalLength * (1 + data.wastePercentage / 100);
    const pieceLength = 8; // 8 feet standard
    const piecesNeeded = Math.ceil(adjustedLength / pieceLength);

    const materialCosts = {
      oak: 12,
      maple: 14,
      cherry: 18,
      vinyl: 8,
      aluminum: 25,
      brass: 35
    };

    const totalCost = piecesNeeded * materialCosts[data.material];

    const installationTips = [
      'Measure exact length before ordering',
      'Account for expansion gaps at walls',
      'Pre-drill screw holes to prevent splitting',
      'Use appropriate fasteners for subfloor type'
    ];

    setResults({
      totalLength: data.totalLength,
      adjustedLength,
      piecesNeeded,
      totalCost,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Transition Strip Calculator"
      description="Calculate transition strip requirements for flooring installations."
      metaTitle="Transition Strip Calculator - Flooring Transition Calculator | FlooringCalc Pro"
      metaDescription="Calculate transition strips for flooring. Professional transition calculator for T-molding, reducers, and thresholds."
      keywords={['transition strip calculator', 'flooring transition calculator', 't-molding calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Transition Details</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="transitionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transition Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="t-molding">T-Molding</SelectItem>
                        <SelectItem value="reducer">Reducer Strip</SelectItem>
                        <SelectItem value="threshold">Threshold</SelectItem>
                        <SelectItem value="quarter-round">Quarter Round</SelectItem>
                        <SelectItem value="stair-nose">Stair Nose</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Length (ft)</FormLabel>
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

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Transition Materials'}
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
                      <span className="font-medium">Pieces Needed:</span>
                      <span className="font-semibold">{results.piecesNeeded} pieces</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔗</div>
                    <p className="text-sm">Enter details to calculate</p>
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