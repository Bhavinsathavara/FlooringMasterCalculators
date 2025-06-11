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
  radius: z.number().min(0.1, 'Radius must be greater than 0'),
  measurementType: z.enum(['radius', 'diameter']),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'carpet', 'laminate']),
});

type FormData = z.infer<typeof formSchema>;

interface CircularRoomResults {
  radius: number;
  diameter: number;
  area: number;
  circumference: number;
  adjustedArea: number;
  materialNeeded: number;
  borderTiles: number;
  centerTiles: number;
  cuts: number;
  installationTips: string[];
}

export default function CircularRoomCalculator() {
  const [results, setResults] = useState<CircularRoomResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      radius: 0,
      measurementType: 'radius',
      wastePercentage: 15,
      flooringType: 'tile',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let radius = data.radius;
    if (data.measurementType === 'diameter') {
      radius = data.radius / 2;
    }

    const diameter = radius * 2;
    const area = Math.PI * radius * radius;
    const circumference = 2 * Math.PI * radius;
    const adjustedArea = area * (1 + data.wastePercentage / 100);

    // Calculate material needs based on flooring type
    let materialNeeded = 0;
    let borderTiles = 0;
    let centerTiles = 0;
    let cuts = 0;

    switch (data.flooringType) {
      case 'tile':
        // Assume 12" x 12" tiles
        const tileSize = 1; // 1 sq ft per tile
        materialNeeded = Math.ceil(adjustedArea / tileSize);
        
        // Estimate border vs center tiles for circular layout
        const radiusInTiles = radius;
        const fullTilesRadius = Math.floor(radiusInTiles - 0.5);
        centerTiles = Math.floor(Math.PI * fullTilesRadius * fullTilesRadius);
        borderTiles = materialNeeded - centerTiles;
        cuts = Math.ceil(borderTiles * 0.8); // Most border tiles need cutting
        break;
        
      case 'hardwood':
        // Planks in sq ft
        materialNeeded = Math.ceil(adjustedArea);
        cuts = Math.ceil(circumference / 4); // Estimate cuts around perimeter
        break;
        
      case 'vinyl':
      case 'laminate':
        // Planks/tiles in sq ft
        materialNeeded = Math.ceil(adjustedArea);
        cuts = Math.ceil(circumference / 3); // More cuts needed for circular fit
        break;
        
      case 'carpet':
        // Carpet in sq ft with seaming
        materialNeeded = Math.ceil(adjustedArea);
        // Circular carpet requires special cutting
        cuts = 1; // One major circular cut
        break;
    }

    // Installation tips based on flooring type
    const installationTips = [
      'Mark center point and use string compass for layout',
      'Work from center outward in concentric circles',
      'Pre-plan cuts to minimize waste at perimeter'
    ];

    switch (data.flooringType) {
      case 'tile':
        installationTips.push('Use flexible tile spacers for curved edges');
        installationTips.push('Consider mosaic or smaller tiles for easier fitting');
        installationTips.push('Plan grout lines to follow circular pattern');
        break;
        
      case 'hardwood':
        installationTips.push('Run planks toward center from multiple directions');
        installationTips.push('Steam bend planks for curved borders if possible');
        installationTips.push('Leave expansion gap around entire perimeter');
        break;
        
      case 'vinyl':
      case 'laminate':
        installationTips.push('Score and snap for clean curved cuts');
        installationTips.push('Heat material slightly for easier bending');
        installationTips.push('Install transition strip around entire perimeter');
        break;
        
      case 'carpet':
        installationTips.push('Template with cardboard before cutting carpet');
        installationTips.push('Use sharp carpet knife for clean circular cut');
        installationTips.push('Stretch evenly to prevent wrinkles');
        break;
    }

    setResults({
      radius,
      diameter,
      area,
      circumference,
      adjustedArea,
      materialNeeded,
      borderTiles,
      centerTiles,
      cuts,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Circular Room Calculator"
      description="Calculate flooring materials for circular and round room layouts with precise measurements."
      metaTitle="Circular Room Calculator - Round Room Flooring Calculator | FlooringCalc Pro"
      metaDescription="Calculate flooring for circular and round rooms. Professional circular room area calculator with material estimates and installation tips."
      keywords={['circular room calculator', 'round room calculator', 'circular flooring calculator', 'round room area']}
      faqs={[
        {
          question: "How do I measure a circular room accurately?",
          answer: "Measure from center to wall (radius) or across the widest point (diameter). Use a tape measure and string for large rooms. Verify measurements at multiple points to ensure true circular shape."
        },
        {
          question: "What flooring works best in circular rooms?",
          answer: "Flexible materials work best: vinyl, carpet, and small tiles. Large tiles and wide planks require more cuts. Consider radial patterns or mosaic tiles for easier installation."
        },
        {
          question: "How much extra material do I need for a circular room?",
          answer: "Add 15-25% waste for circular rooms due to perimeter cuts. Tile and plank materials have higher waste than flexible sheet goods. Complex patterns may need 25-30% extra."
        },
        {
          question: "Should I use a radial or parallel layout pattern?",
          answer: "Radial patterns (emanating from center) work well for tiles and create focal points. Parallel patterns work for planks but require more cuts. Consider the room's use and aesthetic goals."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Circular Room Specifications</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="measurementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select measurement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="radius">Radius (center to edge)</SelectItem>
                        <SelectItem value="diameter">Diameter (across widest point)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('measurementType') === 'radius' ? 'Radius (ft)' : 'Diameter (ft)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={form.watch('measurementType') === 'radius' ? 'Radius' : 'Diameter'}
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
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="hardwood">Hardwood</SelectItem>
                        <SelectItem value="vinyl">Vinyl/LVP</SelectItem>
                        <SelectItem value="laminate">Laminate</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
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

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate Circular Room
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Circular Room Results</h4>
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Radius:</span>
                    <span className="font-semibold">{results.radius.toFixed(1)} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diameter:</span>
                    <span className="font-semibold">{results.diameter.toFixed(1)} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-semibold">{results.area.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Circumference:</span>
                    <span className="font-semibold">{results.circumference.toFixed(1)} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area with Waste:</span>
                    <span className="font-semibold text-primary">{results.adjustedArea.toFixed(1)} sq ft</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Material Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material Needed:</span>
                    <span className="font-semibold text-primary">{results.materialNeeded} sq ft</span>
                  </div>
                  {form.watch('flooringType') === 'tile' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Center Tiles:</span>
                        <span className="font-semibold">{results.centerTiles} tiles</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Border Tiles:</span>
                        <span className="font-semibold">{results.borderTiles} tiles</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Cuts:</span>
                    <span className="font-semibold">{results.cuts} cuts</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Installation Tips</CardTitle>
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
                  <p>Enter circular room measurements to calculate flooring requirements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating circular room layout..." theme="default" />
    </Calculator>
  );
}