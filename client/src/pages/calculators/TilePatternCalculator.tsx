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
  pattern: z.enum(['straight', 'diagonal', 'herringbone', 'chevron', 'basketweave', 'pinwheel']),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
});

type FormData = z.infer<typeof formSchema>;

interface PatternResults {
  roomArea: number;
  tilesNeeded: number;
  tilesWithWaste: number;
  boxes: number;
  cuts: number;
  laborMultiplier: number;
  installationTime: number;
  totalCost: number;
  patternTips: string[];
  complexity: string;
}

export default function TilePatternCalculator() {
  const [results, setResults] = useState<PatternResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      tileLength: 12,
      tileWidth: 12,
      pattern: 'straight',
      wastePercentage: 10,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const roomArea = data.roomLength * data.roomWidth;
    const tileAreaSqFt = (data.tileLength * data.tileWidth) / 144;
    const baseTiles = Math.ceil(roomArea / tileAreaSqFt);

    // Pattern-specific waste and complexity
    const patternFactors = {
      'straight': { waste: 0.05, labor: 1.0, cuts: 0.2, complexity: 'Simple' },
      'diagonal': { waste: 0.15, labor: 1.3, cuts: 0.4, complexity: 'Moderate' },
      'herringbone': { waste: 0.20, labor: 1.8, cuts: 0.6, complexity: 'Complex' },
      'chevron': { waste: 0.25, labor: 2.0, cuts: 0.7, complexity: 'Complex' },
      'basketweave': { waste: 0.15, labor: 1.5, cuts: 0.5, complexity: 'Moderate' },
      'pinwheel': { waste: 0.18, labor: 1.6, cuts: 0.5, complexity: 'Moderate' }
    };

    const patternData = patternFactors[data.pattern];
    const totalWaste = (data.wastePercentage / 100) + patternData.waste;
    const tilesWithWaste = Math.ceil(baseTiles * (1 + totalWaste));
    const boxes = Math.ceil(tilesWithWaste / 15); // 15 tiles per box average
    const cuts = Math.ceil(baseTiles * patternData.cuts);
    const installationTime = roomArea * 0.75 * patternData.labor; // hours

    // Cost calculation
    const tileCost = tilesWithWaste * 3.50; // $3.50 per tile
    const laborCost = installationTime * 45; // $45/hour
    const totalCost = tileCost + laborCost;

    // Pattern-specific tips
    const patternTips = {
      'straight': [
        'Start from center of room for balanced borders',
        'Use chalk lines to ensure straight rows',
        'Plan tile layout to minimize small cuts at edges'
      ],
      'diagonal': [
        'Mark 45-degree reference lines from room center',
        'Start with full tiles in center, work outward',
        'Border tiles will all need diagonal cuts'
      ],
      'herringbone': [
        'Use rectangular tiles (not square) for best effect',
        'Start from room center with perpendicular chalk lines',
        'Maintain consistent 90-degree angles between tiles'
      ],
      'chevron': [
        'Requires precise 45-degree cuts on tile ends',
        'Start with center line and work symmetrically',
        'Consider factory-cut chevron tiles to reduce waste'
      ],
      'basketweave': [
        'Works best with square tiles',
        'Maintain consistent spacing between tile groups',
        'Plan layout to avoid awkward partial patterns at edges'
      ],
      'pinwheel': [
        'Combine large and small tiles for visual interest',
        'Mark grid pattern before starting installation',
        'Keep grout lines consistent throughout pattern'
      ]
    };

    setResults({
      roomArea,
      tilesNeeded: baseTiles,
      tilesWithWaste,
      boxes,
      cuts,
      laborMultiplier: patternData.labor,
      installationTime,
      totalCost,
      patternTips: patternTips[data.pattern],
      complexity: patternData.complexity,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Tile Pattern Calculator"
      description="Calculate materials for complex tile patterns including herringbone, chevron, and basketweave layouts."
      metaTitle="Tile Pattern Calculator - Herringbone & Pattern Layout | FlooringCalc Pro"
      metaDescription="Calculate tile quantities for complex patterns like herringbone, chevron, and basketweave. Professional pattern layout calculator."
      keywords={['tile pattern calculator', 'herringbone tile calculator', 'chevron tile calculator', 'tile layout calculator']}
      faqs={[
        {
          question: "How much extra tile do I need for pattern layouts?",
          answer: "Pattern layouts require additional waste: Diagonal 15%, Herringbone 20-25%, Chevron 25-30%, Basketweave 15-20%. Complex patterns need more material for cuts and mistakes."
        },
        {
          question: "What's the difference between herringbone and chevron patterns?",
          answer: "Herringbone uses rectangular tiles at 90-degree angles forming zigzag pattern. Chevron requires tiles cut at 45-degree angles to form continuous V-shapes with no breaks."
        },
        {
          question: "Which tile patterns are best for small rooms?",
          answer: "Diagonal and herringbone patterns make small rooms appear larger. Avoid large-scale patterns in small spaces. Straight lay is safest for rooms under 100 sq ft."
        },
        {
          question: "Do pattern layouts require special installation skills?",
          answer: "Yes, complex patterns require experienced installers. Herringbone and chevron need precise measurements and cuts. Consider hiring professionals for intricate patterns to avoid costly mistakes."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Pattern Specifications</h4>
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

              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tile Pattern</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="straight">Straight Lay (Grid)</SelectItem>
                        <SelectItem value="diagonal">Diagonal</SelectItem>
                        <SelectItem value="herringbone">Herringbone</SelectItem>
                        <SelectItem value="chevron">Chevron</SelectItem>
                        <SelectItem value="basketweave">Basketweave</SelectItem>
                        <SelectItem value="pinwheel">Pinwheel</SelectItem>
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
                    <FormLabel>Base Waste Percentage (%)</FormLabel>
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

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate Pattern Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Pattern Results</h4>
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
                    <span className="text-gray-600">Base Tiles Needed:</span>
                    <span className="font-semibold">{results.tilesNeeded} tiles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiles with Waste:</span>
                    <span className="font-semibold text-primary">{results.tilesWithWaste} tiles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Boxes Needed:</span>
                    <span className="font-semibold">{results.boxes} boxes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Cuts:</span>
                    <span className="font-semibold">{results.cuts} cuts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complexity:</span>
                    <span className="font-semibold">{results.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Installation Time:</span>
                    <span className="font-semibold">{results.installationTime.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Estimated Total Cost:</span>
                    <span className="font-bold text-lg text-primary">${results.totalCost.toFixed(0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pattern Installation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.patternTips.map((tip, index) => (
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
                  <p>Select your tile pattern to calculate requirements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating pattern layout..." theme="tile" />
    </Calculator>
  );
}