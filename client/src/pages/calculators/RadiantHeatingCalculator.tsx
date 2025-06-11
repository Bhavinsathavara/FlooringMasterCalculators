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
  heatingType: z.enum(['electric', 'hydronic']),
  flooringType: z.enum(['tile', 'stone', 'engineered-wood', 'laminate']),
  insulationRValue: z.number().min(1).max(50),
  targetTemp: z.number().min(65).max(85),
});

type FormData = z.infer<typeof formSchema>;

interface RadiantResults {
  roomArea: number;
  heatingArea: number;
  powerRequired: number;
  cableLength: number;
  matQuantity: number;
  thermostatNeeded: number;
  installationCost: number;
  operatingCost: number;
  totalProjectCost: number;
}

export default function RadiantHeatingCalculator() {
  const [results, setResults] = useState<RadiantResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      heatingType: 'electric',
      flooringType: 'tile',
      insulationRValue: 10,
      targetTemp: 75,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const heatingArea = roomArea * 0.9; // 90% coverage typical

    const powerDensity = data.heatingType === 'electric' ? 12 : 8; // watts per sq ft
    const powerRequired = heatingArea * powerDensity;
    
    const cableLength = data.heatingType === 'electric' ? heatingArea * 3.3 : 0;
    const matQuantity = Math.ceil(heatingArea / 10.76); // 10.76 sq ft per mat
    const thermostatNeeded = 1;

    const materialCost = data.heatingType === 'electric' ? 
      (heatingArea * 8) + (thermostatNeeded * 275) :
      (heatingArea * 12) + (thermostatNeeded * 350);
    
    const laborCost = heatingArea * 4.5;
    const installationCost = materialCost + laborCost;

    const dailyUsage = powerRequired * 8 / 1000; // 8 hours operation
    const operatingCost = dailyUsage * 0.12 * 120; // Annual estimate

    const totalProjectCost = installationCost;

    setResults({
      roomArea,
      heatingArea,
      powerRequired,
      cableLength,
      matQuantity,
      thermostatNeeded,
      installationCost,
      operatingCost,
      totalProjectCost,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Radiant Floor Heating Calculator"
      description="Calculate radiant floor heating requirements for electric and hydronic systems."
      metaTitle="Radiant Floor Heating Calculator - Underfloor Heating | FlooringCalc Pro"
      metaDescription="Calculate radiant floor heating materials and costs for electric and hydronic underfloor heating systems."
      keywords={['radiant heating calculator', 'underfloor heating calculator', 'floor heating system calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Heating Specifications</h4>
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
                name="heatingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heating Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="hydronic">Hydronic (Water)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="stone">Stone</SelectItem>
                        <SelectItem value="engineered-wood">Engineered Wood</SelectItem>
                        <SelectItem value="laminate">Laminate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Heating Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Heating Analysis</h4>
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="concrete" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">System Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Heating Area:</span>
                      <span className="font-semibold">{results.heatingArea.toFixed(0)} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Power Required:</span>
                      <span className="font-semibold">{results.powerRequired.toFixed(0)} watts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalProjectCost.toFixed(0)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔥</div>
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