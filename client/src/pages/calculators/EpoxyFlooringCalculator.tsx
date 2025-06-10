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
  epoxyType: z.enum(['standard-epoxy', 'high-performance', 'polyaspartic', 'polyurea']),
  coatLayers: z.enum(['single-coat', 'two-coat', 'three-coat']),
  floorCondition: z.enum(['new-concrete', 'existing-good', 'existing-poor', 'painted']),
  decorativeOptions: z.enum(['none', 'color-flakes', 'metallic', 'quartz-sand']),
  environment: z.enum(['residential', 'light-commercial', 'heavy-commercial', 'industrial']),
  includePrep: z.boolean(),
  includePrimer: z.boolean(),
  includeTopcoat: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface EpoxyResults {
  roomArea: number;
  primerNeeded: number;
  baseCoatNeeded: number;
  topcoatNeeded: number;
  decorativeMaterial: number;
  totalMaterialCost: number;
  prepCost: number;
  laborHours: number;
  durabilityRating: string;
  applicationSteps: string[];
  cureTime: string;
}

export default function EpoxyFlooringCalculator() {
  const [results, setResults] = useState<EpoxyResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      epoxyType: 'standard-epoxy',
      coatLayers: 'two-coat',
      floorCondition: 'existing-good',
      decorativeOptions: 'color-flakes',
      environment: 'residential',
      includePrep: true,
      includePrimer: true,
      includeTopcoat: true,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;

    // Coverage rates (sq ft per gallon)
    const coverageRates = {
      'standard-epoxy': { primer: 400, base: 250, topcoat: 350 },
      'high-performance': { primer: 350, base: 200, topcoat: 300 },
      'polyaspartic': { primer: 300, base: 180, topcoat: 250 },
      'polyurea': { primer: 350, base: 200, topcoat: 280 },
    };

    // Layer multipliers
    const layerMultipliers = {
      'single-coat': { base: 1, topcoat: 0 },
      'two-coat': { base: 1, topcoat: 1 },
      'three-coat': { base: 2, topcoat: 1 },
    };

    // Floor condition prep factors
    const prepFactors = {
      'new-concrete': 1.0,
      'existing-good': 1.2,
      'existing-poor': 1.8,
      'painted': 2.5,
    };

    const coverage = coverageRates[data.epoxyType];
    const layers = layerMultipliers[data.coatLayers];
    const prepFactor = prepFactors[data.floorCondition];

    // Calculate material needs
    const primerNeeded = data.includePrimer ? roomArea / coverage.primer : 0;
    const baseCoatNeeded = (roomArea / coverage.base) * layers.base;
    const topcoatNeeded = data.includeTopcoat ? (roomArea / coverage.topcoat) * layers.topcoat : 0;

    // Decorative materials
    let decorativeMaterial = 0;
    if (data.decorativeOptions === 'color-flakes') {
      decorativeMaterial = roomArea * 0.05; // 0.05 lbs per sq ft
    } else if (data.decorativeOptions === 'metallic') {
      decorativeMaterial = roomArea * 0.02; // 0.02 lbs per sq ft
    } else if (data.decorativeOptions === 'quartz-sand') {
      decorativeMaterial = roomArea * 0.1; // 0.1 lbs per sq ft
    }

    // Cost calculations
    const materialCosts = {
      'standard-epoxy': { primer: 45, base: 85, topcoat: 65 },
      'high-performance': { primer: 55, base: 120, topcoat: 95 },
      'polyaspartic': { primer: 75, base: 180, topcoat: 150 },
      'polyurea': { primer: 65, base: 160, topcoat: 130 },
    };

    const decorativeCosts = {
      'none': 0,
      'color-flakes': 3.50,
      'metallic': 12.00,
      'quartz-sand': 2.25,
    };

    const costs = materialCosts[data.epoxyType];
    const primerCost = primerNeeded * costs.primer;
    const baseCost = baseCoatNeeded * costs.base;
    const topcoatCost = topcoatNeeded * costs.topcoat;
    const decorativeCost = decorativeMaterial * decorativeCosts[data.decorativeOptions];

    const totalMaterialCost = primerCost + baseCost + topcoatCost + decorativeCost;

    // Prep costs
    const prepCostPerSqFt = {
      'new-concrete': 0.50,
      'existing-good': 2.00,
      'existing-poor': 5.00,
      'painted': 8.00,
    };

    const prepCost = data.includePrep ? roomArea * prepCostPerSqFt[data.floorCondition] : 0;

    // Labor estimation
    const laborFactors = {
      'residential': 1.0,
      'light-commercial': 1.2,
      'heavy-commercial': 1.5,
      'industrial': 2.0,
    };

    const baseHours = roomArea * 0.3; // 0.3 hours per sq ft base
    const laborHours = baseHours * prepFactor * laborFactors[data.environment];

    // Durability rating
    const durabilityRatings = {
      'standard-epoxy': '5-10 years residential',
      'high-performance': '10-15 years commercial',
      'polyaspartic': '15-20 years high-traffic',
      'polyurea': '20+ years industrial',
    };

    // Cure times
    const cureTimes = {
      'standard-epoxy': '7-14 days full cure',
      'high-performance': '5-7 days full cure',
      'polyaspartic': '24-48 hours full cure',
      'polyurea': '24 hours full cure',
    };

    // Application steps
    const applicationSteps = [
      'Surface preparation and cleaning',
      data.includePrimer ? 'Apply primer coat and allow to cure' : null,
      'Apply base epoxy coat with roller or squeegee',
      data.decorativeOptions !== 'none' ? `Broadcast ${data.decorativeOptions} while base is tacky` : null,
      layers.base > 1 ? 'Apply second base coat if specified' : null,
      data.includeTopcoat ? 'Apply clear topcoat for protection and gloss' : null,
      'Allow full cure time before heavy use',
    ].filter(Boolean) as string[];

    setResults({
      roomArea,
      primerNeeded,
      baseCoatNeeded,
      topcoatNeeded,
      decorativeMaterial,
      totalMaterialCost,
      prepCost,
      laborHours,
      durabilityRating: durabilityRatings[data.epoxyType],
      applicationSteps,
      cureTime: cureTimes[data.epoxyType],
    });
  };

  return (
    <Calculator
      title="Epoxy Flooring Coverage Calculator"
      description="Calculate epoxy flooring coverage for garage floors, basements, and commercial applications."
      metaTitle="Epoxy Flooring Calculator - Epoxy Coverage Calculator | FlooringCalc Pro"
      metaDescription="Calculate epoxy flooring coverage for garage floors and commercial spaces. Professional epoxy coating calculator with primer and topcoat estimates."
      keywords={['epoxy flooring calculator', 'epoxy coverage calculator', 'garage floor epoxy calculator', 'epoxy coating calculator']}
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
                      <FormLabel>Area Length (ft)</FormLabel>
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
                      <FormLabel>Area Width (ft)</FormLabel>
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
                name="epoxyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Epoxy Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select epoxy type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard-epoxy">Standard Epoxy</SelectItem>
                        <SelectItem value="high-performance">High Performance Epoxy</SelectItem>
                        <SelectItem value="polyaspartic">Polyaspartic</SelectItem>
                        <SelectItem value="polyurea">Polyurea</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coatLayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coating System</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select coating layers" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single-coat">Single Coat</SelectItem>
                          <SelectItem value="two-coat">Two Coat System</SelectItem>
                          <SelectItem value="three-coat">Three Coat System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floorCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new-concrete">New Concrete</SelectItem>
                          <SelectItem value="existing-good">Existing - Good</SelectItem>
                          <SelectItem value="existing-poor">Existing - Poor</SelectItem>
                          <SelectItem value="painted">Previously Painted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="decorativeOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decorative Options</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select decorative option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None - Solid Color</SelectItem>
                          <SelectItem value="color-flakes">Color Flakes</SelectItem>
                          <SelectItem value="metallic">Metallic Finish</SelectItem>
                          <SelectItem value="quartz-sand">Quartz Sand</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential Garage</SelectItem>
                          <SelectItem value="light-commercial">Light Commercial</SelectItem>
                          <SelectItem value="heavy-commercial">Heavy Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Include in Estimate</h5>
                
                <FormField
                  control={form.control}
                  name="includePrep"
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
                      <FormLabel className="text-sm font-normal">Surface preparation costs</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includePrimer"
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
                      <FormLabel className="text-sm font-normal">Primer coat</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeTopcoat"
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
                      <FormLabel className="text-sm font-normal">Clear topcoat</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Epoxy Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Coverage Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.primerNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Primer:</span>
                        <span className="font-semibold text-primary">{results.primerNeeded.toFixed(2)} gallons</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Base Coat:</span>
                      <span className="font-semibold text-secondary">{results.baseCoatNeeded.toFixed(2)} gallons</span>
                    </div>
                    {results.topcoatNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Topcoat:</span>
                        <span className="font-semibold text-amber-600">{results.topcoatNeeded.toFixed(2)} gallons</span>
                      </div>
                    )}
                    {results.decorativeMaterial > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Decorative Material:</span>
                        <span className="font-semibold">{results.decorativeMaterial.toFixed(2)} lbs</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🏭</div>
                    <p className="text-sm">Enter details to calculate epoxy needs</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Performance & Durability</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-900">Expected Lifespan:</span>
                      <p className="text-sm text-primary">{results.durabilityRating}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Cure Time:</span>
                      <p className="text-sm text-secondary">{results.cureTime}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Performance data will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Total Cost Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        ${results.totalMaterialCost.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Material Cost</p>
                    </div>
                    {results.prepCost > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Prep Cost:</span>
                        <span className="font-semibold">${results.prepCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="text-center pt-2 border-t">
                      <div className="text-xl font-bold text-gray-900">
                        ${(results.totalMaterialCost + results.prepCost).toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-500">Total Project Cost</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost estimate will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Application Process</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ol className="space-y-2">
                    {results.applicationSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Application steps will appear here</p>
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