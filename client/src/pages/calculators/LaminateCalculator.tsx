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
  plankLength: z.number().min(12, 'Plank length must be at least 12 inches'),
  plankWidth: z.number().min(3, 'Plank width must be at least 3 inches'),
  laminateThickness: z.enum(['6mm', '7mm', '8mm', '10mm', '12mm']),
  installationType: z.enum(['floating', 'glue-down']),
  roomComplexity: z.enum(['simple', 'moderate', 'complex']),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
  includeUnderlayment: z.boolean(),
  includeMolding: z.boolean(),
  includeTransitions: z.boolean(),
  includeQuarterRound: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface LaminateResults {
  roomArea: number;
  plankArea: number;
  planksNeeded: number;
  squareFeetNeeded: number;
  boxes: number;
  underlaymentNeeded: number;
  moldingNeeded: number;
  transitionStrips: number;
  quarterRoundNeeded: number;
  laborHours: number;
  totalMaterialCost: number;
  installationTips: string[];
}

export default function LaminateCalculator() {
  const [results, setResults] = useState<LaminateResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      plankLength: 48,
      plankWidth: 7.5,
      laminateThickness: '8mm',
      installationType: 'floating',
      roomComplexity: 'simple',
      wastePercentage: 10,
      includeUnderlayment: true,
      includeMolding: false,
      includeTransitions: false,
      includeQuarterRound: false,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const perimeter = 2 * (data.roomLength + data.roomWidth);
    
    // Calculate plank area in square feet
    const plankArea = (data.plankLength * data.plankWidth) / 144;
    
    // Calculate planks needed with waste
    const basePlanks = Math.ceil(roomArea / plankArea);
    const planksNeeded = Math.ceil(basePlanks * (1 + data.wastePercentage / 100));
    const squareFeetNeeded = planksNeeded * plankArea;

    // Calculate boxes (typically 20-25 sq ft per box)
    const sqFtPerBox = 22; // Average
    const boxes = Math.ceil(squareFeetNeeded / sqFtPerBox);

    // Underlayment calculation
    const underlaymentNeeded = data.includeUnderlayment ? Math.ceil(roomArea * 1.05) : 0;

    // Molding and trim calculations
    const moldingNeeded = data.includeMolding ? Math.ceil(perimeter * 0.9) : 0; // 90% of perimeter
    const quarterRoundNeeded = data.includeQuarterRound ? Math.ceil(perimeter * 0.85) : 0; // 85% of perimeter
    const transitionStrips = data.includeTransitions ? Math.ceil(perimeter / 15) : 0; // Estimate 1 per 15 ft

    // Labor hours calculation
    const complexityFactors = {
      simple: 1.0,
      moderate: 1.3,
      complex: 1.6,
    };

    const installationFactors = {
      floating: 1.0,
      'glue-down': 1.4,
    };

    const baseHours = roomArea * 0.4; // 0.4 hours per sq ft
    const laborHours = baseHours * 
                      complexityFactors[data.roomComplexity] * 
                      installationFactors[data.installationType];

    // Cost calculations
    const laminateCosts = {
      '6mm': 2.50,
      '7mm': 3.20,
      '8mm': 4.00,
      '10mm': 5.50,
      '12mm': 7.20,
    };

    const laminateCost = squareFeetNeeded * laminateCosts[data.laminateThickness];
    const underlaymentCost = underlaymentNeeded * 0.65; // $0.65 per sq ft
    const moldingCost = moldingNeeded * 2.80; // $2.80 per linear ft
    const quarterRoundCost = quarterRoundNeeded * 1.50; // $1.50 per linear ft
    const transitionCost = transitionStrips * 28; // $28 per transition

    const totalMaterialCost = laminateCost + underlaymentCost + moldingCost + quarterRoundCost + transitionCost;

    // Installation tips
    const installationTips: string[] = [];
    
    if (data.installationType === 'floating') {
      installationTips.push('Allow 1/4" expansion gap around perimeter');
      installationTips.push('Stagger end joints by at least 6 inches');
    }
    
    if (data.laminateThickness === '12mm') {
      installationTips.push('Thicker planks provide better sound dampening');
    }
    
    if (data.includeUnderlayment) {
      installationTips.push('Use moisture barrier in basements and concrete subfloors');
    }
    
    installationTips.push('Acclimate flooring 48 hours before installation');
    installationTips.push('Start installation from longest, straightest wall');
    installationTips.push('Use tapping block to protect tongue and groove edges');

    setResults({
      roomArea,
      plankArea,
      planksNeeded,
      squareFeetNeeded,
      boxes,
      underlaymentNeeded,
      moldingNeeded,
      transitionStrips,
      quarterRoundNeeded,
      laborHours,
      totalMaterialCost,
      installationTips,
    });
  };

  return (
    <Calculator
      title="Laminate Flooring Calculator"
      description="Calculate laminate flooring materials including planks, underlayment, and transition strips."
      metaTitle="Laminate Flooring Calculator - Laminate Plank Calculator | FlooringCalc Pro"
      metaDescription="Calculate laminate flooring materials including planks, underlayment, and transitions. Professional laminate flooring calculator."
      keywords={['laminate flooring calculator', 'laminate plank calculator', 'laminate installation calculator', 'floating floor calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Laminate Specifications</h4>
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
                          placeholder="7.5"
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
                  name="laminateThickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laminate Thickness</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select thickness" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6mm">6mm (Budget)</SelectItem>
                          <SelectItem value="7mm">7mm (Standard)</SelectItem>
                          <SelectItem value="8mm">8mm (Premium)</SelectItem>
                          <SelectItem value="10mm">10mm (High Quality)</SelectItem>
                          <SelectItem value="12mm">12mm (Luxury)</SelectItem>
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
              </div>

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
                      <FormLabel className="text-sm font-normal">Include baseboard molding</FormLabel>
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
                  name="includeQuarterRound"
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
                Calculate Laminate Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Laminate Flooring</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Planks Needed:</span>
                      <span className="font-semibold text-primary">{results.planksNeeded} planks</span>
                    </div>
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
                    <div className="text-3xl mb-2">🪵</div>
                    <p className="text-sm">Enter details to calculate laminate</p>
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
                    {results.moldingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Baseboard:</span>
                        <span className="font-semibold">{results.moldingNeeded} linear ft</span>
                      </div>
                    )}
                    {results.quarterRoundNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Quarter Round:</span>
                        <span className="font-semibold">{results.quarterRoundNeeded} linear ft</span>
                      </div>
                    )}
                    {results.transitionStrips > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Transitions:</span>
                        <span className="font-semibold">{results.transitionStrips} pieces</span>
                      </div>
                    )}
                    {results.underlaymentNeeded === 0 && results.moldingNeeded === 0 && 
                     results.quarterRoundNeeded === 0 && results.transitionStrips === 0 && (
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