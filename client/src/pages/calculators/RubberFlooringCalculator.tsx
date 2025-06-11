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
  areaLength: z.number().min(0.1, 'Area length must be greater than 0'),
  areaWidth: z.number().min(0.1, 'Area width must be greater than 0'),
  rubberType: z.enum(['tiles', 'rolls', 'mats', 'interlocking']),
  thickness: z.enum(['6mm', '8mm', '10mm', '12mm', '15mm', '20mm']),
  application: z.enum(['gym', 'playground', 'commercial', 'home-gym', 'warehouse']),
  wastePercentage: z.number().min(0).max(20, 'Waste percentage must be between 0-20%'),
  rubberCost: z.number().min(0, 'Cost must be positive'),
});

type FormData = z.infer<typeof formSchema>;

interface RubberFlooringResults {
  totalArea: number;
  adjustedArea: number;
  tilesNeeded?: number;
  rollsNeeded?: number;
  matsNeeded?: number;
  adhesiveNeeded: number;
  transitionStrips: number;
  totalMaterialCost: number;
  costPerSqFt: number;
  weightEstimate: number;
  installationTips: string[];
  maintenanceGuide: string[];
}

export default function RubberFlooringCalculator() {
  const [results, setResults] = useState<RubberFlooringResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areaLength: 0,
      areaWidth: 0,
      rubberType: 'tiles',
      thickness: '8mm',
      application: 'gym',
      wastePercentage: 5,
      rubberCost: 3.25,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalArea = data.areaLength * data.areaWidth;
    const adjustedArea = totalArea * (1 + data.wastePercentage / 100);
    
    let tilesNeeded: number | undefined;
    let rollsNeeded: number | undefined;
    let matsNeeded: number | undefined;
    let adhesiveMultiplier = 1;

    // Calculate material quantities based on type
    switch (data.rubberType) {
      case 'tiles':
        const tileSize = 24; // 24" x 24" standard tiles
        const tileArea = (tileSize * tileSize) / 144; // Convert to sq ft
        tilesNeeded = Math.ceil(adjustedArea / tileArea);
        adhesiveMultiplier = 0.7; // Tiles need less adhesive
        break;
      case 'rolls':
        const rollWidth = 4; // 4 feet standard roll width
        rollsNeeded = Math.ceil(adjustedArea / (rollWidth * 10)); // 10 ft roll length
        adhesiveMultiplier = 1.2; // Rolls need more adhesive
        break;
      case 'mats':
        const matSize = 4 * 6; // 4x6 feet standard mat
        matsNeeded = Math.ceil(adjustedArea / matSize);
        adhesiveMultiplier = 0.5; // Mats are often loose-lay
        break;
      case 'interlocking':
        const interlockSize = 20; // 20" x 20" typical
        const interlockArea = (interlockSize * interlockSize) / 144;
        tilesNeeded = Math.ceil(adjustedArea / interlockArea);
        adhesiveMultiplier = 0.3; // Minimal adhesive needed
        break;
    }

    const adhesiveNeeded = Math.ceil((adjustedArea / 300) * adhesiveMultiplier); // Gallons
    const transitionStrips = Math.ceil((data.areaLength + data.areaWidth) * 2 / 8); // 8 ft strips

    // Weight calculation based on thickness
    const weightPerSqFt = {
      '6mm': 1.2,
      '8mm': 1.6,
      '10mm': 2.0,
      '12mm': 2.4,
      '15mm': 3.0,
      '20mm': 4.0
    };

    const weightEstimate = adjustedArea * weightPerSqFt[data.thickness];

    const totalMaterialCost = (adjustedArea * data.rubberCost) + 
                             (adhesiveNeeded * 55) +
                             (transitionStrips * 25);
    const costPerSqFt = totalMaterialCost / totalArea;

    const installationTips = [
      'Allow rubber flooring to acclimate 24-48 hours before installation',
      'Ensure subfloor is clean, dry, and level within 1/8" over 10 feet',
      'Use manufacturer-recommended adhesive for permanent installations',
      'Install in temperatures between 65-75°F for best results',
      'Use a 100lb roller for proper adhesion and seam bonding',
      'Install transition strips at doorways and material changes'
    ];

    const maintenanceGuide = [
      'Sweep daily to remove dirt and debris',
      'Damp mop weekly with neutral pH cleaner',
      'Avoid petroleum-based cleaners and solvents',
      'Use entrance mats to reduce tracked-in dirt',
      'Inspect seams regularly and repair if needed',
      'Deep clean monthly with approved rubber floor cleaner'
    ];

    setResults({
      totalArea,
      adjustedArea,
      tilesNeeded,
      rollsNeeded,
      matsNeeded,
      adhesiveNeeded,
      transitionStrips,
      totalMaterialCost,
      costPerSqFt,
      weightEstimate,
      installationTips,
      maintenanceGuide,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Rubber Flooring Calculator"
      description="Calculate rubber flooring for gyms, playgrounds, and commercial fitness facilities."
      metaTitle="Rubber Flooring Calculator - Gym & Fitness Floor Calculator | FlooringCalc Pro"
      metaDescription="Calculate rubber flooring for gyms, fitness centers, and playgrounds. Professional rubber flooring calculator with thickness and density options."
      keywords={['rubber flooring calculator', 'gym flooring calculator', 'fitness flooring calculator', 'rubber mat calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Details</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="areaLength"
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
                  name="areaWidth"
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
                name="rubberType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rubber Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rubber type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tiles">Rubber Tiles</SelectItem>
                        <SelectItem value="rolls">Rubber Rolls</SelectItem>
                        <SelectItem value="mats">Rubber Mats</SelectItem>
                        <SelectItem value="interlocking">Interlocking Tiles</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thickness</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select thickness" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6mm">6mm (Light Use)</SelectItem>
                          <SelectItem value="8mm">8mm (Standard)</SelectItem>
                          <SelectItem value="10mm">10mm (Heavy Use)</SelectItem>
                          <SelectItem value="12mm">12mm (Commercial)</SelectItem>
                          <SelectItem value="15mm">15mm (High Impact)</SelectItem>
                          <SelectItem value="20mm">20mm (Maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="application"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select application" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gym">Commercial Gym</SelectItem>
                          <SelectItem value="playground">Playground</SelectItem>
                          <SelectItem value="commercial">Commercial Space</SelectItem>
                          <SelectItem value="home-gym">Home Gym</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
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
                  name="wastePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="5"
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
                  name="rubberCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Sq Ft ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="3.25"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Rubber Flooring'}
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
                      <span className="font-medium">Total Area:</span>
                      <span className="font-semibold">{results.totalArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">With Waste:</span>
                      <span className="font-semibold">{results.adjustedArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.tilesNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tiles Needed:</span>
                        <span className="font-semibold text-primary">{results.tilesNeeded} tiles</span>
                      </div>
                    )}
                    {results.rollsNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Rolls Needed:</span>
                        <span className="font-semibold text-primary">{results.rollsNeeded} rolls</span>
                      </div>
                    )}
                    {results.matsNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Mats Needed:</span>
                        <span className="font-semibold text-primary">{results.matsNeeded} mats</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Adhesive:</span>
                      <span className="font-semibold">{results.adhesiveNeeded} gallons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Transition Strips:</span>
                      <span className="font-semibold">{results.transitionStrips} strips</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🏋️</div>
                    <p className="text-sm">Enter details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalMaterialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cost per Sq Ft:</span>
                      <span className="font-semibold">${results.costPerSqFt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Weight Estimate:</span>
                      <span className="font-semibold">{results.weightEstimate.toFixed(0)} lbs</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm">Project summary will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Installation Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.installationTips.slice(0, 4).map((tip, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Maintenance Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.maintenanceGuide.slice(0, 4).map((guide, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {guide}
                        </li>
                      ))}
                    </ul>
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