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
  parquetPattern: z.enum(['herringbone', 'chevron', 'basket-weave', 'brick', 'versailles']),
  blockSize: z.number().min(6, 'Block size must be at least 6 inches'),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
  parquetCost: z.number().min(0, 'Cost must be positive'),
});

type FormData = z.infer<typeof formSchema>;

interface ParquetResults {
  roomArea: number;
  adjustedArea: number;
  blocksNeeded: number;
  squareFeetNeeded: number;
  borderTilesNeeded: number;
  cuttingWaste: number;
  laborComplexity: string;
  installationTime: number;
  totalMaterialCost: number;
  costPerSqFt: number;
  patternDescription: string;
  layoutTips: string[];
  cuttingGuide: string[];
}

export default function ParquetLayoutCalculator() {
  const [results, setResults] = useState<ParquetResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      parquetPattern: 'herringbone',
      blockSize: 12,
      wastePercentage: 15,
      parquetCost: 8.50,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1800));

    const roomArea = data.roomLength * data.roomWidth;
    
    // Pattern-specific calculations
    const patternInfo = {
      herringbone: {
        wasteMultiplier: 1.15,
        complexityRating: 'High',
        timeMultiplier: 1.5,
        description: 'Classic V-shaped pattern with 45° or 90° angles',
        borderMultiplier: 1.2
      },
      chevron: {
        wasteMultiplier: 1.20,
        complexityRating: 'Very High',
        timeMultiplier: 1.8,
        description: 'Continuous zigzag pattern with angled cuts',
        borderMultiplier: 1.3
      },
      'basket-weave': {
        wasteMultiplier: 1.10,
        complexityRating: 'Medium',
        timeMultiplier: 1.2,
        description: 'Alternating horizontal and vertical rectangles',
        borderMultiplier: 1.1
      },
      brick: {
        wasteMultiplier: 1.08,
        complexityRating: 'Low',
        timeMultiplier: 1.0,
        description: 'Offset brick pattern with staggered joints',
        borderMultiplier: 1.0
      },
      versailles: {
        wasteMultiplier: 1.25,
        complexityRating: 'Expert',
        timeMultiplier: 2.2,
        description: 'Complex French pattern with multiple sizes',
        borderMultiplier: 1.4
      }
    };

    const pattern = patternInfo[data.parquetPattern];
    const patternWaste = pattern.wasteMultiplier;
    const totalWasteMultiplier = patternWaste * (1 + data.wastePercentage / 100);
    const adjustedArea = roomArea * totalWasteMultiplier;

    const blockArea = (data.blockSize * data.blockSize) / 144; // Convert to sq ft
    const blocksNeeded = Math.ceil(adjustedArea / blockArea);
    
    // Calculate border requirements
    const perimeter = (data.roomLength + data.roomWidth) * 2;
    const borderTilesNeeded = Math.ceil(perimeter * pattern.borderMultiplier / (data.blockSize / 12));
    
    const cuttingWaste = adjustedArea - roomArea;
    const baseInstallationTime = roomArea / 50; // Base: 50 sq ft per hour
    const installationTime = Math.ceil(baseInstallationTime * pattern.timeMultiplier);

    const totalMaterialCost = adjustedArea * data.parquetCost;
    const costPerSqFt = totalMaterialCost / roomArea;

    const layoutTips = {
      herringbone: [
        'Start from center of room and work outward',
        'Use chalk lines to maintain straight rows',
        'Pre-cut border pieces for consistent gaps',
        'Maintain consistent 45° angles throughout'
      ],
      chevron: [
        'All pieces must be cut at precise angles',
        'Create templates for consistent cuts',
        'Plan starting point carefully to minimize waste',
        'Use laser level for perfect alignment'
      ],
      'basket-weave': [
        'Establish grid pattern before starting',
        'Ensure equal spacing between blocks',
        'Alternate direction every other section',
        'Check square frequently during installation'
      ],
      brick: [
        'Offset each row by half block length',
        'Start with full blocks on longest wall',
        'Plan cuts to avoid small pieces at edges',
        'Maintain consistent grout lines'
      ],
      versailles: [
        'Order pre-manufactured panels when possible',
        'Create detailed layout drawing first',
        'Sort pieces by size before starting',
        'Consider hiring specialized installer'
      ]
    };

    const cuttingGuide = {
      herringbone: [
        'Use miter saw for 45° angle cuts',
        'Cut in batches for consistency',
        'Allow 5% extra for cutting errors',
        'Pre-fit pieces before final installation'
      ],
      chevron: [
        'All pieces require angled end cuts',
        'Use jig for consistent angles',
        'Test fit pattern before cutting all pieces',
        'Sharp blade essential for clean cuts'
      ],
      'basket-weave': [
        'Most pieces install without cutting',
        'Border pieces need straight cuts only',
        'Use table saw for long straight cuts',
        'Measure twice, cut once approach'
      ],
      brick: [
        'Standard brick pattern requires minimal cuts',
        'Cut border pieces to fit room dimensions',
        'Use chop saw for quick, clean cuts',
        'Stack cut pieces by size'
      ],
      versailles: [
        'Multiple piece sizes require careful planning',
        'Create cutting list before starting',
        'Use various saw types for different cuts',
        'Consider professional cutting service'
      ]
    };

    setResults({
      roomArea,
      adjustedArea,
      blocksNeeded,
      squareFeetNeeded: adjustedArea,
      borderTilesNeeded,
      cuttingWaste,
      laborComplexity: pattern.complexityRating,
      installationTime,
      totalMaterialCost,
      costPerSqFt,
      patternDescription: pattern.description,
      layoutTips: layoutTips[data.parquetPattern],
      cuttingGuide: cuttingGuide[data.parquetPattern],
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Parquet Layout Calculator"
      description="Calculate parquet flooring patterns and material requirements for intricate wood floor designs."
      metaTitle="Parquet Flooring Calculator - Parquet Pattern Calculator | FlooringCalc Pro"
      metaDescription="Calculate parquet flooring materials and patterns. Professional parquet layout calculator for intricate wood floor designs."
      keywords={['parquet flooring calculator', 'parquet pattern calculator', 'wood parquet calculator', 'parquet layout calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Pattern Details</h4>
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
                name="parquetPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parquet Pattern</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="herringbone">Herringbone</SelectItem>
                        <SelectItem value="chevron">Chevron</SelectItem>
                        <SelectItem value="basket-weave">Basket Weave</SelectItem>
                        <SelectItem value="brick">Brick Pattern</SelectItem>
                        <SelectItem value="versailles">Versailles</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="blockSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Size (inches)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6">6" x 6"</SelectItem>
                        <SelectItem value="9">9" x 9"</SelectItem>
                        <SelectItem value="12">12" x 12"</SelectItem>
                        <SelectItem value="18">18" x 18"</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          placeholder="15"
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
                  name="parquetCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Sq Ft ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="8.50"
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
                {isCalculating ? 'Calculating Pattern...' : 'Calculate Parquet Layout'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Pattern Analysis</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="hardwood"
              variant="pattern"
            />
            
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg">Pattern Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-700">{form.watch('parquetPattern').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-sm text-gray-600 mt-1">{results.patternDescription}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Complexity:</span>
                        <div className="text-amber-700">{results.laborComplexity}</div>
                      </div>
                      <div>
                        <span className="font-medium">Install Time:</span>
                        <div className="text-amber-700">{results.installationTime} hours</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🎨</div>
                    <p className="text-sm">Select pattern for analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
                      <span className="font-medium">With Pattern Waste:</span>
                      <span className="font-semibold">{results.adjustedArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Blocks Needed:</span>
                      <span className="font-semibold text-primary">{results.blocksNeeded} blocks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Border Tiles:</span>
                      <span className="font-semibold">{results.borderTilesNeeded} pieces</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cutting Waste:</span>
                      <span className="font-semibold text-orange-600">{results.cuttingWaste.toFixed(2)} sq ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📐</div>
                    <p className="text-sm">Material requirements will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cost Analysis</CardTitle>
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
                    <p className="text-sm">Cost analysis will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Layout Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.layoutTips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Cutting Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.cuttingGuide.map((guide, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
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