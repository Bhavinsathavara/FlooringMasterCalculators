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
  tileLength: z.number().min(1, 'Tile length must be greater than 0'),
  tileWidth: z.number().min(1, 'Tile width must be greater than 0'),
  groutWidth: z.number().min(0.0625, 'Grout width must be at least 1/16 inch'),
  groutDepth: z.number().min(0.125, 'Grout depth must be at least 1/8 inch'),
  groutType: z.enum(['sanded', 'unsanded', 'epoxy']),
});

type FormData = z.infer<typeof formSchema>;

interface GroutResults {
  roomArea: number;
  tileArea: number;
  tilesNeeded: number;
  groutVolume: number;
  groutPounds: number;
  groutBags: number;
  totalCost: number;
  applicationTips: string[];
}

export default function TileGroutCalculator() {
  const [results, setResults] = useState<GroutResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      tileLength: 12,
      tileWidth: 12,
      groutWidth: 0.125,
      groutDepth: 0.25,
      groutType: 'sanded',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const tileAreaSqIn = data.tileLength * data.tileWidth;
    const tileAreaSqFt = tileAreaSqIn / 144;
    const tilesNeeded = Math.ceil(roomArea / tileAreaSqFt);

    // Calculate grout volume
    const perimeterPerTile = 2 * (data.tileLength + data.tileWidth);
    const groutVolumePerTile = perimeterPerTile * data.groutWidth * data.groutDepth;
    const totalGroutVolume = (groutVolumePerTile * tilesNeeded) / 1728; // cubic feet

    // Convert to pounds (grout weighs about 100-110 lbs per cubic foot)
    const groutWeight = {
      'sanded': 105,
      'unsanded': 100,
      'epoxy': 110
    };

    const groutPounds = totalGroutVolume * groutWeight[data.groutType];
    const groutBags = Math.ceil(groutPounds / 25); // 25 lb bags

    // Cost calculation
    const bagCosts = {
      'sanded': 18,
      'unsanded': 16,
      'epoxy': 45
    };

    const totalCost = groutBags * bagCosts[data.groutType];

    const applicationTips = [
      'Mix only what you can use in 30 minutes',
      'Work diagonally across tiles to avoid pulling grout out',
      'Clean excess grout before it cures completely',
      'Allow 24-48 hours before sealing grout lines'
    ];

    if (data.groutType === 'epoxy') {
      applicationTips.push('Epoxy grout requires immediate cleanup - have multiple sponges ready');
    }

    if (data.groutWidth < 0.125) {
      applicationTips.push('Use unsanded grout for joints less than 1/8 inch');
    }

    setResults({
      roomArea,
      tileArea: tileAreaSqFt,
      tilesNeeded,
      groutVolume: totalGroutVolume,
      groutPounds,
      groutBags,
      totalCost,
      applicationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Tile Grout Calculator"
      description="Calculate grout quantities needed based on tile size and grout joint width."
      metaTitle="Tile Grout Calculator - Grout Quantity Estimator | FlooringCalc Pro"
      metaDescription="Calculate tile grout quantities needed based on tile size and grout joint width. Professional grout calculator for any tile project."
      keywords={['tile grout calculator', 'grout quantity calculator', 'tile grout estimator', 'ceramic tile grout']}
      faqs={[
        {
          question: "How much grout do I need for tile installation?",
          answer: "Grout needs depend on tile size and joint width. Generally, 1 bag covers 50-100 sq ft for 12\" tiles with 1/8\" joints. Larger tiles or wider joints require more grout per square foot."
        },
        {
          question: "What's the difference between sanded and unsanded grout?",
          answer: "Sanded grout is for joints 1/8\" and wider, provides strength and prevents shrinkage. Unsanded grout is for joints under 1/8\", smoother finish but can crack in wide joints."
        },
        {
          question: "How long should grout cure before sealing?",
          answer: "Wait 24-48 hours for cement-based grout to cure before applying sealer. Epoxy grout doesn't require sealing. Test cure by checking if grout darkens when wet."
        },
        {
          question: "Can I use epoxy grout for all tile installations?",
          answer: "Epoxy grout works for all applications but costs 3x more than cement grout. Best for high-moisture areas, heavy traffic, and stain resistance. Harder to work with and clean."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Tile & Grout Specifications</h4>
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
                  name="tileLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Length (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.125"
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
                  name="tileWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.125"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="groutWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grout Joint Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0625"
                          placeholder="0.125"
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
                  name="groutDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grout Depth (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.125"
                          placeholder="0.25"
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
                name="groutType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grout Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grout type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sanded">Sanded Grout (joints 1/8 inch and larger)</SelectItem>
                        <SelectItem value="unsanded">Unsanded Grout (joints less than 1/8 inch)</SelectItem>
                        <SelectItem value="epoxy">Epoxy Grout (premium)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate Grout Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Grout Requirements</h4>
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
                    <span className="text-gray-600">Tiles Needed:</span>
                    <span className="font-semibold">{results.tilesNeeded} tiles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grout Volume:</span>
                    <span className="font-semibold">{results.groutVolume.toFixed(3)} cu ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grout Weight:</span>
                    <span className="font-semibold">{results.groutPounds.toFixed(1)} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grout Bags (25 lb):</span>
                    <span className="font-semibold text-primary">{results.groutBags} bags</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-bold text-lg text-primary">${results.totalCost}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.applicationTips.map((tip, index) => (
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
                  <p>Enter your tile specifications to calculate grout requirements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating grout requirements..." theme="tile" />
    </Calculator>
  );
}