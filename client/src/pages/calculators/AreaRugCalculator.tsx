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
  roomLength: z.number().min(1, 'Room length must be greater than 0'),
  roomWidth: z.number().min(1, 'Room width must be greater than 0'),
  furnitureLayout: z.enum(['living-room', 'dining-room', 'bedroom', 'office', 'entryway']),
  sofaLength: z.number().min(0).optional(),
  tableLength: z.number().min(0).optional(),
  tableWidth: z.number().min(0).optional(),
  bedSize: z.enum(['twin', 'full', 'queen', 'king', 'california-king']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RugSizeOption {
  size: string;
  dimensions: string;
  suitability: string;
  placement: string;
}

interface AreaRugResults {
  roomArea: number;
  recommendedSizes: RugSizeOption[];
  primaryRecommendation: RugSizeOption;
  placementTips: string[];
  sizingGuidelines: string[];
}

export default function AreaRugCalculator() {
  const [results, setResults] = useState<AreaRugResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      furnitureLayout: 'living-room',
      sofaLength: 0,
      tableLength: 0,
      tableWidth: 0,
      bedSize: 'queen',
    },
  });

  const furnitureLayout = form.watch('furnitureLayout');

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    let recommendedSizes: RugSizeOption[] = [];
    let primaryRecommendation: RugSizeOption;
    let placementTips: string[] = [];
    let sizingGuidelines: string[] = [];

    switch (data.furnitureLayout) {
      case 'living-room':
        recommendedSizes = [
          { size: '5x8', dimensions: '5\' x 8\'', suitability: 'Small seating area', placement: 'Front legs on rug' },
          { size: '6x9', dimensions: '6\' x 9\'', suitability: 'Medium seating area', placement: 'All front legs on rug' },
          { size: '8x10', dimensions: '8\' x 10\'', suitability: 'Large seating area', placement: 'All furniture legs on rug' },
          { size: '9x12', dimensions: '9\' x 12\'', suitability: 'Spacious living room', placement: 'Room-defining rug' }
        ];
        
        if (data.sofaLength && data.sofaLength > 0) {
          const rugWidth = data.sofaLength + 2; // 1 foot on each side
          if (rugWidth <= 6) {
            primaryRecommendation = recommendedSizes[0];
          } else if (rugWidth <= 8) {
            primaryRecommendation = recommendedSizes[1];
          } else if (rugWidth <= 10) {
            primaryRecommendation = recommendedSizes[2];
          } else {
            primaryRecommendation = recommendedSizes[3];
          }
        } else {
          primaryRecommendation = roomArea < 80 ? recommendedSizes[0] : 
                                  roomArea < 120 ? recommendedSizes[1] :
                                  roomArea < 180 ? recommendedSizes[2] : recommendedSizes[3];
        }

        placementTips = [
          'Place rug so front legs of all seating are on the rug',
          'Allow 18-24 inches of space between rug edge and walls',
          'Center the rug with the main seating piece (sofa)',
          'Ensure coffee table sits entirely on the rug'
        ];

        sizingGuidelines = [
          'Rug should be large enough for furniture grouping',
          'All front legs of seating should touch or sit on rug',
          'Leave consistent border around furniture group',
          'Consider traffic flow around the rug'
        ];
        break;

      case 'dining-room':
        recommendedSizes = [
          { size: '6x9', dimensions: '6\' x 9\'', suitability: '4-seat table', placement: 'Chairs remain on rug when pulled out' },
          { size: '8x10', dimensions: '8\' x 10\'', suitability: '6-seat table', placement: 'All legs on rug with pull-out space' },
          { size: '9x12', dimensions: '9\' x 12\'', suitability: '8-seat table', placement: 'Generous pull-out space' },
          { size: '10x14', dimensions: '10\' x 14\'', suitability: '10+ seat table', placement: 'Large dining room' }
        ];

        if (data.tableLength && data.tableWidth && data.tableLength > 0 && data.tableWidth > 0) {
          const requiredLength = data.tableLength + 4; // 2 feet on each side for chairs
          const requiredWidth = data.tableWidth + 4;
          
          if (requiredLength <= 8 && requiredWidth <= 6) {
            primaryRecommendation = recommendedSizes[0];
          } else if (requiredLength <= 10 && requiredWidth <= 8) {
            primaryRecommendation = recommendedSizes[1];
          } else if (requiredLength <= 12 && requiredWidth <= 9) {
            primaryRecommendation = recommendedSizes[2];
          } else {
            primaryRecommendation = recommendedSizes[3];
          }
        } else {
          primaryRecommendation = roomArea < 80 ? recommendedSizes[0] : 
                                  roomArea < 120 ? recommendedSizes[1] :
                                  roomArea < 180 ? recommendedSizes[2] : recommendedSizes[3];
        }

        placementTips = [
          'Rug should extend 24 inches beyond table on all sides',
          'All chair legs should remain on rug when pulled out',
          'Center the rug under the dining table',
          'Consider round rugs for round tables'
        ];

        sizingGuidelines = [
          'Add 4-5 feet to table length and width',
          'Ensure chairs stay on rug when pulled out',
          'Maintain proportion with room size',
          'Allow walking space around rug perimeter'
        ];
        break;

      case 'bedroom':
        recommendedSizes = [
          { size: '5x8', dimensions: '5\' x 8\'', suitability: 'Twin/Full bed', placement: 'At foot of bed' },
          { size: '6x9', dimensions: '6\' x 9\'', suitability: 'Queen bed', placement: 'Partial under bed' },
          { size: '8x10', dimensions: '8\' x 10\'', suitability: 'King bed', placement: 'Under bed with borders' },
          { size: '9x12', dimensions: '9\' x 12\'', suitability: 'Large bedroom', placement: 'Room-defining rug' }
        ];

        const bedDimensions = {
          'twin': { length: 6.25, width: 3.25 },
          'full': { length: 6.25, width: 4.5 },
          'queen': { length: 6.67, width: 5 },
          'king': { length: 6.67, width: 6.33 },
          'california-king': { length: 7, width: 6 }
        };

        const bedSize = data.bedSize || 'queen';
        const bed = bedDimensions[bedSize];
        
        if (bed.length <= 6.5 && bed.width <= 4) {
          primaryRecommendation = recommendedSizes[0];
        } else if (bed.length <= 7 && bed.width <= 5.5) {
          primaryRecommendation = recommendedSizes[1];
        } else if (bed.length <= 7 && bed.width <= 6.5) {
          primaryRecommendation = recommendedSizes[2];
        } else {
          primaryRecommendation = recommendedSizes[3];
        }

        placementTips = [
          'Place rug so it extends 18-24 inches beyond foot of bed',
          'Option 1: Rug partially under bed with 2-3 feet extending',
          'Option 2: Rug at foot of bed only',
          'Ensure rug is centered with the bed'
        ];

        sizingGuidelines = [
          'Rug should complement bed size',
          'Consider bedside walking areas',
          'Leave space for nightstands if placing under bed',
          'Maintain visual balance in the room'
        ];
        break;

      case 'office':
        recommendedSizes = [
          { size: '4x6', dimensions: '4\' x 6\'', suitability: 'Small desk area', placement: 'Under desk and chair' },
          { size: '5x8', dimensions: '5\' x 8\'', suitability: 'Medium office', placement: 'Desk and seating area' },
          { size: '6x9', dimensions: '6\' x 9\'', suitability: 'Large office', placement: 'Multiple work zones' },
          { size: '8x10', dimensions: '8\' x 10\'', suitability: 'Executive office', placement: 'Room-defining' }
        ];

        primaryRecommendation = roomArea < 50 ? recommendedSizes[0] : 
                               roomArea < 80 ? recommendedSizes[1] :
                               roomArea < 120 ? recommendedSizes[2] : recommendedSizes[3];

        placementTips = [
          'Rug should accommodate desk chair rolling',
          'Extend beyond chair\'s furthest position',
          'Consider chair mat for hard surface rugs',
          'Center rug with main work surface'
        ];

        sizingGuidelines = [
          'Account for chair movement and rolling',
          'Include guest seating area if applicable',
          'Maintain professional appearance',
          'Consider rug material for chair compatibility'
        ];
        break;

      case 'entryway':
        recommendedSizes = [
          { size: '3x5', dimensions: '3\' x 5\'', suitability: 'Small entryway', placement: 'Inside door area' },
          { size: '4x6', dimensions: '4\' x 6\'', suitability: 'Medium entryway', placement: 'Welcome area' },
          { size: '5x8', dimensions: '5\' x 8\'', suitability: 'Large foyer', placement: 'Central focus' },
          { size: '6x9', dimensions: '6\' x 9\'', suitability: 'Grand entryway', placement: 'Statement piece' }
        ];

        primaryRecommendation = roomArea < 30 ? recommendedSizes[0] : 
                               roomArea < 50 ? recommendedSizes[1] :
                               roomArea < 80 ? recommendedSizes[2] : recommendedSizes[3];

        placementTips = [
          'Position rug to catch dirt and moisture',
          'Allow for door swing clearance',
          'Center in the entryway space',
          'Consider runners for long, narrow entries'
        ];

        sizingGuidelines = [
          'Choose durable, easy-to-clean materials',
          'Size for foot traffic patterns',
          'Allow space for furniture like console tables',
          'Consider both function and aesthetics'
        ];
        break;

      default:
        primaryRecommendation = { size: '6x9', dimensions: '6\' x 9\'', suitability: 'Standard room', placement: 'Center of space' };
    }

    setResults({
      roomArea,
      recommendedSizes,
      primaryRecommendation,
      placementTips,
      sizingGuidelines,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Area Rug Calculator"
      description="Calculate optimal area rug sizes for different room layouts and furniture arrangements."
      metaTitle="Area Rug Size Calculator - Rug Size Guide | FlooringCalc Pro"
      metaDescription="Calculate optimal area rug sizes for any room layout. Professional rug size calculator with furniture placement guidelines."
      keywords={['area rug calculator', 'rug size calculator', 'area rug size guide', 'room rug calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room & Furniture Details</h4>
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
                          step="0.5"
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
                          step="0.5"
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
                name="furnitureLayout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="living-room">Living Room</SelectItem>
                        <SelectItem value="dining-room">Dining Room</SelectItem>
                        <SelectItem value="bedroom">Bedroom</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="entryway">Entryway</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {furnitureLayout === 'living-room' && (
                <FormField
                  control={form.control}
                  name="sofaLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sofa Length (ft) - Optional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="Sofa length"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {furnitureLayout === 'dining-room' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tableLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Length (ft) - Optional</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Table length"
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
                    name="tableWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Width (ft) - Optional</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Table width"
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

              {furnitureLayout === 'bedroom' && (
                <FormField
                  control={form.control}
                  name="bedSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bed size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="twin">Twin</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                          <SelectItem value="queen">Queen</SelectItem>
                          <SelectItem value="king">King</SelectItem>
                          <SelectItem value="california-king">California King</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Rug Size'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Rug Size Recommendations</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="carpet"
              variant="pattern"
            />
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Primary Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.primaryRecommendation.dimensions}</div>
                      <div className="text-sm text-gray-600">{results.primaryRecommendation.suitability}</div>
                    </div>
                    <div className="text-sm">
                      <strong>Placement:</strong> {results.primaryRecommendation.placement}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📐</div>
                    <p className="text-sm">Enter details for recommendation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">All Size Options</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    {results.recommendedSizes.map((size, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium">{size.dimensions}</span>
                          <div className="text-xs text-gray-500">{size.suitability}</div>
                        </div>
                        <div className="text-xs text-right text-gray-600 max-w-32">
                          {size.placement}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📏</div>
                    <p className="text-sm">Size options will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Placement Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.placementTips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Sizing Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.sizingGuidelines.map((guideline, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-amber-600 mr-2">•</span>
                          {guideline}
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