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
  corkType: z.enum(['tile', 'plank', 'sheet']),
  thickness: z.enum(['6mm', '8mm', '10mm', '12mm']),
  tileSize: z.enum(['12x12', '12x24', '6x36', 'custom']),
  customLength: z.number().min(6).optional(),
  customWidth: z.number().min(6).optional(),
  grade: z.enum(['commercial', 'residential', 'premium']),
  finish: z.enum(['urethane', 'wax', 'unfinished']),
  installationType: z.enum(['floating', 'glue-down']),
  subfloorType: z.enum(['concrete', 'plywood', 'existing-floor']),
  includeUnderlayment: z.boolean(),
  includeMoistureBrrier: z.boolean(),
  includeTransitions: z.boolean(),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
});

type FormData = z.infer<typeof formSchema>;

interface CorkResults {
  roomArea: number;
  tilesNeeded: number;
  squareFeetNeeded: number;
  boxes: number;
  adhesiveNeeded: number;
  underlaymentNeeded: number;
  moistureBarrierNeeded: number;
  transitionStrips: number;
  laborHours: number;
  totalCost: number;
  ecoFriendlyBenefits: string[];
  installationTips: string[];
  maintenanceGuide: string[];
}

export default function CorkFlooringCalculator() {
  const [results, setResults] = useState<CorkResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      corkType: 'tile',
      thickness: '10mm',
      tileSize: '12x12',
      customLength: 0,
      customWidth: 0,
      grade: 'residential',
      finish: 'urethane',
      installationType: 'floating',
      subfloorType: 'plywood',
      includeUnderlayment: true,
      includeMoistureBrrier: false,
      includeTransitions: false,
      wastePercentage: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const perimeter = 2 * (data.roomLength + data.roomWidth);

    // Calculate tile dimensions
    let tileLength = 12;
    let tileWidth = 12;
    
    if (data.tileSize === 'custom') {
      tileLength = data.customLength || 12;
      tileWidth = data.customWidth || 12;
    } else if (data.corkType === 'tile') {
      const dimensions = data.tileSize.split('x').map(d => parseInt(d));
      tileLength = dimensions[0];
      tileWidth = dimensions[1];
    }

    // Calculate cork needs
    let tilesNeeded = 0;
    let squareFeetNeeded = 0;

    if (data.corkType === 'sheet') {
      // Sheet cork - calculate by area
      squareFeetNeeded = roomArea * (1 + data.wastePercentage / 100);
      tilesNeeded = 0;
    } else {
      // Tile or plank calculation
      const tileArea = (tileLength * tileWidth) / 144; // Convert to sq ft
      const baseTiles = Math.ceil(roomArea / tileArea);
      tilesNeeded = Math.ceil(baseTiles * (1 + data.wastePercentage / 100));
      squareFeetNeeded = tilesNeeded * tileArea;
    }

    // Boxes calculation (typically 10-12 sq ft per box for cork)
    const sqFtPerBox = 11;
    const boxes = Math.ceil(squareFeetNeeded / sqFtPerBox);

    // Adhesive calculation (for glue-down installation)
    const adhesiveNeeded = data.installationType === 'glue-down' 
      ? Math.ceil(squareFeetNeeded / 200) : 0; // 1 gallon per 200 sq ft

    // Underlayment calculation
    const underlaymentNeeded = data.includeUnderlayment && data.installationType === 'floating'
      ? Math.ceil(roomArea * 1.05) : 0;

    // Moisture barrier calculation
    const moistureBarrierNeeded = data.includeMoistureBrrier || data.subfloorType === 'concrete'
      ? Math.ceil(roomArea * 1.1) : 0;

    // Transition strips
    const transitionStrips = data.includeTransitions ? Math.ceil(perimeter / 10) : 0;

    // Labor hours calculation
    const thicknessFactors = {
      '6mm': 1.0,
      '8mm': 1.1,
      '10mm': 1.2,
      '12mm': 1.3,
    };

    const installationFactors = {
      floating: 1.0,
      'glue-down': 1.4,
    };

    const baseHours = roomArea * 0.45; // 0.45 hours per sq ft base
    const laborHours = baseHours * thicknessFactors[data.thickness] * installationFactors[data.installationType];

    // Cost calculations
    const corkCosts = {
      tile: { commercial: 4.50, residential: 6.50, premium: 9.50 },
      plank: { commercial: 5.50, residential: 7.50, premium: 11.50 },
      sheet: { commercial: 3.50, residential: 5.50, premium: 8.50 },
    };

    const finishMultipliers = {
      unfinished: 0.8,
      wax: 1.0,
      urethane: 1.2,
    };

    const corkCost = squareFeetNeeded * corkCosts[data.corkType][data.grade] * finishMultipliers[data.finish];
    const adhesiveCost = adhesiveNeeded * 45; // $45 per gallon
    const underlaymentCost = underlaymentNeeded * 0.70; // $0.70 per sq ft
    const moistureBarrierCost = moistureBarrierNeeded * 0.40; // $0.40 per sq ft
    const transitionCost = transitionStrips * 30; // $30 per transition

    const totalCost = corkCost + adhesiveCost + underlaymentCost + moistureBarrierCost + transitionCost;

    // Eco-friendly benefits
    const ecoFriendlyBenefits = [
      'Cork is harvested without damaging trees',
      'Cork oak trees live 150-200 years and regenerate bark',
      'Naturally antimicrobial and hypoallergenic',
      'Excellent thermal and acoustic insulation',
      'Biodegradable and recyclable material',
      'Low VOC emissions for healthy indoor air',
      'Sustainably harvested every 9 years',
    ];

    // Installation tips
    const installationTips = [
      'Acclimate cork 48-72 hours before installation',
      'Maintain room temperature 65-75°F during installation',
      'Cork is softer than other materials - handle with care',
      'Use sharp utility knife for clean cuts',
    ];

    if (data.subfloorType === 'concrete') {
      installationTips.push('Test concrete for moisture - cork is sensitive to moisture');
    }

    if (data.installationType === 'floating') {
      installationTips.push('Allow 1/4" expansion gap around perimeter');
    }

    if (data.finish === 'unfinished') {
      installationTips.push('Apply 3 coats of polyurethane finish after installation');
    }

    // Maintenance guide
    const maintenanceGuide = [
      'Sweep or vacuum regularly with soft brush attachment',
      'Damp mop with cork-specific cleaner only',
      'Avoid standing water - wipe spills immediately',
      'Use furniture pads to prevent indentations',
      'Reapply protective finish every 3-5 years',
      'Avoid high heels and sharp objects',
      'Maintain 35-65% humidity levels',
    ];

    setResults({
      roomArea,
      tilesNeeded,
      squareFeetNeeded,
      boxes,
      adhesiveNeeded,
      underlaymentNeeded,
      moistureBarrierNeeded,
      transitionStrips,
      laborHours,
      totalCost,
      ecoFriendlyBenefits,
      installationTips,
      maintenanceGuide,
    });
  };

  return (
    <Calculator
      title="Cork Flooring Calculator"
      description="Calculate cork flooring materials including tiles, planks, and sheet cork requirements."
      metaTitle="Cork Flooring Calculator - Eco Cork Tile Calculator | FlooringCalc Pro"
      metaDescription="Calculate cork flooring materials including tiles, planks, and sheet cork. Professional eco-friendly cork flooring calculator."
      keywords={['cork flooring calculator', 'cork tile calculator', 'eco flooring calculator', 'cork plank calculator']}
      category="materials"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Cork Specifications</h4>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="corkType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cork Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cork type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tile">Cork Tiles</SelectItem>
                          <SelectItem value="plank">Cork Planks</SelectItem>
                          <SelectItem value="sheet">Sheet Cork</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="6mm">6mm</SelectItem>
                          <SelectItem value="8mm">8mm</SelectItem>
                          <SelectItem value="10mm">10mm</SelectItem>
                          <SelectItem value="12mm">12mm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('corkType') !== 'sheet' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tileSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tile/Plank Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="12x12">12" x 12"</SelectItem>
                            <SelectItem value="12x24">12" x 24"</SelectItem>
                            <SelectItem value="6x36">6" x 36"</SelectItem>
                            <SelectItem value="custom">Custom Size</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('tileSize') === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="customLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (in)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                placeholder="12"
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
                        name="customWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (in)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                placeholder="12"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="commercial">Commercial Grade</SelectItem>
                          <SelectItem value="residential">Residential Grade</SelectItem>
                          <SelectItem value="premium">Premium Grade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finish</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unfinished">Unfinished</SelectItem>
                          <SelectItem value="wax">Wax Finish</SelectItem>
                          <SelectItem value="urethane">Urethane Finish</SelectItem>
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
                  name="installationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installation Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select installation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="floating">Floating Floor</SelectItem>
                          <SelectItem value="glue-down">Glue Down</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subfloorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subfloor Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subfloor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete</SelectItem>
                          <SelectItem value="plywood">Plywood</SelectItem>
                          <SelectItem value="existing-floor">Existing Floor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      <FormLabel className="text-sm font-normal">Include underlayment</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeMoistureBrrier"
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
                      <FormLabel className="text-sm font-normal">Include moisture barrier</FormLabel>
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
                      <FormLabel className="text-sm font-normal">Include transition strips</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Cork Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cork Flooring</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.tilesNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tiles/Planks:</span>
                        <span className="font-semibold text-primary">{results.tilesNeeded} pieces</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Sq Ft:</span>
                      <span className="font-semibold text-secondary">{results.squareFeetNeeded.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Boxes to Order:</span>
                      <span className="font-semibold text-amber-600">{results.boxes} boxes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🌳</div>
                    <p className="text-sm">Enter details to calculate cork</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Installation Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    {results.adhesiveNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold">{results.adhesiveNeeded} gallons</span>
                      </div>
                    )}
                    {results.underlaymentNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Underlayment:</span>
                        <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                      </div>
                    )}
                    {results.moistureBarrierNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Moisture Barrier:</span>
                        <span className="font-semibold">{results.moistureBarrierNeeded} sq ft</span>
                      </div>
                    )}
                    {results.transitionStrips > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Transitions:</span>
                        <span className="font-semibold">{results.transitionStrips} pieces</span>
                      </div>
                    )}
                    {results.adhesiveNeeded === 0 && results.underlaymentNeeded === 0 && 
                     results.moistureBarrierNeeded === 0 && results.transitionStrips === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        <p className="text-sm">Select additional materials above</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Installation materials will appear here</p>
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
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${results.totalCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Material Cost Only</p>
                    <p className="text-xs text-gray-500 mt-2">Labor costs vary by region</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost estimate will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-100">
              <CardHeader>
                <CardTitle className="text-lg">Eco-Friendly Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.ecoFriendlyBenefits.slice(0, 5).map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Environmental benefits will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Installation Tips</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.installationTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Professional tips will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg">Maintenance Guide</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.maintenanceGuide.slice(0, 5).map((guide, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{guide}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Maintenance tips will appear here</p>
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