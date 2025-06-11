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
  vinylType: z.enum(['lvp', 'lvt', 'sheet', 'wpc', 'spc']),
  plankLength: z.number().min(12, 'Plank length must be at least 12 inches'),
  plankWidth: z.number().min(3, 'Plank width must be at least 3 inches'),
  thickness: z.enum(['2mm', '3mm', '4mm', '5mm', '6mm', '7mm', '8mm']),
  installationType: z.enum(['floating', 'glue-down', 'click-lock']),
  subfloorType: z.enum(['concrete', 'plywood', 'osb', 'existing-floor']),
  includeUnderlayment: z.boolean(),
  includeTransitions: z.boolean(),
  includeMolding: z.boolean(),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
  roomComplexity: z.enum(['simple', 'moderate', 'complex']),
});

type FormData = z.infer<typeof formSchema>;

interface VinylResults {
  roomArea: number;
  plankArea: number;
  planksNeeded: number;
  squareFeetNeeded: number;
  boxes: number;
  rollsNeeded: number;
  underlaymentNeeded: number;
  transitionStrips: number;
  moldingNeeded: number;
  adhesiverequired: number;
  laborHours: number;
  totalMaterialCost: number;
  installationTips: string[];
  durabilityRating: string;
}

export default function VinylCalculator() {
  const [results, setResults] = useState<VinylResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      vinylType: 'lvp',
      plankLength: 48,
      plankWidth: 6,
      thickness: '5mm',
      installationType: 'click-lock',
      subfloorType: 'plywood',
      includeUnderlayment: true,
      includeTransitions: false,
      includeMolding: false,
      wastePercentage: 10,
      roomComplexity: 'simple',
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const perimeter = 2 * (data.roomLength + data.roomWidth);

    // Calculate based on vinyl type
    let planksNeeded = 0;
    let rollsNeeded = 0;
    let squareFeetNeeded = 0;
    let boxes = 0;

    if (data.vinylType === 'sheet') {
      // Sheet vinyl calculation (6 or 12 foot wide rolls)
      const rollWidth = 12; // feet
      rollsNeeded = Math.ceil(data.roomLength / rollWidth) || 1;
      squareFeetNeeded = rollsNeeded * rollWidth * data.roomWidth;
    } else {
      // Plank/tile calculation
      const plankArea = (data.plankLength * data.plankWidth) / 144; // Convert to sq ft
      const basePlanks = Math.ceil(roomArea / plankArea);
      planksNeeded = Math.ceil(basePlanks * (1 + data.wastePercentage / 100));
      squareFeetNeeded = planksNeeded * plankArea;
      
      // Boxes calculation (typically 20-24 sq ft per box)
      const sqFtPerBox = data.vinylType === 'lvp' ? 24 : 20;
      boxes = Math.ceil(squareFeetNeeded / sqFtPerBox);
    }

    // Underlayment calculation
    const underlaymentNeeded = data.includeUnderlayment && data.installationType !== 'glue-down' 
      ? Math.ceil(roomArea * 1.05) : 0;

    // Transition strips and molding
    const transitionStrips = data.includeTransitions ? Math.ceil(perimeter / 12) : 0;
    const moldingNeeded = data.includeMolding ? Math.ceil(perimeter * 0.9) : 0;

    // Adhesive for glue-down installation
    const adhesiverequired = data.installationType === 'glue-down' 
      ? Math.ceil(roomArea / 200) : 0; // 1 gallon covers ~200 sq ft

    // Labor hours calculation
    const complexityFactors = {
      simple: 1.0,
      moderate: 1.3,
      complex: 1.6,
    };

    const installationFactors = {
      floating: 0.8,
      'click-lock': 1.0,
      'glue-down': 1.4,
    };

    const baseHours = roomArea * 0.35; // 0.35 hours per sq ft base
    const laborHours = baseHours * 
                      complexityFactors[data.roomComplexity] * 
                      installationFactors[data.installationType];

    // Cost calculations
    const vinylCosts = {
      lvp: { '2mm': 2.50, '3mm': 3.50, '4mm': 4.50, '5mm': 5.50, '6mm': 6.50, '7mm': 7.50, '8mm': 8.50 },
      lvt: { '2mm': 2.00, '3mm': 3.00, '4mm': 4.00, '5mm': 5.00, '6mm': 6.00, '7mm': 7.00, '8mm': 8.00 },
      sheet: { '2mm': 1.50, '3mm': 2.00, '4mm': 2.50, '5mm': 3.00, '6mm': 3.50, '7mm': 4.00, '8mm': 4.50 },
      wpc: { '2mm': 3.50, '3mm': 4.50, '4mm': 5.50, '5mm': 6.50, '6mm': 7.50, '7mm': 8.50, '8mm': 9.50 },
      spc: { '2mm': 3.00, '3mm': 4.00, '4mm': 5.00, '5mm': 6.00, '6mm': 7.00, '7mm': 8.00, '8mm': 9.00 },
    };

    const vinylCost = squareFeetNeeded * vinylCosts[data.vinylType][data.thickness];
    const underlaymentCost = underlaymentNeeded * 0.50; // $0.50 per sq ft
    const transitionCost = transitionStrips * 25; // $25 per transition
    const moldingCost = moldingNeeded * 2.50; // $2.50 per linear ft
    const adhesiveCost = adhesiverequired * 35; // $35 per gallon

    const totalMaterialCost = vinylCost + underlaymentCost + transitionCost + moldingCost + adhesiveCost;

    // Durability ratings
    const durabilityRatings = {
      lvp: 'Excellent - 15-25 years',
      lvt: 'Very Good - 10-20 years',
      sheet: 'Good - 10-15 years',
      wpc: 'Excellent - 20-30 years',
      spc: 'Excellent - 20-25 years',
    };

    // Installation tips
    const installationTips: string[] = [];
    
    if (data.subfloorType === 'concrete') {
      installationTips.push('Test concrete for moisture before installation');
    }
    
    if (data.installationType === 'floating') {
      installationTips.push('Allow 1/4" expansion gap around perimeter');
    }
    
    if (data.vinylType === 'sheet') {
      installationTips.push('Template fitting recommended for accurate cuts');
    } else {
      installationTips.push('Stagger end joints by at least 6 inches');
    }
    
    installationTips.push('Acclimate vinyl 24-48 hours before installation');
    installationTips.push('Ensure subfloor is level within 3/16" over 10 feet');
    
    if (data.vinylType === 'wpc' || data.vinylType === 'spc') {
      installationTips.push('Waterproof core provides excellent moisture resistance');
    }

    setResults({
      roomArea,
      plankArea: data.vinylType === 'sheet' ? 0 : (data.plankLength * data.plankWidth) / 144,
      planksNeeded,
      squareFeetNeeded,
      boxes,
      rollsNeeded,
      underlaymentNeeded,
      transitionStrips,
      moldingNeeded,
      adhesiverequired,
      laborHours,
      totalMaterialCost,
      installationTips,
      durabilityRating: durabilityRatings[data.vinylType],
    });
  };

  return (
    <Calculator
      title="Vinyl Flooring Calculator"
      description="Calculate vinyl flooring materials including LVP, LVT, and sheet vinyl requirements."
      metaTitle="Vinyl Flooring Calculator - LVP LVT Calculator | FlooringCalc Pro"
      metaDescription="Calculate vinyl flooring materials including LVP, LVT, WPC, SPC, and sheet vinyl. Professional vinyl flooring calculator."
      keywords={['vinyl flooring calculator', 'lvp calculator', 'lvt calculator', 'luxury vinyl plank calculator']}
      category="materials"
      faqs={[
        {
          question: "What's the difference between LVP and LVT?",
          answer: "LVP (Luxury Vinyl Plank) mimics wood with plank shapes, while LVT (Luxury Vinyl Tile) replicates stone/ceramic in tile formats. Both offer waterproof cores and click-lock installation options."
        },
        {
          question: "Do I need underlayment with vinyl flooring?",
          answer: "Click-lock vinyl often includes attached underlayment. Glue-down vinyl over concrete needs moisture barrier. Sheet vinyl typically doesn't require additional underlayment if subfloor is smooth."
        },
        {
          question: "Can vinyl flooring go over existing floors?",
          answer: "Yes, vinyl can install over most existing hard surfaces if they're level, clean, and structurally sound. Remove carpet and ensure no more than 1/8\" height variations over 6 feet."
        },
        {
          question: "How thick should luxury vinyl flooring be?",
          answer: "Residential: 4-6mm for light traffic, 6-8mm for heavy traffic. Commercial: 8-12mm minimum. Thicker wear layers (20+ mil) provide better durability and longer warranties."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Vinyl Specifications</h4>
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
                name="vinylType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vinyl Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vinyl type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lvp">LVP (Luxury Vinyl Plank)</SelectItem>
                        <SelectItem value="lvt">LVT (Luxury Vinyl Tile)</SelectItem>
                        <SelectItem value="sheet">Sheet Vinyl</SelectItem>
                        <SelectItem value="wpc">WPC (Wood Plastic Composite)</SelectItem>
                        <SelectItem value="spc">SPC (Stone Plastic Composite)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('vinylType') !== 'sheet' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plankLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plank Length (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="48"
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
                    name="plankWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plank Width (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.25"
                            placeholder="6"
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
                          <SelectItem value="2mm">2mm (Budget)</SelectItem>
                          <SelectItem value="3mm">3mm (Economy)</SelectItem>
                          <SelectItem value="4mm">4mm (Standard)</SelectItem>
                          <SelectItem value="5mm">5mm (Premium)</SelectItem>
                          <SelectItem value="6mm">6mm (High Quality)</SelectItem>
                          <SelectItem value="7mm">7mm (Professional)</SelectItem>
                          <SelectItem value="8mm">8mm (Luxury)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="click-lock">Click Lock</SelectItem>
                          <SelectItem value="glue-down">Glue Down</SelectItem>
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
                          <SelectItem value="osb">OSB</SelectItem>
                          <SelectItem value="existing-floor">Existing Floor</SelectItem>
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
                          <SelectItem value="simple">Simple - Rectangular</SelectItem>
                          <SelectItem value="moderate">Moderate - Some cuts</SelectItem>
                          <SelectItem value="complex">Complex - Many obstacles</SelectItem>
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
                      <FormLabel className="text-sm font-normal">Include quarter round</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Vinyl Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Vinyl Flooring</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.planksNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Planks Needed:</span>
                        <span className="font-semibold text-primary">{results.planksNeeded} planks</span>
                      </div>
                    )}
                    {results.rollsNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Rolls Needed:</span>
                        <span className="font-semibold text-primary">{results.rollsNeeded} rolls</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Sq Ft:</span>
                      <span className="font-semibold text-secondary">{results.squareFeetNeeded.toFixed(2)} sq ft</span>
                    </div>
                    {results.boxes > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Boxes to Order:</span>
                        <span className="font-semibold text-amber-600">{results.boxes} boxes</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Durability:</span>
                      <span className="font-semibold text-green-600 text-sm">{results.durabilityRating}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">📱</div>
                    <p className="text-sm">Enter details to calculate vinyl</p>
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
                        <span className="font-medium">Transitions:</span>
                        <span className="font-semibold">{results.transitionStrips} pieces</span>
                      </div>
                    )}
                    {results.moldingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Quarter Round:</span>
                        <span className="font-semibold">{results.moldingNeeded} linear ft</span>
                      </div>
                    )}
                    {results.adhesiverequired > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold">{results.adhesiverequired} gallons</span>
                      </div>
                    )}
                    {results.underlaymentNeeded === 0 && results.transitionStrips === 0 && 
                     results.moldingNeeded === 0 && results.adhesiverequired === 0 && (
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
                <CardTitle className="text-lg">Total Cost Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${results.totalMaterialCost.toFixed(2)}
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
          </div>
        </div>
      </div>
    </Calculator>
  );
}