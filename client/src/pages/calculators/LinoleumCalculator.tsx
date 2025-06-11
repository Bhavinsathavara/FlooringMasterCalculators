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
  roomLength: z.number().min(0.1, 'Room length must be greater than 0'),
  roomWidth: z.number().min(0.1, 'Room width must be greater than 0'),
  linoleumType: z.enum(['sheet', 'tile', 'click']),
  tileSize: z.number().min(6, 'Tile size must be at least 6 inches').optional(),
  wastePercentage: z.number().min(0).max(30, 'Waste percentage must be between 0-30%'),
  linoleumCost: z.number().min(0, 'Cost must be positive'),
});

type FormData = z.infer<typeof formSchema>;

interface LinoleumResults {
  roomArea: number;
  adjustedArea: number;
  tilesNeeded?: number;
  squareFeetNeeded: number;
  adhesiveNeeded: number;
  seamSealerNeeded?: number;
  totalMaterialCost: number;
  costPerSqFt: number;
  ecoFriendlyBenefits: string[];
  installationTips: string[];
  maintenanceGuide: string[];
}

export default function LinoleumCalculator() {
  const [results, setResults] = useState<LinoleumResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      linoleumType: 'tile',
      tileSize: 12,
      wastePercentage: 8,
      linoleumCost: 3.75,
    },
  });

  const linoleumType = form.watch('linoleumType');

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    
    let tilesNeeded: number | undefined;
    let seamSealerNeeded: number | undefined;
    let adhesiveMultiplier = 1;

    if (data.linoleumType === 'tile' && data.tileSize) {
      const tileArea = (data.tileSize * data.tileSize) / 144; // Convert to sq ft
      tilesNeeded = Math.ceil(adjustedArea / tileArea);
      adhesiveMultiplier = 0.8; // Tiles use less adhesive
    } else if (data.linoleumType === 'sheet') {
      seamSealerNeeded = Math.ceil(data.roomLength / 10); // Estimate sealer tubes needed
      adhesiveMultiplier = 1.2; // Sheet requires more adhesive
    } else {
      adhesiveMultiplier = 0.5; // Click type uses minimal adhesive
    }

    const adhesiveNeeded = Math.ceil((adjustedArea / 200) * adhesiveMultiplier); // Gallons
    const totalMaterialCost = (adjustedArea * data.linoleumCost) + 
                             (adhesiveNeeded * 45) +
                             (seamSealerNeeded ? seamSealerNeeded * 12 : 0);
    const costPerSqFt = totalMaterialCost / roomArea;

    const ecoFriendlyBenefits = [
      'Made from renewable raw materials (linseed oil, cork dust, wood flour)',
      'Biodegradable and recyclable at end of life',
      'Antimicrobial properties reduce need for chemical cleaners',
      'Low VOC emissions improve indoor air quality',
      'Durable construction reduces replacement frequency',
      'Natural static resistance eliminates need for treatments'
    ];

    const installationTips = [
      'Acclimate linoleum 24-48 hours before installation',
      'Ensure subfloor temperature is 65-75°F during installation',
      'Use pH-neutral adhesive specifically designed for linoleum',
      'Roll installation with 100lb roller to ensure proper adhesion',
      'Allow 24 hours before heavy traffic',
      'Install transition strips at doorways and material changes'
    ];

    const maintenanceGuide = [
      'Sweep or vacuum daily to prevent grit accumulation',
      'Damp mop weekly with pH-neutral cleaner',
      'Avoid harsh chemicals, bleach, or ammonia-based products',
      'Apply protective coating every 2-3 years in high-traffic areas',
      'Clean spills immediately to prevent staining',
      'Use furniture pads to prevent scratches and indentations'
    ];

    setResults({
      roomArea,
      adjustedArea,
      tilesNeeded,
      squareFeetNeeded: adjustedArea,
      adhesiveNeeded,
      seamSealerNeeded,
      totalMaterialCost,
      costPerSqFt,
      ecoFriendlyBenefits,
      installationTips,
      maintenanceGuide,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Linoleum Calculator"
      description="Calculate linoleum tile and sheet requirements for eco-friendly flooring installations."
      metaTitle="Linoleum Calculator - Linoleum Tile & Sheet Calculator | FlooringCalc Pro"
      metaDescription="Calculate linoleum tile and sheet requirements. Professional linoleum calculator for eco-friendly flooring installations."
      keywords={['linoleum calculator', 'linoleum tile calculator', 'linoleum sheet calculator', 'eco flooring calculator']}
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
                name="linoleumType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linoleum Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select linoleum type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tile">Linoleum Tile</SelectItem>
                        <SelectItem value="sheet">Sheet Linoleum</SelectItem>
                        <SelectItem value="click">Click Linoleum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {linoleumType === 'tile' && (
                <FormField
                  control={form.control}
                  name="tileSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Size (inches)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tile size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12">12" x 12"</SelectItem>
                          <SelectItem value="18">18" x 18"</SelectItem>
                          <SelectItem value="24">24" x 24"</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                          placeholder="8"
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
                  name="linoleumCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Sq Ft ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="3.75"
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
                {isCalculating ? 'Calculating...' : 'Calculate Linoleum Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="vinyl"
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
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
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
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Adhesive Needed:</span>
                      <span className="font-semibold">{results.adhesiveNeeded} gallons</span>
                    </div>
                    {results.seamSealerNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Seam Sealer:</span>
                        <span className="font-semibold">{results.seamSealerNeeded} tubes</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🌿</div>
                    <p className="text-sm">Enter details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cost Summary</CardTitle>
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
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost summary will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Eco-Friendly Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.ecoFriendlyBenefits.slice(0, 4).map((benefit, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

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
              </>
            )}
          </div>
        </div>
      </div>
    </Calculator>
  );
}