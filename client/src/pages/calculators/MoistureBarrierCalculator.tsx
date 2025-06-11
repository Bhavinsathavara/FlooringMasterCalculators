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
import { Checkbox } from '@/components/ui/checkbox';
import LoadingOverlay from '@/components/LoadingOverlay';

const formSchema = z.object({
  roomLength: z.number().min(0.1, 'Room length must be greater than 0'),
  roomWidth: z.number().min(0.1, 'Room width must be greater than 0'),
  subfloorType: z.enum(['concrete', 'crawlspace', 'basement', 'slab']),
  moistureLevel: z.enum(['low', 'moderate', 'high', 'extreme']),
  barrierType: z.enum(['plastic-sheeting', 'vapor-retarder', 'membrane', 'primer-sealer']),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  includeSeamTape: z.boolean(),
  includePrimer: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface MoistureBarrierResults {
  roomArea: number;
  adjustedArea: number;
  rollsNeeded: number;
  seamTapeNeeded: number;
  primerNeeded: number;
  totalCost: number;
  installationTips: string[];
  moistureRating: string;
}

export default function MoistureBarrierCalculator() {
  const [results, setResults] = useState<MoistureBarrierResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      subfloorType: 'concrete',
      moistureLevel: 'moderate',
      barrierType: 'vapor-retarder',
      wastePercentage: 10,
      includeSeamTape: true,
      includePrimer: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    
    // Roll coverage varies by barrier type
    const rollCoverage = {
      'plastic-sheeting': 1000, // sq ft per roll
      'vapor-retarder': 500,
      'membrane': 200,
      'primer-sealer': 300
    };

    const rollsNeeded = Math.ceil(adjustedArea / rollCoverage[data.barrierType]);
    
    // Calculate seam tape (perimeter + seams)
    const perimeter = 2 * (data.roomLength + data.roomWidth);
    const additionalSeams = Math.floor(adjustedArea / 200) * 20; // Estimate internal seams
    const seamTapeNeeded = data.includeSeamTape ? Math.ceil((perimeter + additionalSeams) / 50) : 0; // 50 ft rolls

    // Primer calculation
    const primerNeeded = data.includePrimer ? Math.ceil(roomArea / 200) : 0; // gallons

    // Cost calculation
    const barrierCosts = {
      'plastic-sheeting': 125,
      'vapor-retarder': 285,
      'membrane': 450,
      'primer-sealer': 350
    };

    const barrierCost = rollsNeeded * barrierCosts[data.barrierType];
    const seamTapeCost = seamTapeNeeded * 45; // $45 per roll
    const primerCost = primerNeeded * 65; // $65 per gallon
    const totalCost = barrierCost + seamTapeCost + primerCost;

    // Moisture ratings
    const moistureRatings = {
      'low': 'Standard protection adequate',
      'moderate': 'Enhanced vapor retarder recommended',
      'high': 'Premium membrane barrier required',
      'extreme': 'Multiple barrier system needed'
    };

    // Installation tips based on conditions
    const installationTips = [
      'Clean and prepare subfloor before installation',
      'Overlap seams by minimum 6 inches',
      'Seal all penetrations with appropriate sealant'
    ];

    if (data.subfloorType === 'concrete') {
      installationTips.push('Test concrete moisture levels before installation');
    }

    if (data.moistureLevel === 'high' || data.moistureLevel === 'extreme') {
      installationTips.push('Consider professional moisture testing');
      installationTips.push('Install dehumidification if needed');
    }

    if (data.barrierType === 'membrane') {
      installationTips.push('Use compatible adhesives for membrane systems');
    }

    installationTips.push('Allow proper cure time before flooring installation');

    setResults({
      roomArea,
      adjustedArea,
      rollsNeeded,
      seamTapeNeeded,
      primerNeeded,
      totalCost,
      installationTips,
      moistureRating: moistureRatings[data.moistureLevel],
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Moisture Barrier Calculator"
      description="Calculate moisture barrier materials for subfloor protection and vapor control systems."
      metaTitle="Moisture Barrier Calculator - Vapor Barrier Calculator | FlooringCalc Pro"
      metaDescription="Calculate moisture barrier materials for subfloor protection. Professional vapor barrier calculator for concrete and basement installations."
      keywords={['moisture barrier calculator', 'vapor barrier calculator', 'subfloor moisture protection', 'concrete moisture barrier']}
      faqs={[
        {
          question: "When do I need a moisture barrier under flooring?",
          answer: "Install moisture barriers over concrete subfloors, in basements, crawlspaces, or areas with high humidity. Required for most floating floors and recommended for engineered wood over concrete."
        },
        {
          question: "What's the difference between vapor barrier and vapor retarder?",
          answer: "Vapor barriers block nearly all moisture (perm rating <0.1), while vapor retarders slow moisture transmission (0.1-1.0 perm). Choose based on climate and flooring type requirements."
        },
        {
          question: "How do I test subfloor moisture levels?",
          answer: "Use calcium chloride tests for 72 hours or relative humidity probes. Concrete should be <4.5% moisture content for most flooring installations, <2.5% for some engineered products."
        },
        {
          question: "Can I install flooring immediately after moisture barrier?",
          answer: "Allow adhesive-applied barriers to cure 24-48 hours. Mechanical barriers (plastic sheeting) can have flooring installed immediately if properly sealed and secured."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Moisture Control Specifications</h4>
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
                name="subfloorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subfloor Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subfloor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="concrete">Concrete Slab</SelectItem>
                        <SelectItem value="crawlspace">Crawlspace</SelectItem>
                        <SelectItem value="basement">Basement</SelectItem>
                        <SelectItem value="slab">Slab on Grade</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moistureLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moisture Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select moisture level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Dry conditions</SelectItem>
                        <SelectItem value="moderate">Moderate - Normal humidity</SelectItem>
                        <SelectItem value="high">High - Wet conditions</SelectItem>
                        <SelectItem value="extreme">Extreme - Standing water</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barrierType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barrier Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select barrier type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="plastic-sheeting">Plastic Sheeting (6 mil)</SelectItem>
                        <SelectItem value="vapor-retarder">Vapor Retarder</SelectItem>
                        <SelectItem value="membrane">Premium Membrane</SelectItem>
                        <SelectItem value="primer-sealer">Primer/Sealer System</SelectItem>
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

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="includeSeamTape"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Seam Tape</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includePrimer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Primer/Sealer</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate Moisture Barrier
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Moisture Protection Results</h4>
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Material Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Area:</span>
                    <span className="font-semibold">{results.roomArea.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Needed:</span>
                    <span className="font-semibold">{results.adjustedArea.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barrier Rolls:</span>
                    <span className="font-semibold text-primary">{results.rollsNeeded} rolls</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seam Tape Rolls:</span>
                    <span className="font-semibold">{results.seamTapeNeeded} rolls</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primer Needed:</span>
                    <span className="font-semibold">{results.primerNeeded} gallons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moisture Rating:</span>
                    <span className="font-semibold">{results.moistureRating}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-bold text-lg text-primary">${results.totalCost}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Installation Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.installationTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary font-bold">•</span>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <p>Enter moisture control specifications to calculate barrier requirements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating moisture protection..." theme="concrete" />
    </Calculator>
  );
}