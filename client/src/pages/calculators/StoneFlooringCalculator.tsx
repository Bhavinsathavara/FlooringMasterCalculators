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
  stoneType: z.enum(['marble', 'granite', 'travertine', 'limestone', 'slate', 'sandstone', 'quartzite']),
  tileSize: z.enum(['12x12', '18x18', '24x24', '12x24', '16x16', 'custom']),
  customLength: z.number().min(6).optional(),
  customWidth: z.number().min(6).optional(),
  thickness: z.enum(['3/8', '1/2', '5/8', '3/4', '1-inch']),
  finish: z.enum(['polished', 'honed', 'tumbled', 'brushed', 'natural']),
  groutJointSize: z.enum(['1/16', '1/8', '3/16', '1/4', '3/8']),
  installationType: z.enum(['thin-set', 'thick-bed', 'dry-lay']),
  sealerType: z.enum(['none', 'penetrating', 'topical', 'enhancing']),
  includeUnderlayment: z.boolean(),
  includeWaterproofing: z.boolean(),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
});

type FormData = z.infer<typeof formSchema>;

interface StoneResults {
  roomArea: number;
  tileArea: number;
  tilesNeeded: number;
  squareFeetNeeded: number;
  groutNeeded: number;
  thinSetNeeded: number;
  sealerNeeded: number;
  underlaymentNeeded: number;
  waterproofingNeeded: number;
  laborHours: number;
  totalMaterialCost: number;
  installationTips: string[];
  maintenanceGuide: string[];
  durabilityRating: string;
}

export default function StoneFlooringCalculator() {
  const [results, setResults] = useState<StoneResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      stoneType: 'marble',
      tileSize: '12x12',
      customLength: 0,
      customWidth: 0,
      thickness: '1/2',
      finish: 'polished',
      groutJointSize: '1/8',
      installationType: 'thin-set',
      sealerType: 'penetrating',
      includeUnderlayment: false,
      includeWaterproofing: false,
      wastePercentage: 15,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;

    // Calculate tile dimensions
    let tileLength = 12;
    let tileWidth = 12;
    
    if (data.tileSize === 'custom') {
      tileLength = data.customLength || 12;
      tileWidth = data.customWidth || 12;
    } else {
      const dimensions = data.tileSize.split('x').map(d => parseInt(d));
      tileLength = dimensions[0];
      tileWidth = dimensions[1];
    }

    const tileArea = (tileLength * tileWidth) / 144; // Convert to sq ft
    const baseTiles = Math.ceil(roomArea / tileArea);
    const tilesNeeded = Math.ceil(baseTiles * (1 + data.wastePercentage / 100));
    const squareFeetNeeded = tilesNeeded * tileArea;

    // Grout calculation based on tile size and joint width
    const groutJointWidths = {
      '1/16': 0.0625,
      '1/8': 0.125,
      '3/16': 0.1875,
      '1/4': 0.25,
      '3/8': 0.375,
    };

    const jointWidth = groutJointWidths[data.groutJointSize];
    const groutCoverage = (tileLength + tileWidth) * jointWidth * 2 / 144; // Rough estimate
    const groutNeeded = Math.ceil((squareFeetNeeded * groutCoverage) / 50); // 50 lb bags

    // Thin-set/adhesive calculation
    const thinSetCoverage = {
      'thin-set': 95, // sq ft per 50 lb bag
      'thick-bed': 40, // sq ft per 50 lb bag
      'dry-lay': 0,
    };

    const thinSetNeeded = data.installationType !== 'dry-lay' 
      ? Math.ceil(squareFeetNeeded / thinSetCoverage[data.installationType])
      : 0;

    // Sealer calculation
    const sealerCoverage = {
      'none': 0,
      'penetrating': 150, // sq ft per gallon
      'topical': 200,
      'enhancing': 175,
    };

    const sealerNeeded = data.sealerType !== 'none' 
      ? Math.ceil(squareFeetNeeded / sealerCoverage[data.sealerType])
      : 0;

    // Underlayment and waterproofing
    const underlaymentNeeded = data.includeUnderlayment ? Math.ceil(roomArea * 1.05) : 0;
    const waterproofingNeeded = data.includeWaterproofing ? Math.ceil(roomArea * 1.1) : 0;

    // Labor hours calculation
    const thicknessFactors = {
      '3/8': 1.0,
      '1/2': 1.1,
      '5/8': 1.2,
      '3/4': 1.3,
      '1-inch': 1.5,
    };

    const stoneFactors = {
      marble: 1.3,
      granite: 1.4,
      travertine: 1.1,
      limestone: 1.2,
      slate: 1.5,
      sandstone: 1.2,
      quartzite: 1.4,
    };

    const baseHours = roomArea * 0.8; // 0.8 hours per sq ft base
    const laborHours = baseHours * thicknessFactors[data.thickness] * stoneFactors[data.stoneType];

    // Cost calculations
    const stoneCosts = {
      marble: { '3/8': 8.50, '1/2': 12.00, '5/8': 15.50, '3/4': 18.00, '1-inch': 25.00 },
      granite: { '3/8': 7.50, '1/2': 10.50, '5/8': 14.00, '3/4': 16.50, '1-inch': 22.00 },
      travertine: { '3/8': 5.50, '1/2': 7.50, '5/8': 9.50, '3/4': 12.00, '1-inch': 16.00 },
      limestone: { '3/8': 6.00, '1/2': 8.50, '5/8': 11.00, '3/4': 13.50, '1-inch': 18.00 },
      slate: { '3/8': 7.00, '1/2': 9.50, '5/8': 12.50, '3/4': 15.00, '1-inch': 20.00 },
      sandstone: { '3/8': 4.50, '1/2': 6.50, '5/8': 8.50, '3/4': 11.00, '1-inch': 15.00 },
      quartzite: { '3/8': 9.50, '1/2': 13.50, '5/8': 17.00, '3/4': 20.00, '1-inch': 28.00 },
    };

    const stoneCost = squareFeetNeeded * stoneCosts[data.stoneType][data.thickness];
    const groutCost = groutNeeded * 18; // $18 per 50 lb bag
    const thinSetCost = thinSetNeeded * 22; // $22 per 50 lb bag
    const sealerCost = sealerNeeded * 45; // $45 per gallon
    const underlaymentCost = underlaymentNeeded * 1.25; // $1.25 per sq ft
    const waterproofingCost = waterproofingNeeded * 2.50; // $2.50 per sq ft

    const totalMaterialCost = stoneCost + groutCost + thinSetCost + sealerCost + 
                             underlaymentCost + waterproofingCost;

    // Installation tips
    const installationTips: string[] = [
      'Ensure subfloor is level within 1/8" over 10 feet',
      'Allow stone to acclimate 24-48 hours before installation',
      'Use proper stone-specific cutting tools with water cooling',
      'Back-butter large format tiles for better adhesion',
    ];

    if (data.stoneType === 'marble' || data.stoneType === 'limestone') {
      installationTips.push('Use white or light-colored thin-set to prevent staining');
    }

    if (data.finish === 'polished') {
      installationTips.push('Handle polished surfaces carefully to avoid scratches');
    }

    if (data.includeWaterproofing) {
      installationTips.push('Apply waterproofing membrane before tile installation');
    }

    // Maintenance guide
    const maintenanceGuide: string[] = [
      'Sweep or vacuum regularly to remove grit and debris',
      'Clean with pH-neutral stone cleaner only',
      'Avoid acidic cleaners that can etch natural stone',
    ];

    if (data.sealerType !== 'none') {
      maintenanceGuide.push('Reseal stone every 1-3 years depending on traffic');
    }

    if (data.stoneType === 'marble' || data.stoneType === 'limestone') {
      maintenanceGuide.push('Wipe up spills immediately to prevent staining');
    }

    // Durability ratings
    const durabilityRatings = {
      marble: 'Good - 25+ years with proper care',
      granite: 'Excellent - 50+ years',
      travertine: 'Good - 20-30 years',
      limestone: 'Good - 25-35 years',
      slate: 'Excellent - 50+ years',
      sandstone: 'Fair - 15-25 years',
      quartzite: 'Excellent - 50+ years',
    };

    setResults({
      roomArea,
      tileArea,
      tilesNeeded,
      squareFeetNeeded,
      groutNeeded,
      thinSetNeeded,
      sealerNeeded,
      underlaymentNeeded,
      waterproofingNeeded,
      laborHours,
      totalMaterialCost,
      installationTips,
      maintenanceGuide,
      durabilityRating: durabilityRatings[data.stoneType],
    });
  };

  return (
    <Calculator
      title="Stone Flooring Calculator"
      description="Calculate natural stone flooring materials including marble, granite, travertine, and slate."
      metaTitle="Stone Flooring Calculator - Marble Granite Calculator | FlooringCalc Pro"
      metaDescription="Calculate stone flooring materials including marble, granite, travertine, and slate tiles. Professional natural stone calculator."
      keywords={['stone flooring calculator', 'marble tile calculator', 'granite flooring calculator', 'natural stone calculator']}
      category="materials"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Stone Specifications</h4>
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
                  name="stoneType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stone Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stone type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="marble">Marble</SelectItem>
                          <SelectItem value="granite">Granite</SelectItem>
                          <SelectItem value="travertine">Travertine</SelectItem>
                          <SelectItem value="limestone">Limestone</SelectItem>
                          <SelectItem value="slate">Slate</SelectItem>
                          <SelectItem value="sandstone">Sandstone</SelectItem>
                          <SelectItem value="quartzite">Quartzite</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tileSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Size (inches)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tile size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12x12">12" x 12"</SelectItem>
                          <SelectItem value="18x18">18" x 18"</SelectItem>
                          <SelectItem value="24x24">24" x 24"</SelectItem>
                          <SelectItem value="12x24">12" x 24"</SelectItem>
                          <SelectItem value="16x16">16" x 16"</SelectItem>
                          <SelectItem value="custom">Custom Size</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('tileSize') === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Length (inches)</FormLabel>
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
                        <FormLabel>Custom Width (inches)</FormLabel>
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
                          <SelectItem value="3/8">3/8 inch</SelectItem>
                          <SelectItem value="1/2">1/2 inch</SelectItem>
                          <SelectItem value="5/8">5/8 inch</SelectItem>
                          <SelectItem value="3/4">3/4 inch</SelectItem>
                          <SelectItem value="1-inch">1 inch</SelectItem>
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
                          <SelectItem value="polished">Polished</SelectItem>
                          <SelectItem value="honed">Honed</SelectItem>
                          <SelectItem value="tumbled">Tumbled</SelectItem>
                          <SelectItem value="brushed">Brushed</SelectItem>
                          <SelectItem value="natural">Natural</SelectItem>
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
                  name="groutJointSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grout Joint Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select joint size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1/16">1/16 inch</SelectItem>
                          <SelectItem value="1/8">1/8 inch</SelectItem>
                          <SelectItem value="3/16">3/16 inch</SelectItem>
                          <SelectItem value="1/4">1/4 inch</SelectItem>
                          <SelectItem value="3/8">3/8 inch</SelectItem>
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
                      <FormLabel>Installation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="thin-set">Thin-Set Adhesive</SelectItem>
                          <SelectItem value="thick-bed">Thick-Bed Mortar</SelectItem>
                          <SelectItem value="dry-lay">Dry-Lay (Sand Base)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sealerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sealer Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sealer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Sealer</SelectItem>
                        <SelectItem value="penetrating">Penetrating Sealer</SelectItem>
                        <SelectItem value="topical">Topical Sealer</SelectItem>
                        <SelectItem value="enhancing">Color Enhancing Sealer</SelectItem>
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
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Additional Options</h5>
                
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
                      <FormLabel className="text-sm font-normal">Include underlayment/backer board</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeWaterproofing"
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
                      <FormLabel className="text-sm font-normal">Include waterproofing membrane</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Stone Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Stone Tiles</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tiles Needed:</span>
                      <span className="font-semibold text-primary">{results.tilesNeeded} tiles</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Sq Ft:</span>
                      <span className="font-semibold text-secondary">{results.squareFeetNeeded.toFixed(2)} sq ft</span>
                    </div>
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
                    <div className="text-3xl mb-2">🪨</div>
                    <p className="text-sm">Enter details to calculate stone</p>
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
                    {results.groutNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Grout:</span>
                        <span className="font-semibold">{results.groutNeeded} bags (50 lb)</span>
                      </div>
                    )}
                    {results.thinSetNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold">{results.thinSetNeeded} bags (50 lb)</span>
                      </div>
                    )}
                    {results.sealerNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sealer:</span>
                        <span className="font-semibold">{results.sealerNeeded} gallons</span>
                      </div>
                    )}
                    {results.underlaymentNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Underlayment:</span>
                        <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                      </div>
                    )}
                    {results.waterproofingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Waterproofing:</span>
                        <span className="font-semibold">{results.waterproofingNeeded} sq ft</span>
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
                      ${results.totalMaterialCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Material Cost Only</p>
                    <p className="text-xs text-gray-500 mt-2">Professional installation recommended</p>
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

            <Card className="bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg">Maintenance Guide</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.maintenanceGuide.map((guide, index) => (
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