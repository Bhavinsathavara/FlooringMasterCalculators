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
  flooringType: z.enum(['hardwood', 'laminate', 'vinyl', 'tile', 'carpet']),
  damageType: z.enum(['scratches', 'water-damage', 'burn-marks', 'gouges', 'loose-boards']),
  damageArea: z.number().min(0.1),
  repairMethod: z.enum(['sand-refinish', 'patch-repair', 'board-replacement', 'spot-treatment']),
});

type FormData = z.infer<typeof formSchema>;

interface RepairResults {
  materialCost: number;
  laborHours: number;
  totalCost: number;
  repairSteps: string[];
}

export default function FloorRepairCalculator() {
  const [results, setResults] = useState<RepairResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flooringType: 'hardwood',
      damageType: 'scratches',
      damageArea: 0,
      repairMethod: 'sand-refinish',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const materialCosts = {
      'sand-refinish': data.damageArea * 2.5,
      'patch-repair': data.damageArea * 8.0,
      'board-replacement': data.damageArea * 12.0,
      'spot-treatment': data.damageArea * 1.5
    };

    const laborRates = {
      'sand-refinish': 6,
      'patch-repair': 4,
      'board-replacement': 8,
      'spot-treatment': 2
    };

    const materialCost = materialCosts[data.repairMethod];
    const laborHours = Math.ceil(data.damageArea * laborRates[data.repairMethod] / 10);
    const totalCost = materialCost + (laborHours * 65);

    const repairSteps = [
      'Assess damage extent and cause',
      'Clean area thoroughly',
      'Apply repair method',
      'Allow proper cure time',
      'Apply finish to match existing'
    ];

    setResults({
      materialCost,
      laborHours,
      totalCost,
      repairSteps,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Floor Repair Calculator"
      description="Calculate costs and materials for repairing damaged flooring."
      metaTitle="Floor Repair Calculator - Flooring Damage Repair Cost | FlooringCalc Pro"
      metaDescription="Calculate floor repair costs for scratches, water damage, and other flooring issues. Professional floor repair calculator."
      keywords={['floor repair calculator', 'flooring damage repair', 'hardwood repair calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Damage Assessment</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="flooringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flooring Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hardwood">Hardwood</SelectItem>
                        <SelectItem value="laminate">Laminate</SelectItem>
                        <SelectItem value="vinyl">Vinyl</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="damageArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage Area (sq ft)</FormLabel>
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
                {isCalculating ? 'Calculating...' : 'Calculate Repair Cost'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="hardwood" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Repair Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Material Cost:</span>
                      <span className="font-semibold">${results.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Enter damage details to calculate</p>
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