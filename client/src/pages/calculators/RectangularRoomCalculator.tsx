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
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'carpet', 'laminate']),
  plankDirection: z.enum(['length', 'width', 'diagonal']),
});

type FormData = z.infer<typeof formSchema>;

interface RectangularRoomResults {
  roomArea: number;
  perimeter: number;
  adjustedArea: number;
  materialNeeded: number;
  planksNeeded?: number;
  tilesNeeded?: number;
  cuts: number;
  borderTiles?: number;
  fullTiles?: number;
  installationTips: string[];
}

export default function RectangularRoomCalculator() {
  const [results, setResults] = useState<RectangularRoomResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      wastePercentage: 10,
      flooringType: 'tile',
      plankDirection: 'length',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const perimeter = 2 * (data.roomLength + data.roomWidth);
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);

    let materialNeeded = Math.ceil(adjustedArea);
    let planksNeeded = 0;
    let tilesNeeded = 0;
    let cuts = 0;
    let borderTiles = 0;
    let fullTiles = 0;

    // Calculate specific requirements based on flooring type
    switch (data.flooringType) {
      case 'tile':
        // Assume 12" x 12" tiles
        tilesNeeded = Math.ceil(adjustedArea);
        
        // Calculate border vs full tiles
        const tilesLength = Math.ceil(data.roomLength);
        const tilesWidth = Math.ceil(data.roomWidth);
        fullTiles = Math.max(0, (tilesLength - 2) * (tilesWidth - 2));
        borderTiles = tilesNeeded - fullTiles;
        cuts = Math.ceil(borderTiles * 0.5); // Some border tiles need cutting
        break;
        
      case 'hardwood':
      case 'vinyl':
      case 'laminate':
        // Assume 48" x 6" planks
        const plankSqFt = (48 * 6) / 144; // 2 sq ft per plank
        planksNeeded = Math.ceil(adjustedArea / plankSqFt);
        
        // Calculate cuts based on direction
        if (data.plankDirection === 'diagonal') {
          cuts = Math.ceil(perimeter / 4); // More cuts for diagonal
        } else if (data.plankDirection === 'width') {
          cuts = Math.ceil(data.roomLength / 4); // Cuts at both ends
        } else {
          cuts = Math.ceil(data.roomWidth / 4); // Cuts at both ends
        }
        break;
        
      case 'carpet':
        // Carpet calculations
        materialNeeded = Math.ceil(adjustedArea);
        cuts = 4; // Usually 4 cuts for room perimeter
        break;
    }

    // Installation tips based on room type and flooring
    const installationTips = [
      'Measure room twice to ensure accuracy',
      'Check walls for square using 3-4-5 triangle method',
      'Mark center points for balanced installation'
    ];

    switch (data.flooringType) {
      case 'tile':
        installationTips.push('Start from room center for balanced borders');
        installationTips.push('Use chalk lines for straight tile rows');
        installationTips.push('Dry lay tiles before final installation');
        break;
        
      case 'hardwood':
        if (data.plankDirection === 'length') {
          installationTips.push('Run planks parallel to longest wall');
        } else if (data.plankDirection === 'width') {
          installationTips.push('Running across width makes room appear wider');
        } else {
          installationTips.push('Diagonal installation adds visual interest but increases waste');
        }
        installationTips.push('Leave 1/2" expansion gap at all walls');
        installationTips.push('Stagger end joints by at least 6 inches');
        break;
        
      case 'vinyl':
      case 'laminate':
        installationTips.push('Acclimate materials 48 hours before installation');
        installationTips.push('Use underlayment if not pre-attached');
        installationTips.push('Click-lock systems need precise fitting');
        break;
        
      case 'carpet':
        installationTips.push('Install tack strips 1/4" from walls');
        installationTips.push('Stretch carpet evenly to prevent wrinkles');
        installationTips.push('Use knee kicker and power stretcher');
        break;
    }

    // Direction-specific tips
    if (data.plankDirection === 'diagonal') {
      installationTips.push('Start at 45-degree angle from longest wall');
    }

    setResults({
      roomArea,
      perimeter,
      adjustedArea,
      materialNeeded,
      planksNeeded: planksNeeded || undefined,
      tilesNeeded: tilesNeeded || undefined,
      cuts,
      borderTiles: borderTiles || undefined,
      fullTiles: fullTiles || undefined,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Rectangular Room Calculator"
      description="Calculate flooring materials for standard rectangular rooms with precise measurements and layout planning."
      metaTitle="Rectangular Room Calculator - Square Room Flooring Calculator | FlooringCalc Pro"
      metaDescription="Calculate flooring for rectangular and square rooms. Professional room calculator with material estimates and installation guidance."
      keywords={['rectangular room calculator', 'square room calculator', 'room flooring calculator', 'rectangular area calculator']}
      faqs={[
        {
          question: "Which direction should I run flooring planks?",
          answer: "Run planks parallel to the longest wall for traditional look, or perpendicular to make rooms appear wider. Consider natural light direction and main traffic flow for best results."
        },
        {
          question: "How do I ensure my room is actually rectangular?",
          answer: "Measure both diagonals - they should be equal in a true rectangle. Use the 3-4-5 triangle method to check corners are 90 degrees. Small variations are normal in older homes."
        },
        {
          question: "Should I start installation from the center or edge?",
          answer: "Tiles: Start from center for balanced borders. Planks: Start from longest, straightest wall. Always do a dry layout first to check the final row width at opposite walls."
        },
        {
          question: "How much waste percentage should I add?",
          answer: "Standard rectangular rooms: 5-10% for planks, 10-15% for tiles. Add extra for diagonal installations (15-20%) or if walls aren't perfectly straight."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room Specifications</h4>
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

              {(form.watch('flooringType') === 'hardwood' || 
                form.watch('flooringType') === 'vinyl' || 
                form.watch('flooringType') === 'laminate') && (
                <FormField
                  control={form.control}
                  name="plankDirection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plank Direction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plank direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="length">Parallel to length</SelectItem>
                          <SelectItem value="width">Parallel to width</SelectItem>
                          <SelectItem value="diagonal">Diagonal (45°)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate Rectangular Room
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Room Calculations</h4>
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Area:</span>
                    <span className="font-semibold">{results.roomArea.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Perimeter:</span>
                    <span className="font-semibold">{results.perimeter.toFixed(1)} ft</span>
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
                  
                  {results.planksNeeded && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planks Needed:</span>
                      <span className="font-semibold">{results.planksNeeded} planks</span>
                    </div>
                  )}
                  
                  {results.tilesNeeded && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiles Needed:</span>
                        <span className="font-semibold">{results.tilesNeeded} tiles</span>
                      </div>
                      {results.fullTiles !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Full Tiles:</span>
                          <span className="font-semibold">{results.fullTiles} tiles</span>
                        </div>
                      )}
                      {results.borderTiles !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Border Tiles:</span>
                          <span className="font-semibold">{results.borderTiles} tiles</span>
                        </div>
                      )}
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
                  <p>Enter room dimensions to calculate flooring requirements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating rectangular room layout..." theme="default" />
    </Calculator>
  );
}