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

const formSchema = z.object({
  roomLength: z.number().min(0.1, 'Room length must be greater than 0'),
  roomWidth: z.number().min(0.1, 'Room width must be greater than 0'),
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'laminate', 'carpet']),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  includeUnderlayment: z.boolean(),
  includeTransitions: z.boolean(),
  includeMolding: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface MaterialResults {
  roomArea: number;
  adjustedArea: number;
  flooringNeeded: number;
  adhesiveNeeded: number;
  underlaymentNeeded: number;
  transitionStrips: number;
  moldingNeeded: number;
  nailsStaples: number;
  totalMaterialCost: number;
}

export default function MaterialQuantityCalculator() {
  const [results, setResults] = useState<MaterialResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      flooringType: 'tile',
      wastePercentage: 10,
      includeUnderlayment: false,
      includeTransitions: false,
      includeMolding: false,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    const perimeter = 2 * (data.roomLength + data.roomWidth);

    // Calculate materials based on flooring type
    let adhesiveNeeded = 0;
    let nailsStaples = 0;
    let flooringNeeded = adjustedArea;

    switch (data.flooringType) {
      case 'tile':
        adhesiveNeeded = Math.ceil(adjustedArea / 50); // 1 bag per 50 sq ft
        break;
      case 'hardwood':
        nailsStaples = Math.ceil(adjustedArea / 75); // 1 box per 75 sq ft
        break;
      case 'vinyl':
        adhesiveNeeded = Math.ceil(adjustedArea / 200); // 1 gallon per 200 sq ft for glue-down
        break;
      case 'laminate':
        // Floating floor - no adhesive needed typically
        break;
      case 'carpet':
        adhesiveNeeded = Math.ceil(adjustedArea / 150); // 1 gallon per 150 sq ft
        break;
    }

    const underlaymentNeeded = data.includeUnderlayment ? Math.ceil(adjustedArea) : 0;
    const transitionStrips = data.includeTransitions ? Math.ceil(perimeter / 8) : 0; // Estimate 1 per 8 ft
    const moldingNeeded = data.includeMolding ? Math.ceil(perimeter) : 0;

    // Rough material cost estimates (for demonstration)
    const materialCosts = {
      tile: 3.50,
      hardwood: 8.00,
      vinyl: 4.50,
      laminate: 3.00,
      carpet: 2.50,
    };

    const baseCost = flooringNeeded * materialCosts[data.flooringType];
    const adhesiveCost = adhesiveNeeded * 35; // $35 per bag/gallon
    const underlaymentCost = underlaymentNeeded * 0.75; // $0.75 per sq ft
    const transitionCost = transitionStrips * 25; // $25 per strip
    const moldingCost = moldingNeeded * 2.50; // $2.50 per linear ft
    const nailsCost = nailsStaples * 45; // $45 per box

    const totalMaterialCost = baseCost + adhesiveCost + underlaymentCost + transitionCost + moldingCost + nailsCost;

    setResults({
      roomArea,
      adjustedArea,
      flooringNeeded,
      adhesiveNeeded,
      underlaymentNeeded,
      transitionStrips,
      moldingNeeded,
      nailsStaples,
      totalMaterialCost,
    });
  };

  return (
    <Calculator
      title="Flooring Material Quantity Calculator"
      description="Calculate exact quantities of flooring materials needed including adhesives, underlayment, and trim."
      metaTitle="Flooring Material Quantity Calculator - Material Estimator | FlooringCalc Pro"
      metaDescription="Calculate exact flooring material quantities needed. Professional material estimator for adhesives, underlayment, trim, and transition strips."
      keywords={['material quantity calculator', 'flooring material estimator', 'flooring supplies calculator', 'material planning tool']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Specifications</h4>
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
                          placeholder="Length"
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
                          placeholder="Width"
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
                        <SelectItem value="tile">Ceramic/Porcelain Tile</SelectItem>
                        <SelectItem value="hardwood">Hardwood Flooring</SelectItem>
                        <SelectItem value="vinyl">Vinyl Flooring</SelectItem>
                        <SelectItem value="laminate">Laminate Flooring</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Additional Materials</h5>
                
                <FormField
                  control={form.control}
                  name="includeUnderlayment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Include underlayment/padding
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeTransitions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Include transition strips
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeMolding"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Include baseboard/quarter round
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Material Quantities
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material List</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Primary Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">With Waste:</span>
                      <span className="font-semibold">{results.adjustedArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Flooring Needed:</span>
                      <span className="font-semibold text-primary">{results.flooringNeeded.toFixed(2)} sq ft</span>
                    </div>
                    {results.adhesiveNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold text-secondary">{results.adhesiveNeeded} bags/gallons</span>
                      </div>
                    )}
                    {results.nailsStaples > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Nails/Staples:</span>
                        <span className="font-semibold text-secondary">{results.nailsStaples} boxes</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm">Enter details to see material list</p>
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
                    {results.underlaymentNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Underlayment:</span>
                        <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                      </div>
                    )}
                    {results.transitionStrips > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Transition Strips:</span>
                        <span className="font-semibold">{results.transitionStrips} pieces</span>
                      </div>
                    )}
                    {results.moldingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Molding/Trim:</span>
                        <span className="font-semibold">{results.moldingNeeded} linear ft</span>
                      </div>
                    )}
                    {results.underlaymentNeeded === 0 && results.transitionStrips === 0 && results.moldingNeeded === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        <p className="text-sm">Select additional materials above</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Additional materials will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${results.totalMaterialCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Total Material Cost Estimate</p>
                    <p className="text-xs text-gray-500 mt-2">
                      *Prices are estimates. Actual costs may vary by region and supplier.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost estimate will appear here</p>
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