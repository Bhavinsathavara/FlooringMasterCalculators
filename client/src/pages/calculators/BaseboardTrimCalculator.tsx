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
  ceilingHeight: z.number().min(6, 'Ceiling height must be at least 6 feet'),
  doorWidth: z.number().min(24, 'Door width must be at least 24 inches'),
  numberOfDoors: z.number().min(0).max(20, 'Number of doors must be between 0-20'),
  numberOfWindows: z.number().min(0).max(50, 'Number of windows must be between 0-50'),
  windowWidth: z.number().min(12, 'Average window width must be at least 12 inches'),
  baseboardStyle: z.enum(['standard', 'colonial', 'modern', 'craftsman', 'victorian']),
  baseboardHeight: z.enum(['3-inch', '4-inch', '5-inch', '6-inch', 'custom']),
  customHeight: z.number().min(2).max(12).optional(),
  includeQuarterRound: z.boolean(),
  includeCrownMolding: z.boolean(),
  includeCasing: z.boolean(),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
});

type FormData = z.infer<typeof formSchema>;

interface TrimResults {
  roomPerimeter: number;
  adjustedPerimeter: number;
  baseboardNeeded: number;
  quarterRoundNeeded: number;
  crownMoldingNeeded: number;
  doorCasingNeeded: number;
  windowCasingNeeded: number;
  totalLinearFeet: number;
  nailsNeeded: number;
  caulfNeeded: number;
  totalCost: number;
  laborHours: number;
  cuttingList: { [key: string]: number };
}

export default function BaseboardTrimCalculator() {
  const [results, setResults] = useState<TrimResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      ceilingHeight: 8,
      doorWidth: 32,
      numberOfDoors: 1,
      numberOfWindows: 2,
      windowWidth: 36,
      baseboardStyle: 'standard',
      baseboardHeight: '4-inch',
      customHeight: 0,
      includeQuarterRound: false,
      includeCrownMolding: false,
      includeCasing: true,
      wastePercentage: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomPerimeter = 2 * (data.roomLength + data.roomWidth);
    
    // Calculate openings
    const doorOpenings = data.numberOfDoors * (data.doorWidth / 12); // Convert inches to feet
    const windowOpenings = data.numberOfWindows * (data.windowWidth / 12);
    const totalOpenings = doorOpenings + windowOpenings;
    
    // Adjusted perimeter for baseboard (minus openings)
    const adjustedPerimeter = Math.max(roomPerimeter - totalOpenings, 0);
    
    // Calculate baseboard with waste
    const baseboardNeeded = adjustedPerimeter * (1 + data.wastePercentage / 100);
    
    // Quarter round (if selected)
    const quarterRoundNeeded = data.includeQuarterRound ? baseboardNeeded : 0;
    
    // Crown molding (if selected) - uses full perimeter
    const crownMoldingNeeded = data.includeCrownMolding ? roomPerimeter * (1 + data.wastePercentage / 100) : 0;
    
    // Door and window casing
    let doorCasingNeeded = 0;
    let windowCasingNeeded = 0;
    
    if (data.includeCasing) {
      // Door casing: 2 sides + top for each door
      const doorCasingPerDoor = (data.ceilingHeight * 2) + (data.doorWidth / 12);
      doorCasingNeeded = data.numberOfDoors * doorCasingPerDoor * (1 + data.wastePercentage / 100);
      
      // Window casing: 4 sides for each window (assuming standard window height of 4 feet)
      const windowHeight = 4; // Standard window height
      const windowCasingPerWindow = (windowHeight * 2) + ((data.windowWidth / 12) * 2);
      windowCasingNeeded = data.numberOfWindows * windowCasingPerWindow * (1 + data.wastePercentage / 100);
    }
    
    const totalLinearFeet = baseboardNeeded + quarterRoundNeeded + crownMoldingNeeded + 
                           doorCasingNeeded + windowCasingNeeded;
    
    // Calculate nails needed (estimate 1 lb per 100 linear feet)
    const nailsNeeded = Math.ceil(totalLinearFeet / 100);
    
    // Calculate caulk needed (estimate 1 tube per 50 linear feet)
    const caulfNeeded = Math.ceil(totalLinearFeet / 50);
    
    // Cost calculations based on style and height
    const baseboardCosts = {
      'standard': { '3-inch': 1.50, '4-inch': 2.25, '5-inch': 3.00, '6-inch': 4.50, 'custom': 5.00 },
      'colonial': { '3-inch': 2.00, '4-inch': 3.25, '5-inch': 4.50, '6-inch': 6.00, 'custom': 7.00 },
      'modern': { '3-inch': 2.50, '4-inch': 3.75, '5-inch': 5.25, '6-inch': 7.50, 'custom': 8.50 },
      'craftsman': { '3-inch': 3.00, '4-inch': 4.50, '5-inch': 6.25, '6-inch': 8.50, 'custom': 10.00 },
      'victorian': { '3-inch': 4.00, '4-inch': 6.00, '5-inch': 8.50, '6-inch': 12.00, 'custom': 15.00 },
    };
    
    const baseboardCost = baseboardNeeded * baseboardCosts[data.baseboardStyle][data.baseboardHeight];
    const quarterRoundCost = quarterRoundNeeded * 1.25; // $1.25 per linear foot
    const crownMoldingCost = crownMoldingNeeded * 3.50; // $3.50 per linear foot
    const doorCasingCost = doorCasingNeeded * 2.75; // $2.75 per linear foot
    const windowCasingCost = windowCasingNeeded * 2.75; // $2.75 per linear foot
    const nailsCost = nailsNeeded * 8.50; // $8.50 per lb
    const caulfCost = caulfNeeded * 4.25; // $4.25 per tube
    
    const totalCost = baseboardCost + quarterRoundCost + crownMoldingCost + 
                     doorCasingCost + windowCasingCost + nailsCost + caulfCost;
    
    // Labor estimation (0.5 hours per 10 linear feet)
    const laborHours = (totalLinearFeet / 10) * 0.5;
    
    // Create cutting list
    const cuttingList: { [key: string]: number } = {
      'Baseboard': Math.round(baseboardNeeded),
    };
    
    if (quarterRoundNeeded > 0) {
      cuttingList['Quarter Round'] = Math.round(quarterRoundNeeded);
    }
    if (crownMoldingNeeded > 0) {
      cuttingList['Crown Molding'] = Math.round(crownMoldingNeeded);
    }
    if (doorCasingNeeded > 0) {
      cuttingList['Door Casing'] = Math.round(doorCasingNeeded);
    }
    if (windowCasingNeeded > 0) {
      cuttingList['Window Casing'] = Math.round(windowCasingNeeded);
    }

    setResults({
      roomPerimeter,
      adjustedPerimeter,
      baseboardNeeded,
      quarterRoundNeeded,
      crownMoldingNeeded,
      doorCasingNeeded,
      windowCasingNeeded,
      totalLinearFeet,
      nailsNeeded,
      caulfNeeded,
      totalCost,
      laborHours,
      cuttingList,
    });
  };

  return (
    <Calculator
      title="Baseboard & Trim Calculator"
      description="Calculate baseboard, quarter round, and trim lengths needed for flooring installations."
      metaTitle="Baseboard Calculator - Trim & Molding Calculator | FlooringCalc Pro"
      metaDescription="Calculate baseboard, quarter round, and trim lengths for flooring projects. Professional trim calculator with miter cuts and waste factors."
      keywords={['baseboard calculator', 'trim calculator', 'molding calculator', 'quarter round calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room & Trim Specifications</h4>
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
                name="ceilingHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ceiling Height (ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="8"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseboardStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseboard Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="colonial">Colonial</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="craftsman">Craftsman</SelectItem>
                          <SelectItem value="victorian">Victorian</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseboardHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseboard Height</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select height" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3-inch">3 inches</SelectItem>
                          <SelectItem value="4-inch">4 inches</SelectItem>
                          <SelectItem value="5-inch">5 inches</SelectItem>
                          <SelectItem value="6-inch">6 inches</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfDoors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Doors</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="1"
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
                  name="doorWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Door Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="32"
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
                  name="wastePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste %</FormLabel>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfWindows"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Windows</FormLabel>
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
                  name="windowWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg Window Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="36"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Additional Trim</h5>
                
                <FormField
                  control={form.control}
                  name="includeQuarterRound"
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
                      <FormLabel className="text-sm font-normal">Include quarter round</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeCrownMolding"
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
                      <FormLabel className="text-sm font-normal">Include crown molding</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeCasing"
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
                      <FormLabel className="text-sm font-normal">Include door/window casing</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Trim Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Trim Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Linear Footage</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Perimeter:</span>
                      <span className="font-semibold">{results.roomPerimeter.toFixed(1)} ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Baseboard Needed:</span>
                      <span className="font-semibold text-primary">{results.baseboardNeeded.toFixed(1)} ft</span>
                    </div>
                    {results.quarterRoundNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Quarter Round:</span>
                        <span className="font-semibold">{results.quarterRoundNeeded.toFixed(1)} ft</span>
                      </div>
                    )}
                    {results.crownMoldingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Crown Molding:</span>
                        <span className="font-semibold">{results.crownMoldingNeeded.toFixed(1)} ft</span>
                      </div>
                    )}
                    {results.doorCasingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Door Casing:</span>
                        <span className="font-semibold">{results.doorCasingNeeded.toFixed(1)} ft</span>
                      </div>
                    )}
                    {results.windowCasingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Window Casing:</span>
                        <span className="font-semibold">{results.windowCasingNeeded.toFixed(1)} ft</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total Linear Feet:</span>
                        <span className="font-bold text-secondary">{results.totalLinearFeet.toFixed(1)} ft</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">📏</div>
                    <p className="text-sm">Enter details to calculate trim</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Materials & Supplies</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Finish Nails:</span>
                      <span className="font-semibold">{results.nailsNeeded} lbs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Caulk Tubes:</span>
                      <span className="font-semibold">{results.caulfNeeded} tubes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Supplies will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cutting List</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-2">
                    {Object.entries(results.cuttingList).map(([item, length]) => (
                      <div key={item} className="flex justify-between items-center">
                        <span className="font-medium">{item}:</span>
                        <span className="font-semibold">{length} linear ft</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Cutting list will appear here</p>
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
                      ${results.totalCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Total Material Cost</p>
                    <p className="text-xs text-gray-500 mt-2">Includes materials, nails, and caulk</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost estimate will appear here</p>
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