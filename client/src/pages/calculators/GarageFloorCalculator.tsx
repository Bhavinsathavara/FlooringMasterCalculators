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
  garageLength: z.number().min(1, 'Garage length must be greater than 0'),
  garageWidth: z.number().min(1, 'Garage width must be greater than 0'),
  coatingType: z.enum(['epoxy', 'polyurea', 'polyaspartic', 'acrylic']),
  surfacePrep: z.enum(['basic', 'diamond-grind', 'shot-blast']),
  decorativeFlakes: z.boolean().default(false),
  topcoat: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface GarageFloorResults {
  garageArea: number;
  primerNeeded: number;
  baseCoatNeeded: number;
  topcoatNeeded: number;
  flakesNeeded?: number;
  prepCost: number;
  materialCost: number;
  totalCost: number;
  costPerSqFt: number;
  cureTime: string;
  durabilityRating: string;
  applicationSteps: string[];
  maintenanceTips: string[];
}

export default function GarageFloorCalculator() {
  const [results, setResults] = useState<GarageFloorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      garageLength: 0,
      garageWidth: 0,
      coatingType: 'epoxy',
      surfacePrep: 'diamond-grind',
      decorativeFlakes: false,
      topcoat: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1800));

    const garageArea = data.garageLength * data.garageWidth;
    
    // Coverage rates in sq ft per gallon
    const coverageRates = {
      epoxy: { primer: 400, base: 250, topcoat: 400 },
      polyurea: { primer: 350, base: 200, topcoat: 350 },
      polyaspartic: { primer: 400, base: 300, topcoat: 400 },
      acrylic: { primer: 450, base: 350, topcoat: 450 }
    };

    const rates = coverageRates[data.coatingType];
    
    const primerNeeded = Math.ceil(garageArea / rates.primer);
    const baseCoatNeeded = Math.ceil(garageArea / rates.base);
    const topcoatNeeded = data.topcoat ? Math.ceil(garageArea / rates.topcoat) : 0;
    
    let flakesNeeded: number | undefined;
    if (data.decorativeFlakes) {
      flakesNeeded = Math.ceil(garageArea / 100); // 1 lb per 100 sq ft
    }

    // Surface prep costs
    const prepCosts = {
      basic: 0.50,
      'diamond-grind': 1.25,
      'shot-blast': 2.00
    };
    const prepCost = garageArea * prepCosts[data.surfacePrep];

    // Material costs per gallon
    const materialCosts = {
      epoxy: { primer: 45, base: 85, topcoat: 65 },
      polyurea: { primer: 55, base: 120, topcoat: 85 },
      polyaspartic: { primer: 50, base: 95, topcoat: 75 },
      acrylic: { primer: 35, base: 55, topcoat: 45 }
    };

    const costs = materialCosts[data.coatingType];
    const materialCost = (primerNeeded * costs.primer) + 
                        (baseCoatNeeded * costs.base) + 
                        (topcoatNeeded * costs.topcoat) +
                        (flakesNeeded ? flakesNeeded * 25 : 0);

    const totalCost = prepCost + materialCost;
    const costPerSqFt = totalCost / garageArea;

    // Cure times and durability
    const coatingProperties = {
      epoxy: { 
        cureTime: '24-48 hours foot traffic, 7 days full cure',
        durabilityRating: 'Good - 5-10 years with proper maintenance'
      },
      polyurea: { 
        cureTime: '4-6 hours foot traffic, 24 hours full cure',
        durabilityRating: 'Excellent - 15-20 years, highly durable'
      },
      polyaspartic: { 
        cureTime: '2-4 hours foot traffic, 24 hours full cure',
        durabilityRating: 'Excellent - 10-15 years, UV stable'
      },
      acrylic: { 
        cureTime: '2-4 hours foot traffic, 24 hours full cure',
        durabilityRating: 'Fair - 3-5 years, budget option'
      }
    };

    const properties = coatingProperties[data.coatingType];

    const applicationSteps = [
      'Clean and degrease the concrete surface thoroughly',
      `Perform ${data.surfacePrep.replace('-', ' ')} surface preparation`,
      'Repair any cracks or holes with appropriate filler',
      'Apply primer coat and allow to cure per manufacturer specs',
      'Apply base coat in thin, even layers',
      data.decorativeFlakes ? 'Broadcast decorative flakes while base coat is tacky' : '',
      data.topcoat ? 'Apply protective topcoat for enhanced durability' : '',
      'Allow full cure time before heavy use'
    ].filter(Boolean);

    const maintenanceTips = [
      'Sweep regularly to prevent abrasive dirt accumulation',
      'Clean with mild detergent and water as needed',
      'Avoid harsh chemicals and de-icing salts',
      'Use furniture pads to prevent scratching',
      'Reapply topcoat every 3-5 years in high-traffic areas',
      'Address any chips or wear spots promptly to prevent spreading'
    ];

    setResults({
      garageArea,
      primerNeeded,
      baseCoatNeeded,
      topcoatNeeded,
      flakesNeeded,
      prepCost,
      materialCost,
      totalCost,
      costPerSqFt,
      cureTime: properties.cureTime,
      durabilityRating: properties.durabilityRating,
      applicationSteps,
      maintenanceTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Garage Floor Calculator"
      description="Calculate garage floor coating materials including epoxy, polyurea, and polyaspartic systems."
      metaTitle="Garage Floor Calculator - Garage Coating Calculator | FlooringCalc Pro"
      metaDescription="Calculate garage floor coating materials for epoxy, polyurea, and polyaspartic systems. Professional garage floor calculator."
      keywords={['garage floor calculator', 'garage coating calculator', 'garage floor epoxy calculator', 'garage flooring calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Garage Details</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="garageLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garage Length (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                  name="garageWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garage Width (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                name="coatingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coating Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select coating type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="epoxy">Epoxy (Most Popular)</SelectItem>
                        <SelectItem value="polyurea">Polyurea (Premium)</SelectItem>
                        <SelectItem value="polyaspartic">Polyaspartic (Fast Cure)</SelectItem>
                        <SelectItem value="acrylic">Acrylic (Budget)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surfacePrep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface Preparation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select prep method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic Cleaning</SelectItem>
                        <SelectItem value="diamond-grind">Diamond Grinding (Recommended)</SelectItem>
                        <SelectItem value="shot-blast">Shot Blasting (Premium)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="decorativeFlakes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Decorative Flakes</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Add color flakes
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
                  name="topcoat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Protective Topcoat</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Recommended
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

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Garage Floor Coating'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="concrete"
              variant="pattern"
            />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Material Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Garage Area:</span>
                      <span className="font-semibold">{results.garageArea.toFixed(0)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Primer:</span>
                      <span className="font-semibold">{results.primerNeeded} gallon(s)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Base Coat:</span>
                      <span className="font-semibold text-primary">{results.baseCoatNeeded} gallon(s)</span>
                    </div>
                    {results.topcoatNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Topcoat:</span>
                        <span className="font-semibold">{results.topcoatNeeded} gallon(s)</span>
                      </div>
                    )}
                    {results.flakesNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Decorative Flakes:</span>
                        <span className="font-semibold">{results.flakesNeeded} lb(s)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🚗</div>
                    <p className="text-sm">Enter details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Surface Prep:</span>
                      <span className="font-semibold">${results.prepCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Materials:</span>
                      <span className="font-semibold">${results.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Cost per Sq Ft:</span>
                        <span className="font-semibold">${results.costPerSqFt.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost breakdown will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Cure Time:</strong>
                        <p className="text-sm mt-1">{results.cureTime}</p>
                      </div>
                      <div>
                        <strong>Durability:</strong>
                        <p className="text-sm mt-1">{results.durabilityRating}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Application Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {results.applicationSteps.map((step, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-green-600 mr-2 font-medium">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </Calculator>
  );
}