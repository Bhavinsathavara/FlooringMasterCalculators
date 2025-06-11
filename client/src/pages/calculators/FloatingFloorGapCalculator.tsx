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
  flooringType: z.enum(['laminate', 'engineered-wood', 'vinyl-plank', 'bamboo']),
  plankLength: z.number().min(12, 'Plank length must be at least 12 inches'),
  plankWidth: z.number().min(3, 'Plank width must be at least 3 inches'),
  seasonalVariation: z.enum(['low', 'moderate', 'high']),
  underfloorHeating: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface ExpansionResults {
  roomArea: number;
  perimeterGap: number;
  doorwayGap: number;
  transitionGap: number;
  maxRunLength: number;
  tMoldingNeeded: number;
  quarterRoundNeeded: number;
  expansionRate: number;
  gapGuidelines: string[];
  installationTips: string[];
}

export default function FloatingFloorGapCalculator() {
  const [results, setResults] = useState<ExpansionResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      flooringType: 'laminate',
      plankLength: 48,
      plankWidth: 7,
      seasonalVariation: 'moderate',
      underfloorHeating: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    
    // Expansion coefficients by material (inches per foot per 10°F)
    const expansionCoefficients = {
      'laminate': 0.004,
      'engineered-wood': 0.003,
      'vinyl-plank': 0.006,
      'bamboo': 0.0035
    };

    // Seasonal variation factors
    const seasonalFactors = {
      'low': 1.0,      // Climate controlled environments
      'moderate': 1.3,  // Normal residential
      'high': 1.8      // High humidity variation
    };

    const baseExpansion = expansionCoefficients[data.flooringType];
    const seasonalFactor = seasonalFactors[data.seasonalVariation];
    const heatingFactor = data.underfloorHeating ? 1.4 : 1.0;
    
    const expansionRate = baseExpansion * seasonalFactor * heatingFactor;

    // Calculate gaps based on room dimensions and expansion rate
    const longestDimension = Math.max(data.roomLength, data.roomWidth);
    const expectedExpansion = longestDimension * expansionRate;

    // Minimum gaps by material and conditions
    let perimeterGap = Math.max(0.25, expectedExpansion * 2); // Minimum 1/4 inch
    let doorwayGap = Math.max(0.375, expectedExpansion * 1.5); // Minimum 3/8 inch
    let transitionGap = Math.max(0.5, expectedExpansion * 2.5); // Minimum 1/2 inch

    // Adjust for specific materials
    if (data.flooringType === 'vinyl-plank') {
      perimeterGap = Math.max(perimeterGap, 0.25);
      doorwayGap = Math.max(doorwayGap, 0.375);
      transitionGap = Math.max(transitionGap, 0.5);
    }

    // Maximum run lengths before expansion joint needed
    const maxRunLengths = {
      'laminate': 39,
      'engineered-wood': 32,
      'vinyl-plank': 50,
      'bamboo': 35
    };

    let maxRunLength = maxRunLengths[data.flooringType];
    if (data.underfloorHeating) {
      maxRunLength = maxRunLength * 0.75; // Reduce by 25% for heating
    }

    // Calculate trim needed
    const perimeter = (data.roomLength + data.roomWidth) * 2;
    const tMoldingNeeded = Math.ceil(perimeter / 8); // 8 ft pieces
    const quarterRoundNeeded = Math.ceil(perimeter / 8);

    const gapGuidelines = [
      `Maintain ${perimeterGap.toFixed(2)}" gap at all walls and fixed objects`,
      `Use ${doorwayGap.toFixed(2)}" gap at doorways and openings`,
      `Provide ${transitionGap.toFixed(2)}" gap when transitioning to other materials`,
      `Maximum continuous run: ${maxRunLength.toFixed(0)} feet`,
      data.underfloorHeating ? 'Reduce gaps gradually during heating season startup' : 'Standard seasonal expansion expected',
      `Expected seasonal movement: ${expectedExpansion.toFixed(3)}" per direction`
    ];

    const installationTips = [
      'Use spacers consistently around entire perimeter',
      'Remove spacers only after installation completion',
      'Install baseboards with gap to allow floor movement',
      'Never nail or screw through floating floor',
      'Maintain gaps at all penetrations (pipes, vents, etc.)',
      data.underfloorHeating ? 'Gradually increase heating temperature over 7 days' : 'Acclimate flooring 48-72 hours before installation'
    ];

    setResults({
      roomArea,
      perimeterGap,
      doorwayGap,
      transitionGap,
      maxRunLength,
      tMoldingNeeded,
      quarterRoundNeeded,
      expansionRate,
      gapGuidelines,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Floating Floor Gap Calculator"
      description="Calculate expansion gaps and clearances required for floating floor installations."
      metaTitle="Floating Floor Gap Calculator - Expansion Gap Calculator | FlooringCalc Pro"
      metaDescription="Calculate expansion gaps for floating floors. Professional gap calculator for laminate, engineered wood, and vinyl floating installations."
      keywords={['floating floor gap calculator', 'expansion gap calculator', 'floor expansion calculator', 'floating floor clearance']}
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
                        <SelectItem value="laminate">Laminate</SelectItem>
                        <SelectItem value="engineered-wood">Engineered Wood</SelectItem>
                        <SelectItem value="vinyl-plank">Vinyl Plank (LVP)</SelectItem>
                        <SelectItem value="bamboo">Bamboo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          step="1"
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
                          placeholder="7"
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
                name="seasonalVariation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seasonal Climate Variation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select climate variation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low (Climate Controlled)</SelectItem>
                        <SelectItem value="moderate">Moderate (Normal Residential)</SelectItem>
                        <SelectItem value="high">High (Extreme Seasonal Changes)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="underfloorHeating"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Underfloor Heating</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Radiant heating system present
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

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating Gaps...' : 'Calculate Expansion Gaps'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Gap Requirements</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="laminate"
              variant="pattern"
            />
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Required Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Perimeter Gap:</span>
                      <span className="font-semibold text-blue-600">{results.perimeterGap.toFixed(2)}"</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Doorway Gap:</span>
                      <span className="font-semibold text-blue-600">{results.doorwayGap.toFixed(2)}"</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Transition Gap:</span>
                      <span className="font-semibold text-blue-600">{results.transitionGap.toFixed(2)}"</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Max Run Length:</span>
                      <span className="font-semibold text-orange-600">{results.maxRunLength.toFixed(0)} ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📏</div>
                    <p className="text-sm">Enter details for gap calculations</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Trim Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">T-Molding Needed:</span>
                      <span className="font-semibold">{results.tMoldingNeeded} pieces</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Quarter Round:</span>
                      <span className="font-semibold">{results.quarterRoundNeeded} pieces</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Expansion Rate:</span>
                      <span className="font-semibold text-amber-600">{results.expansionRate.toFixed(4)}" per ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Trim requirements will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Gap Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.gapGuidelines.map((guideline, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {guideline}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Installation Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.installationTips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
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