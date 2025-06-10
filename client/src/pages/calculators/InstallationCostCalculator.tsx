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
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'laminate', 'carpet', 'stone']),
  roomComplexity: z.enum(['simple', 'moderate', 'complex']),
  region: z.enum(['low-cost', 'average', 'high-cost']),
  includeRemoval: z.boolean(),
  includeSubfloor: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface InstallationResults {
  roomArea: number;
  baseLaborRate: number;
  complexityMultiplier: number;
  regionMultiplier: number;
  installationCost: number;
  removalCost: number;
  subfloorCost: number;
  totalCost: number;
  costPerSqFt: number;
}

export default function InstallationCostCalculator() {
  const [results, setResults] = useState<InstallationResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      flooringType: 'tile',
      roomComplexity: 'simple',
      region: 'average',
      includeRemoval: false,
      includeSubfloor: false,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    
    // Base labor rates per sq ft by flooring type
    const baseLaborRates = {
      tile: 8.50,
      hardwood: 12.00,
      vinyl: 6.00,
      laminate: 4.50,
      carpet: 3.50,
      stone: 15.00,
    };

    // Complexity multipliers
    const complexityMultipliers = {
      simple: 1.0,
      moderate: 1.3,
      complex: 1.6,
    };

    // Regional cost multipliers
    const regionMultipliers = {
      'low-cost': 0.8,
      average: 1.0,
      'high-cost': 1.4,
    };

    const baseLaborRate = baseLaborRates[data.flooringType];
    const complexityMultiplier = complexityMultipliers[data.roomComplexity];
    const regionMultiplier = regionMultipliers[data.region];

    const installationCost = roomArea * baseLaborRate * complexityMultiplier * regionMultiplier;
    const removalCost = data.includeRemoval ? roomArea * 2.50 * regionMultiplier : 0;
    const subfloorCost = data.includeSubfloor ? roomArea * 4.00 * regionMultiplier : 0;
    const totalCost = installationCost + removalCost + subfloorCost;
    const costPerSqFt = totalCost / roomArea;

    setResults({
      roomArea,
      baseLaborRate,
      complexityMultiplier,
      regionMultiplier,
      installationCost,
      removalCost,
      subfloorCost,
      totalCost,
      costPerSqFt,
    });
  };

  return (
    <Calculator
      title="Flooring Installation Cost Estimator"
      description="Estimate professional installation costs based on flooring type, room complexity, and local labor rates."
      metaTitle="Flooring Installation Cost Estimator - Labor Cost Calculator | FlooringCalc Pro"
      metaDescription="Calculate flooring installation costs with professional labor rates. Get accurate estimates for tile, hardwood, vinyl, and carpet installation."
      keywords={['flooring installation cost', 'installation cost estimator', 'labor cost calculator', 'flooring contractor cost']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Details</h4>
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
                        <SelectItem value="vinyl">Vinyl Flooring (LVT/LVP)</SelectItem>
                        <SelectItem value="laminate">Laminate Flooring</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                        <SelectItem value="stone">Natural Stone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomComplexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Complexity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="simple">Simple - Rectangular room, few cuts</SelectItem>
                        <SelectItem value="moderate">Moderate - Some obstacles, moderate cuts</SelectItem>
                        <SelectItem value="complex">Complex - Many angles, intricate cuts</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regional Labor Costs</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low-cost">Low Cost Area (Rural/Small Towns)</SelectItem>
                        <SelectItem value="average">Average Cost Area (Suburban)</SelectItem>
                        <SelectItem value="high-cost">High Cost Area (Major Cities)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="includeRemoval"
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
                        Include old flooring removal
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeSubfloor"
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
                        Include subfloor preparation
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Installation Cost
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Cost Breakdown</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Installation Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Base Labor Rate:</span>
                      <span className="font-semibold">${results.baseLaborRate.toFixed(2)}/sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Complexity Factor:</span>
                      <span className="font-semibold">{results.complexityMultiplier}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Regional Factor:</span>
                      <span className="font-semibold">{results.regionMultiplier}x</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Installation Cost:</span>
                        <span className="font-semibold text-primary">${results.installationCost.toFixed(2)}</span>
                      </div>
                      {results.removalCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Removal Cost:</span>
                          <span className="font-semibold text-secondary">${results.removalCost.toFixed(2)}</span>
                        </div>
                      )}
                      {results.subfloorCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Subfloor Prep:</span>
                          <span className="font-semibold text-amber-600">${results.subfloorCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 text-lg border-t">
                        <span className="font-bold">Total Cost:</span>
                        <span className="font-bold text-2xl text-primary">${results.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="text-center text-sm text-gray-600 mt-2">
                        <p><strong>Cost per Sq Ft:</strong> ${results.costPerSqFt.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-4">🔨</div>
                    <p>Enter project details to calculate installation costs</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Professional Tips:</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Prices include labor only - materials sold separately</li>
                  <li>• Complex rooms may require 30-60% more time</li>
                  <li>• Get 3+ quotes for accurate local pricing</li>
                  <li>• Weekend/rush jobs typically cost 20% more</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Calculator>
  );
}