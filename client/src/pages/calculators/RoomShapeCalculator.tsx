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
  roomShape: z.enum(['rectangle', 'l-shape', 'u-shape', 'circle', 'triangle', 'octagon', 'custom']),
  // Rectangle
  length: z.number().min(0.1).optional(),
  width: z.number().min(0.1).optional(),
  // L-Shape
  length1: z.number().min(0.1).optional(),
  width1: z.number().min(0.1).optional(),
  length2: z.number().min(0.1).optional(),
  width2: z.number().min(0.1).optional(),
  // U-Shape
  outerLength: z.number().min(0.1).optional(),
  outerWidth: z.number().min(0.1).optional(),
  innerLength: z.number().min(0.1).optional(),
  innerWidth: z.number().min(0.1).optional(),
  // Circle
  radius: z.number().min(0.1).optional(),
  diameter: z.number().min(0.1).optional(),
  // Triangle
  base: z.number().min(0.1).optional(),
  height: z.number().min(0.1).optional(),
  side1: z.number().min(0.1).optional(),
  side2: z.number().min(0.1).optional(),
  side3: z.number().min(0.1).optional(),
  // Octagon
  sideLength: z.number().min(0.1).optional(),
  // Custom
  totalArea: z.number().min(0.1).optional(),
  perimeter: z.number().min(0.1).optional(),
  wastePercentage: z.number().min(5).max(30, 'Waste percentage must be between 5-30%'),
  includeClosets: z.boolean(),
  numberOfClosets: z.number().min(0).max(10).optional(),
  closetArea: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RoomResults {
  totalArea: number;
  perimeter: number;
  adjustedArea: number;
  complexityFactor: number;
  materialNeeded: number;
  wasteAmount: number;
  cuttingWaste: number;
  installationDifficulty: string;
  installationTips: string[];
  areaBreakdown: { [key: string]: number };
}

export default function RoomShapeCalculator() {
  const [results, setResults] = useState<RoomResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomShape: 'rectangle',
      length: 0,
      width: 0,
      wastePercentage: 10,
      includeClosets: false,
      numberOfClosets: 0,
      closetArea: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    let area = 0;
    let perimeter = 0;
    let complexityFactor = 1.0;
    const areaBreakdown: { [key: string]: number } = {};

    switch (data.roomShape) {
      case 'rectangle':
        area = (data.length || 0) * (data.width || 0);
        perimeter = 2 * ((data.length || 0) + (data.width || 0));
        complexityFactor = 1.0;
        areaBreakdown['Main Rectangle'] = area;
        break;

      case 'l-shape':
        const rect1 = (data.length1 || 0) * (data.width1 || 0);
        const rect2 = (data.length2 || 0) * (data.width2 || 0);
        area = rect1 + rect2;
        // Simplified perimeter calculation
        perimeter = 2 * ((data.length1 || 0) + (data.width1 || 0) + (data.length2 || 0) + (data.width2 || 0)) * 0.8;
        complexityFactor = 1.3;
        areaBreakdown['Section 1'] = rect1;
        areaBreakdown['Section 2'] = rect2;
        break;

      case 'u-shape':
        const outerArea = (data.outerLength || 0) * (data.outerWidth || 0);
        const innerArea = (data.innerLength || 0) * (data.innerWidth || 0);
        area = outerArea - innerArea;
        perimeter = 2 * ((data.outerLength || 0) + (data.outerWidth || 0) + (data.innerLength || 0) + (data.innerWidth || 0));
        complexityFactor = 1.5;
        areaBreakdown['Outer Area'] = outerArea;
        areaBreakdown['Inner Cutout'] = -innerArea;
        break;

      case 'circle':
        const r = data.radius || (data.diameter || 0) / 2;
        area = Math.PI * r * r;
        perimeter = 2 * Math.PI * r;
        complexityFactor = 1.4;
        areaBreakdown['Circular Area'] = area;
        break;

      case 'triangle':
        if (data.base && data.height) {
          area = 0.5 * data.base * data.height;
          // Estimate perimeter if not all sides given
          const s1 = data.side1 || data.base;
          const s2 = data.side2 || Math.sqrt((data.height ** 2) + ((data.base / 2) ** 2));
          const s3 = data.side3 || Math.sqrt((data.height ** 2) + ((data.base / 2) ** 2));
          perimeter = s1 + s2 + s3;
          complexityFactor = 1.6;
          areaBreakdown['Triangle Area'] = area;
        }
        break;

      case 'octagon':
        if (data.sideLength) {
          area = 2 * (1 + Math.sqrt(2)) * (data.sideLength ** 2);
          perimeter = 8 * data.sideLength;
          complexityFactor = 1.7;
          areaBreakdown['Octagon Area'] = area;
        }
        break;

      case 'custom':
        area = data.totalArea || 0;
        perimeter = data.perimeter || 0;
        complexityFactor = 1.2;
        areaBreakdown['Custom Area'] = area;
        break;
    }

    // Add closets if included
    let closetArea = 0;
    if (data.includeClosets && data.numberOfClosets && data.closetArea) {
      closetArea = data.numberOfClosets * data.closetArea;
      area += closetArea;
      areaBreakdown['Closets'] = closetArea;
    }

    // Calculate cutting waste based on complexity
    const cuttingWasteFactors = {
      rectangle: 0.05,
      'l-shape': 0.15,
      'u-shape': 0.20,
      circle: 0.25,
      triangle: 0.30,
      octagon: 0.35,
      custom: 0.15,
    };

    const baseCuttingWaste = cuttingWasteFactors[data.roomShape];
    const totalWastePercentage = data.wastePercentage + (baseCuttingWaste * 100);
    
    const materialNeeded = area * (1 + totalWastePercentage / 100);
    const wasteAmount = materialNeeded - area;
    const cuttingWaste = area * baseCuttingWaste;

    // Installation difficulty
    const difficultyLevels = {
      rectangle: 'Easy - Minimal cuts required',
      'l-shape': 'Moderate - Some complex cuts',
      'u-shape': 'Moderate-Hard - Multiple inside corners',
      circle: 'Hard - Curved cuts required',
      triangle: 'Hard - Angled cuts throughout',
      octagon: 'Very Hard - Multiple angles',
      custom: 'Varies - Depends on shape complexity',
    };

    // Installation tips based on shape
    const installationTips: string[] = [];
    
    switch (data.roomShape) {
      case 'rectangle':
        installationTips.push('Start from the longest, straightest wall');
        installationTips.push('Ensure first row is perfectly straight');
        break;
      case 'l-shape':
        installationTips.push('Plan layout to minimize cuts in visible areas');
        installationTips.push('Start installation from the main room area');
        installationTips.push('Use transition strips at direction changes if needed');
        break;
      case 'u-shape':
        installationTips.push('Plan material direction for best visual flow');
        installationTips.push('Consider expansion gaps at inside corners');
        break;
      case 'circle':
        installationTips.push('Create paper template for curved cuts');
        installationTips.push('Work from center outward in concentric patterns');
        installationTips.push('Use fine-tooth saw for smooth curves');
        break;
      case 'triangle':
        installationTips.push('Calculate all angles before cutting');
        installationTips.push('Use miter saw for precise angle cuts');
        installationTips.push('Test fit pieces before final installation');
        break;
      case 'octagon':
        installationTips.push('Create detailed cutting diagram');
        installationTips.push('Number all pieces for reference');
        installationTips.push('Consider professional installation');
        break;
    }

    installationTips.push('Order 10-15% extra material for complex shapes');
    installationTips.push('Allow material to acclimate before installation');

    setResults({
      totalArea: area,
      perimeter,
      adjustedArea: area,
      complexityFactor,
      materialNeeded,
      wasteAmount,
      cuttingWaste,
      installationDifficulty: difficultyLevels[data.roomShape],
      installationTips,
      areaBreakdown,
    });
  };

  const selectedShape = form.watch('roomShape');

  return (
    <Calculator
      title="Room Shape Calculator"
      description="Calculate flooring materials for complex room shapes including L-shaped, circular, and custom layouts."
      metaTitle="Room Shape Calculator - L-Shape Circle Calculator | FlooringCalc Pro"
      metaDescription="Calculate flooring for complex room shapes including L-shaped, U-shaped, circular, and custom room layouts. Professional room area calculator."
      keywords={['room shape calculator', 'l-shaped room calculator', 'circular room calculator', 'complex room calculator']}
      category="basic"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room Shape & Dimensions</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="roomShape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Shape</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room shape" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rectangle">Rectangle/Square</SelectItem>
                        <SelectItem value="l-shape">L-Shaped Room</SelectItem>
                        <SelectItem value="u-shape">U-Shaped Room</SelectItem>
                        <SelectItem value="circle">Circular Room</SelectItem>
                        <SelectItem value="triangle">Triangular Room</SelectItem>
                        <SelectItem value="octagon">Octagonal Room</SelectItem>
                        <SelectItem value="custom">Custom Shape</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rectangle/Square */}
              {selectedShape === 'rectangle' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (ft)</FormLabel>
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
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (ft)</FormLabel>
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
              )}

              {/* L-Shape */}
              {selectedShape === 'l-shape' && (
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Section 1 (Main Area)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="length1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length 1 (ft)</FormLabel>
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
                      name="width1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width 1 (ft)</FormLabel>
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
                  <h5 className="font-medium text-gray-900">Section 2 (Extension)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="length2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length 2 (ft)</FormLabel>
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
                      name="width2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width 2 (ft)</FormLabel>
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
                </div>
              )}

              {/* U-Shape */}
              {selectedShape === 'u-shape' && (
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Outer Dimensions</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="outerLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outer Length (ft)</FormLabel>
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
                      name="outerWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outer Width (ft)</FormLabel>
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
                  <h5 className="font-medium text-gray-900">Inner Cutout</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="innerLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inner Length (ft)</FormLabel>
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
                      name="innerWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inner Width (ft)</FormLabel>
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
                </div>
              )}

              {/* Circle */}
              {selectedShape === 'circle' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Radius (ft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Radius"
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
                    name="diameter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diameter (ft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Diameter"
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

              {/* Triangle */}
              {selectedShape === 'triangle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="base"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base (ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Base"
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
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Height"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <h5 className="font-medium text-gray-900">Side Lengths (Optional)</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="side1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side 1 (ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Side 1"
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
                      name="side2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side 2 (ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Side 2"
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
                      name="side3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side 3 (ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Side 3"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Octagon */}
              {selectedShape === 'octagon' && (
                <FormField
                  control={form.control}
                  name="sideLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side Length (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Side length"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Custom */}
              {selectedShape === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Area (sq ft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Area"
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
                    name="perimeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perimeter (ft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Perimeter"
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

              <FormField
                control={form.control}
                name="wastePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Waste Percentage (%)</FormLabel>
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
                <h5 className="font-medium text-gray-900">Additional Areas</h5>
                
                <FormField
                  control={form.control}
                  name="includeClosets"
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
                      <FormLabel className="text-sm font-normal">Include closets</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch('includeClosets') && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numberOfClosets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Closets</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="2"
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
                      name="closetArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avg Closet Area (sq ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="25"
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

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Room Area
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Area Calculations</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Room Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Area:</span>
                      <span className="font-semibold text-primary">{results.totalArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Perimeter:</span>
                      <span className="font-semibold">{results.perimeter.toFixed(2)} ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Complexity Factor:</span>
                      <span className="font-semibold text-secondary">{results.complexityFactor.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Installation:</span>
                      <span className="font-semibold text-gray-700 text-sm">{results.installationDifficulty}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">📐</div>
                    <p className="text-sm">Enter dimensions to calculate area</p>
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
                      <span className="font-medium">Material Needed:</span>
                      <span className="font-semibold text-primary">{results.materialNeeded.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Waste Amount:</span>
                      <span className="font-semibold text-amber-600">{results.wasteAmount.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cutting Waste:</span>
                      <span className="font-semibold text-red-600">{results.cuttingWaste.toFixed(2)} sq ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm">Material requirements will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Area Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-2">
                    {Object.entries(results.areaBreakdown).map(([area, value]) => (
                      <div key={area} className="flex justify-between items-center">
                        <span className="font-medium text-sm">{area}:</span>
                        <span className={`font-semibold text-sm ${value < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          {value.toFixed(2)} sq ft
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Area breakdown will appear here</p>
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
                    <p className="text-sm">Installation tips will appear here</p>
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