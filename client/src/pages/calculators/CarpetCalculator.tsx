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
  carpetType: z.enum(['cut-pile', 'loop-pile', 'cut-loop', 'frieze', 'berber', 'shag']),
  carpetWidth: z.enum(['12-ft', '13.2-ft', '15-ft']),
  installationType: z.enum(['stretch-in', 'glue-down', 'double-stick']),
  paddingThickness: z.enum(['6-lb', '8-lb', '10-lb', 'none']),
  wastePercentage: z.number().min(0).max(25, 'Waste percentage must be between 0-25%'),
  includeStairs: z.boolean(),
  stairCount: z.number().min(0).max(50).optional(),
  includePadding: z.boolean(),
  includeTackStrips: z.boolean(),
  includeTransitions: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface CarpetResults {
  roomArea: number;
  carpetNeeded: number;
  carpetWithWaste: number;
  paddingNeeded: number;
  tackStripsNeeded: number;
  transitionStrips: number;
  stairCarpet: number;
  laborHours: number;
  totalMaterialCost: number;
  installationTips: string[];
  seams: number;
}

export default function CarpetCalculator() {
  const [results, setResults] = useState<CarpetResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      carpetType: 'cut-pile',
      carpetWidth: '12-ft',
      installationType: 'stretch-in',
      paddingThickness: '8-lb',
      wastePercentage: 10,
      includeStairs: false,
      stairCount: 0,
      includePadding: true,
      includeTackStrips: true,
      includeTransitions: false,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const perimeter = 2 * (data.roomLength + data.roomWidth);

    // Carpet width conversion
    const carpetWidthFt = {
      '12-ft': 12,
      '13.2-ft': 13.2,
      '15-ft': 15,
    }[data.carpetWidth];

    // Calculate seams needed
    const roomWidthFits = data.roomWidth <= carpetWidthFt;
    const roomLengthFits = data.roomLength <= carpetWidthFt;
    
    let carpetNeeded = 0;
    let seams = 0;

    if (roomWidthFits) {
      // No seam needed for width
      carpetNeeded = data.roomLength * carpetWidthFt;
    } else if (roomLengthFits) {
      // Rotate carpet, no seam needed
      carpetNeeded = data.roomWidth * carpetWidthFt;
    } else {
      // Seams required
      const widthPieces = Math.ceil(data.roomWidth / carpetWidthFt);
      seams = widthPieces - 1;
      carpetNeeded = data.roomLength * carpetWidthFt * widthPieces;
    }

    // Convert to square feet and add waste
    const carpetSqFt = carpetNeeded;
    const carpetWithWaste = carpetSqFt * (1 + data.wastePercentage / 100);

    // Stair calculations
    let stairCarpet = 0;
    if (data.includeStairs && data.stairCount) {
      // Typical stair: 10" tread + 7" riser = 17" per step
      const carpetPerStep = 17 / 12; // Convert to feet
      stairCarpet = (data.stairCount || 0) * carpetPerStep * 3; // 3 ft width typical
    }

    // Padding calculation
    const paddingNeeded = data.includePadding ? roomArea * 1.05 : 0; // 5% extra for padding

    // Tack strips (perimeter minus doorways)
    const tackStripsNeeded = data.includeTackStrips ? perimeter * 0.85 : 0; // 85% of perimeter

    // Transition strips (estimate 1 per doorway)
    const transitionStrips = data.includeTransitions ? Math.ceil(perimeter / 20) : 0;

    // Labor hours estimation
    const complexityFactors = {
      'cut-pile': 1.0,
      'loop-pile': 1.1,
      'cut-loop': 1.2,
      'frieze': 1.3,
      'berber': 1.4,
      'shag': 1.5,
    };

    const installationFactors = {
      'stretch-in': 1.0,
      'glue-down': 1.3,
      'double-stick': 1.5,
    };

    const baseHours = roomArea * 0.5; // 0.5 hours per sq ft base
    const laborHours = baseHours * 
                      complexityFactors[data.carpetType] * 
                      installationFactors[data.installationType] * 
                      (1 + seams * 0.5); // Add time for seams

    // Cost estimation
    const carpetCosts = {
      'cut-pile': 4.50,
      'loop-pile': 3.80,
      'cut-loop': 5.20,
      'frieze': 6.00,
      'berber': 4.20,
      'shag': 7.50,
    };

    const paddingCosts = {
      '6-lb': 0.85,
      '8-lb': 1.20,
      '10-lb': 1.50,
      'none': 0,
    };

    const carpetCost = (carpetWithWaste + stairCarpet) * carpetCosts[data.carpetType];
    const paddingCost = paddingNeeded * paddingCosts[data.paddingThickness];
    const tackStripCost = tackStripsNeeded * 1.25; // $1.25 per linear foot
    const transitionCost = transitionStrips * 25; // $25 per transition

    const totalMaterialCost = carpetCost + paddingCost + tackStripCost + transitionCost;

    // Installation tips
    const installationTips: string[] = [];
    
    if (seams > 0) {
      installationTips.push(`${seams} seam(s) required - plan seam placement carefully`);
    }
    if (data.carpetType === 'berber') {
      installationTips.push('Berber carpet requires precise cutting to prevent unraveling');
    }
    if (data.installationType === 'stretch-in') {
      installationTips.push('Allow carpet to acclimate for 24 hours before installation');
    }
    if (data.paddingThickness === '10-lb') {
      installationTips.push('Premium padding extends carpet life significantly');
    }
    
    installationTips.push('Maintain consistent pile direction for uniform appearance');
    installationTips.push('Use seaming tape and iron for professional seam quality');

    setResults({
      roomArea,
      carpetNeeded: carpetSqFt,
      carpetWithWaste,
      paddingNeeded,
      tackStripsNeeded,
      transitionStrips,
      stairCarpet,
      laborHours,
      totalMaterialCost,
      installationTips,
      seams,
    });
  };

  return (
    <Calculator
      title="Carpet Calculator"
      description="Calculate carpet requirements including padding, tack strips, and installation materials."
      metaTitle="Carpet Calculator - Carpet & Padding Calculator | FlooringCalc Pro"
      metaDescription="Calculate carpet requirements including padding, tack strips, and installation materials. Professional carpet flooring calculator."
      keywords={['carpet calculator', 'carpet flooring calculator', 'carpet padding calculator', 'carpet installation calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Carpet Specifications</h4>
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
                  name="carpetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carpet Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select carpet type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cut-pile">Cut Pile</SelectItem>
                          <SelectItem value="loop-pile">Loop Pile</SelectItem>
                          <SelectItem value="cut-loop">Cut & Loop</SelectItem>
                          <SelectItem value="frieze">Frieze</SelectItem>
                          <SelectItem value="berber">Berber</SelectItem>
                          <SelectItem value="shag">Shag</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carpetWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carpet Roll Width</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select width" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12-ft">12 feet</SelectItem>
                          <SelectItem value="13.2-ft">13.2 feet</SelectItem>
                          <SelectItem value="15-ft">15 feet</SelectItem>
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
                      <FormLabel>Installation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stretch-in">Stretch-in</SelectItem>
                          <SelectItem value="glue-down">Glue Down</SelectItem>
                          <SelectItem value="double-stick">Double Stick</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paddingThickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Padding Density</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select padding" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6-lb">6 lb Density</SelectItem>
                          <SelectItem value="8-lb">8 lb Density</SelectItem>
                          <SelectItem value="10-lb">10 lb Density (Premium)</SelectItem>
                          <SelectItem value="none">No Padding</SelectItem>
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
                <h5 className="font-medium text-gray-900">Additional Requirements</h5>
                
                <FormField
                  control={form.control}
                  name="includeStairs"
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
                      <FormLabel className="text-sm font-normal">Include stairs</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch('includeStairs') && (
                  <FormField
                    control={form.control}
                    name="stairCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Steps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="includePadding"
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
                      <FormLabel className="text-sm font-normal">Include carpet padding</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeTackStrips"
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
                      <FormLabel className="text-sm font-normal">Include tack strips</FormLabel>
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
                Calculate Carpet Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Carpet & Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Carpet Needed:</span>
                      <span className="font-semibold text-primary">{results.carpetWithWaste.toFixed(2)} sq ft</span>
                    </div>
                    {results.seams > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Seams Required:</span>
                        <span className="font-semibold text-amber-600">{results.seams}</span>
                      </div>
                    )}
                    {results.stairCarpet > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Stair Carpet:</span>
                        <span className="font-semibold">{results.stairCarpet.toFixed(2)} sq ft</span>
                      </div>
                    )}
                    {results.paddingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Padding:</span>
                        <span className="font-semibold">{results.paddingNeeded.toFixed(2)} sq ft</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold text-secondary">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🏠</div>
                    <p className="text-sm">Enter details to calculate carpet</p>
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
                    {results.tackStripsNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tack Strips:</span>
                        <span className="font-semibold">{results.tackStripsNeeded.toFixed(0)} linear ft</span>
                      </div>
                    )}
                    {results.transitionStrips > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Transitions:</span>
                        <span className="font-semibold">{results.transitionStrips} pieces</span>
                      </div>
                    )}
                    {results.tackStripsNeeded === 0 && results.transitionStrips === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        <p className="text-sm">Select additional materials above</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🔨</div>
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
                      ${results.totalMaterialCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Material Cost Only</p>
                    <p className="text-xs text-gray-500 mt-2">Labor costs vary by region and installer</p>
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