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
  floorType: z.enum(['polished-concrete', 'stained-concrete', 'overlay', 'microtopping']),
  concreteCondition: z.enum(['new', 'existing-good', 'existing-poor', 'needs-repair']),
  finishLevel: z.enum(['basic', 'standard', 'premium', 'decorative']),
  colorOptions: z.enum(['natural', 'integral-color', 'acid-stain', 'water-stain', 'dye']),
  sealerType: z.enum(['none', 'penetrating', 'topical-acrylic', 'urethane', 'epoxy']),
  aggregateExposure: z.enum(['none', 'light', 'medium', 'heavy']),
  includePrep: z.boolean(),
  includeSealer: z.boolean(),
  includePolishing: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ConcreteResults {
  roomArea: number;
  prepCost: number;
  materialCost: number;
  laborCost: number;
  sealerCost: number;
  polishingCost: number;
  totalCost: number;
  costPerSqFt: number;
  durabilityRating: string;
  maintenanceLevel: string;
  processSteps: string[];
  expectedLifespan: string;
}

export default function ConcreteFlooringCalculator() {
  const [results, setResults] = useState<ConcreteResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      floorType: 'polished-concrete',
      concreteCondition: 'existing-good',
      finishLevel: 'standard',
      colorOptions: 'natural',
      sealerType: 'penetrating',
      aggregateExposure: 'light',
      includePrep: true,
      includeSealer: true,
      includePolishing: true,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;

    // Preparation costs based on condition
    const prepCosts = {
      'new': 2.50,
      'existing-good': 4.00,
      'existing-poor': 8.50,
      'needs-repair': 15.00,
    };

    // Base material costs per sq ft
    const materialCosts = {
      'polished-concrete': 3.50,
      'stained-concrete': 5.50,
      'overlay': 8.00,
      'microtopping': 12.00,
    };

    // Finish level multipliers
    const finishMultipliers = {
      'basic': 1.0,
      'standard': 1.4,
      'premium': 1.8,
      'decorative': 2.5,
    };

    // Color option costs
    const colorCosts = {
      'natural': 0,
      'integral-color': 1.50,
      'acid-stain': 3.00,
      'water-stain': 2.50,
      'dye': 4.50,
    };

    // Sealer costs
    const sealerCosts = {
      'none': 0,
      'penetrating': 1.25,
      'topical-acrylic': 2.00,
      'urethane': 3.50,
      'epoxy': 4.50,
    };

    // Polishing costs based on aggregate exposure
    const polishingCosts = {
      'none': 0,
      'light': 2.50,
      'medium': 4.00,
      'heavy': 6.50,
    };

    // Labor rates (per sq ft)
    const laborRates = {
      'polished-concrete': 6.00,
      'stained-concrete': 8.50,
      'overlay': 12.00,
      'microtopping': 18.00,
    };

    const prepCost = data.includePrep ? roomArea * prepCosts[data.concreteCondition] : 0;
    const baseMaterialCost = roomArea * materialCosts[data.floorType] * finishMultipliers[data.finishLevel];
    const colorCost = roomArea * colorCosts[data.colorOptions];
    const materialCost = baseMaterialCost + colorCost;
    
    const laborCost = roomArea * laborRates[data.floorType] * finishMultipliers[data.finishLevel];
    
    const sealerCost = data.includeSealer ? roomArea * sealerCosts[data.sealerType] : 0;
    const polishingCost = data.includePolishing ? roomArea * polishingCosts[data.aggregateExposure] : 0;

    const totalCost = prepCost + materialCost + laborCost + sealerCost + polishingCost;
    const costPerSqFt = totalCost / roomArea;

    // Durability ratings
    const durabilityRatings = {
      'polished-concrete': 'Excellent - 25+ years',
      'stained-concrete': 'Very Good - 15-20 years',
      'overlay': 'Good - 10-15 years',
      'microtopping': 'Good - 8-12 years',
    };

    // Maintenance levels
    const maintenanceLevels = {
      'polished-concrete': 'Very Low - Occasional dust mopping',
      'stained-concrete': 'Low - Periodic resealing',
      'overlay': 'Medium - Regular maintenance',
      'microtopping': 'Medium - Careful maintenance',
    };

    // Expected lifespans
    const expectedLifespans = {
      'polished-concrete': '25-50 years with proper care',
      'stained-concrete': '15-25 years with resealing',
      'overlay': '10-20 years depending on traffic',
      'microtopping': '8-15 years with maintenance',
    };

    // Process steps
    const processSteps = [
      data.includePrep ? 'Surface preparation and repair' : null,
      'Clean and profile concrete surface',
      data.floorType === 'overlay' || data.floorType === 'microtopping' ? 'Apply base overlay material' : null,
      data.colorOptions !== 'natural' ? `Apply ${data.colorOptions.replace('-', ' ')}` : null,
      data.includePolishing && data.aggregateExposure !== 'none' ? `Polish to ${data.aggregateExposure} aggregate exposure` : null,
      data.includeSealer ? `Apply ${data.sealerType.replace('-', ' ')} sealer` : null,
      'Final inspection and curing',
    ].filter(Boolean) as string[];

    setResults({
      roomArea,
      prepCost,
      materialCost,
      laborCost,
      sealerCost,
      polishingCost,
      totalCost,
      costPerSqFt,
      durabilityRating: durabilityRatings[data.floorType],
      maintenanceLevel: maintenanceLevels[data.floorType],
      processSteps,
      expectedLifespan: expectedLifespans[data.floorType],
    });
  };

  return (
    <Calculator
      title="Concrete Flooring Cost Calculator"
      description="Calculate concrete flooring costs including polishing, staining, and sealing materials."
      metaTitle="Concrete Flooring Calculator - Polished Concrete Calculator | FlooringCalc Pro"
      metaDescription="Calculate concrete flooring costs including polishing, staining, and sealing. Professional concrete floor calculator for commercial and residential projects."
      keywords={['concrete flooring calculator', 'polished concrete calculator', 'concrete floor cost calculator', 'stained concrete calculator']}
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
                name="floorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concrete Floor Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select floor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="polished-concrete">Polished Concrete</SelectItem>
                        <SelectItem value="stained-concrete">Stained Concrete</SelectItem>
                        <SelectItem value="overlay">Concrete Overlay</SelectItem>
                        <SelectItem value="microtopping">Microtopping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="concreteCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concrete Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New Concrete</SelectItem>
                          <SelectItem value="existing-good">Existing - Good</SelectItem>
                          <SelectItem value="existing-poor">Existing - Poor</SelectItem>
                          <SelectItem value="needs-repair">Needs Repair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finishLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finish Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic Finish</SelectItem>
                          <SelectItem value="standard">Standard Finish</SelectItem>
                          <SelectItem value="premium">Premium Finish</SelectItem>
                          <SelectItem value="decorative">Decorative Finish</SelectItem>
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
                  name="colorOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Options</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="natural">Natural Gray</SelectItem>
                          <SelectItem value="integral-color">Integral Color</SelectItem>
                          <SelectItem value="acid-stain">Acid Stain</SelectItem>
                          <SelectItem value="water-stain">Water-Based Stain</SelectItem>
                          <SelectItem value="dye">Concrete Dye</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sealerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sealer Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sealer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Sealer</SelectItem>
                          <SelectItem value="penetrating">Penetrating Sealer</SelectItem>
                          <SelectItem value="topical-acrylic">Topical Acrylic</SelectItem>
                          <SelectItem value="urethane">Urethane Sealer</SelectItem>
                          <SelectItem value="epoxy">Epoxy Sealer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="aggregateExposure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aggregate Exposure (Polishing)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exposure level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Aggregate Exposure</SelectItem>
                        <SelectItem value="light">Light Exposure</SelectItem>
                        <SelectItem value="medium">Medium Exposure</SelectItem>
                        <SelectItem value="heavy">Heavy Exposure</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Include in Project</h5>
                
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
                      <FormLabel className="text-sm font-normal">Surface preparation</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeSealer"
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
                      <FormLabel className="text-sm font-normal">Sealer application</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includePolishing"
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
                      <FormLabel className="text-sm font-normal">Polishing process</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Concrete Flooring Cost
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Cost Analysis</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.prepCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Preparation:</span>
                        <span className="font-semibold">${results.prepCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Materials:</span>
                      <span className="font-semibold text-primary">${results.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor:</span>
                      <span className="font-semibold text-secondary">${results.laborCost.toFixed(2)}</span>
                    </div>
                    {results.sealerCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sealer:</span>
                        <span className="font-semibold">${results.sealerCost.toFixed(2)}</span>
                      </div>
                    )}
                    {results.polishingCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Polishing:</span>
                        <span className="font-semibold">${results.polishingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold">Total Cost:</span>
                        <span className="font-bold text-2xl text-primary">${results.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="text-center text-sm text-gray-600 mt-2">
                        <p><strong>Cost per Sq Ft:</strong> ${results.costPerSqFt.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🏗️</div>
                    <p className="text-sm">Enter details to calculate concrete costs</p>
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
                      <span className="font-medium text-gray-900">Durability:</span>
                      <p className="text-sm text-primary">{results.durabilityRating}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Maintenance:</span>
                      <p className="text-sm text-secondary">{results.maintenanceLevel}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Expected Lifespan:</span>
                      <p className="text-sm text-gray-700">{results.expectedLifespan}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Performance data will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Process Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ol className="space-y-2">
                    {results.processSteps.map((step, index) => (
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
                    <p className="text-sm">Process steps will appear here</p>
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