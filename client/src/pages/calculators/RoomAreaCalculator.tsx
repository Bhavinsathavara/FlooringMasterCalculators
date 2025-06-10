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
  roomType: z.enum(['simple-rectangle', 'l-shape', 'u-shape', 'curved', 'irregular', 'multi-room']),
  // Rectangle/Square
  length: z.number().min(0.1).optional(),
  width: z.number().min(0.1).optional(),
  // L-Shape
  length1: z.number().min(0.1).optional(),
  width1: z.number().min(0.1).optional(),
  length2: z.number().min(0.1).optional(),
  width2: z.number().min(0.1).optional(),
  // U-Shape
  length3: z.number().min(0.1).optional(),
  width3: z.number().min(0.1).optional(),
  // Curved/Circular
  radius: z.number().min(0.1).optional(),
  // Irregular (approximation)
  points: z.number().min(3).max(20).optional(),
  approximateArea: z.number().min(0.1).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RoomAreaResults {
  totalArea: number;
  perimeter: number;
  roomCount: number;
  complexityFactor: number;
  recommendedWaste: number;
  areaBreakdown: { [key: string]: number };
  installationTips: string[];
}

export default function RoomAreaCalculator() {
  const [results, setResults] = useState<RoomAreaResults | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('simple-rectangle');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomType: 'simple-rectangle',
      length: 0,
      width: 0,
      length1: 0,
      width1: 0,
      length2: 0,
      width2: 0,
      length3: 0,
      width3: 0,
      radius: 0,
      points: 4,
      approximateArea: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    let totalArea = 0;
    let perimeter = 0;
    let complexityFactor = 1.0;
    let recommendedWaste = 10;
    const areaBreakdown: { [key: string]: number } = {};
    const installationTips: string[] = [];

    switch (data.roomType) {
      case 'simple-rectangle':
        totalArea = (data.length || 0) * (data.width || 0);
        perimeter = 2 * ((data.length || 0) + (data.width || 0));
        areaBreakdown['Main Room'] = totalArea;
        complexityFactor = 1.0;
        recommendedWaste = 8;
        installationTips.push('Start from the center of the room');
        installationTips.push('Maintain consistent expansion gaps');
        break;

      case 'l-shape':
        const area1 = (data.length1 || 0) * (data.width1 || 0);
        const area2 = (data.length2 || 0) * (data.width2 || 0);
        totalArea = area1 + area2;
        perimeter = 2 * ((data.length1 || 0) + (data.width1 || 0) + (data.length2 || 0) + (data.width2 || 0)) - 
                   Math.min(data.width1 || 0, data.width2 || 0) * 2; // Subtract overlapping edges
        areaBreakdown['Section 1'] = area1;
        areaBreakdown['Section 2'] = area2;
        complexityFactor = 1.3;
        recommendedWaste = 12;
        installationTips.push('Plan layout to minimize cuts at the corner');
        installationTips.push('Use transition strips at direction changes');
        installationTips.push('Consider running planks parallel to longest wall');
        break;

      case 'u-shape':
        const areaU1 = (data.length1 || 0) * (data.width1 || 0);
        const areaU2 = (data.length2 || 0) * (data.width2 || 0);
        const areaU3 = (data.length3 || 0) * (data.width3 || 0);
        totalArea = areaU1 + areaU2 + areaU3;
        perimeter = 2 * ((data.length1 || 0) + (data.width1 || 0) + (data.length2 || 0) + 
                        (data.width2 || 0) + (data.length3 || 0) + (data.width3 || 0));
        areaBreakdown['Section 1'] = areaU1;
        areaBreakdown['Section 2'] = areaU2;
        areaBreakdown['Section 3'] = areaU3;
        complexityFactor = 1.6;
        recommendedWaste = 15;
        installationTips.push('Create detailed layout plan before starting');
        installationTips.push('Use professional installer for complex cuts');
        installationTips.push('Order 20% extra material for pattern matching');
        break;

      case 'curved':
        totalArea = Math.PI * Math.pow(data.radius || 0, 2);
        perimeter = 2 * Math.PI * (data.radius || 0);
        areaBreakdown['Circular Area'] = totalArea;
        complexityFactor = 1.8;
        recommendedWaste = 18;
        installationTips.push('Use flexible flooring materials for curves');
        installationTips.push('Make template for curved cuts');
        installationTips.push('Consider professional installation');
        break;

      case 'irregular':
        totalArea = data.approximateArea || 0;
        perimeter = Math.sqrt(totalArea) * 4; // Rough approximation
        areaBreakdown['Irregular Area'] = totalArea;
        complexityFactor = 1.5;
        recommendedWaste = 20;
        installationTips.push('Measure carefully and create detailed drawings');
        installationTips.push('Use laser measuring tools for accuracy');
        installationTips.push('Plan for significant material waste');
        break;

      case 'multi-room':
        totalArea = (data.approximateArea || 0);
        perimeter = Math.sqrt(totalArea) * 6; // Increased for multiple rooms
        areaBreakdown['Combined Rooms'] = totalArea;
        complexityFactor = 1.4;
        recommendedWaste = 14;
        installationTips.push('Plan flooring direction across all rooms');
        installationTips.push('Use transition strips between different floor levels');
        installationTips.push('Consider bulk ordering for cost savings');
        break;
    }

    const roomCount = Object.keys(areaBreakdown).length;

    setResults({
      totalArea,
      perimeter,
      roomCount,
      complexityFactor,
      recommendedWaste,
      areaBreakdown,
      installationTips,
    });
  };

  const renderRoomInputs = () => {
    switch (selectedRoomType) {
      case 'simple-rectangle':
        return (
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
        );

      case 'l-shape':
        return (
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Section 1</h5>
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
            <h5 className="font-medium text-gray-900">Section 2</h5>
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
        );

      case 'curved':
        return (
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
        );

      case 'irregular':
      case 'multi-room':
        return (
          <FormField
            control={form.control}
            name="approximateArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Area (sq ft)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Measured area"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Calculator
      title="Room Area Calculator (Irregular & Regular)"
      description="Calculate area for irregular and regular room shapes including L-shaped, curved, and multi-room layouts."
      metaTitle="Room Area Calculator - Irregular & Regular Shapes | FlooringCalc Pro"
      metaDescription="Calculate room area for any shape - irregular, L-shaped, curved rooms. Professional room area calculator with complex shape support."
      keywords={['room area calculator', 'irregular room calculator', 'L-shaped room calculator', 'curved room area']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room Configuration</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedRoomType(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="simple-rectangle">Simple Rectangle/Square</SelectItem>
                        <SelectItem value="l-shape">L-Shaped Room</SelectItem>
                        <SelectItem value="u-shape">U-Shaped Room</SelectItem>
                        <SelectItem value="curved">Curved/Circular Room</SelectItem>
                        <SelectItem value="irregular">Irregular Shape</SelectItem>
                        <SelectItem value="multi-room">Multiple Connected Rooms</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renderRoomInputs()}

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Room Area
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Area Analysis</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Room Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-primary">{results.totalArea.toFixed(2)}</div>
                      <div className="text-gray-600">Total Square Feet</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Perimeter:</span>
                      <span className="font-semibold">{results.perimeter.toFixed(2)} ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Sections:</span>
                      <span className="font-semibold">{results.roomCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Complexity Factor:</span>
                      <span className="font-semibold text-amber-600">{results.complexityFactor}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Recommended Waste:</span>
                      <span className="font-semibold text-secondary">{results.recommendedWaste}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-4">📐</div>
                    <p>Enter room measurements to calculate area</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && Object.keys(results.areaBreakdown).length > 1 && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Area Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(results.areaBreakdown).map(([section, area]) => (
                      <div key={section} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{section}:</span>
                        <span className="text-sm font-semibold">{area.toFixed(2)} sq ft</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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