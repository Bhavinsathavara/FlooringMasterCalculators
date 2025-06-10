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
  vinylType: z.enum(['lvt', 'lvp', 'sheet']),
  plankWidth: z.number().min(1, 'Plank width must be greater than 0').optional(),
  plankLength: z.number().min(1, 'Plank length must be greater than 0').optional(),
  rollWidth: z.number().min(1, 'Roll width must be greater than 0').optional(),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
});

type FormData = z.infer<typeof formSchema>;

interface VinylResults {
  roomArea: number;
  adjustedArea: number;
  planksNeeded?: number;
  squareFeetNeeded: number;
  rollsNeeded?: number;
  linearFeetNeeded?: number;
  underlaymentNeeded: number;
  moldingNeeded: number;
}

export default function VinylCalculator() {
  const [results, setResults] = useState<VinylResults | null>(null);
  const [vinylType, setVinylType] = useState<string>('lvt');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      vinylType: 'lvt',
      plankWidth: 6,
      plankLength: 48,
      rollWidth: 12,
      wastePercentage: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    const perimeter = 2 * (data.roomLength + data.roomWidth);
    
    let planksNeeded, rollsNeeded, linearFeetNeeded;

    if (data.vinylType === 'lvt' || data.vinylType === 'lvp') {
      const plankArea = ((data.plankWidth || 6) * (data.plankLength || 48)) / 144; // Convert sq inches to sq feet
      planksNeeded = Math.ceil(adjustedArea / plankArea);
    } else if (data.vinylType === 'sheet') {
      const rollWidthFt = (data.rollWidth || 12);
      linearFeetNeeded = Math.ceil(data.roomLength);
      rollsNeeded = Math.ceil(data.roomWidth / rollWidthFt);
    }

    setResults({
      roomArea,
      adjustedArea,
      planksNeeded,
      squareFeetNeeded: adjustedArea,
      rollsNeeded,
      linearFeetNeeded,
      underlaymentNeeded: Math.ceil(adjustedArea),
      moldingNeeded: Math.ceil(perimeter),
    });
  };

  const renderVinylSpecificInputs = () => {
    if (vinylType === 'lvt' || vinylType === 'lvp') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plankWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plank Width (inches)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    placeholder="6"
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
            name="plankLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plank Length (inches)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    placeholder="48"
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
    } else if (vinylType === 'sheet') {
      return (
        <FormField
          control={form.control}
          name="rollWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll Width (feet)</FormLabel>
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
      );
    }
    return null;
  };

  return (
    <Calculator
      title="Vinyl Flooring Calculator"
      description="Calculate vinyl flooring requirements for luxury vinyl tile, sheet vinyl, and plank installations."
      metaTitle="Vinyl Flooring Calculator - LVT & LVP Calculator | FlooringCalc Pro"
      metaDescription="Calculate luxury vinyl tile (LVT), vinyl plank (LVP), and sheet vinyl flooring requirements. Professional vinyl flooring calculator."
      keywords={['vinyl flooring calculator', 'LVT calculator', 'luxury vinyl calculator', 'vinyl plank calculator', 'sheet vinyl calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Details</h4>
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
                name="vinylType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vinyl Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setVinylType(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vinyl type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lvt">Luxury Vinyl Tile (LVT)</SelectItem>
                        <SelectItem value="lvp">Luxury Vinyl Plank (LVP)</SelectItem>
                        <SelectItem value="sheet">Sheet Vinyl</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renderVinylSpecificInputs()}

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

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Vinyl Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Flooring Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">With Waste:</span>
                      <span className="font-semibold">{results.adjustedArea.toFixed(2)} sq ft</span>
                    </div>
                    {results.planksNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Planks/Tiles Needed:</span>
                        <span className="font-semibold text-primary">{results.planksNeeded} pieces</span>
                      </div>
                    )}
                    {results.rollsNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Rolls Needed:</span>
                        <span className="font-semibold text-primary">{results.rollsNeeded} rolls</span>
                      </div>
                    )}
                    {results.linearFeetNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Linear Feet:</span>
                        <span className="font-semibold text-secondary">{results.linearFeetNeeded} ft</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Sq Ft to Order:</span>
                      <span className="font-semibold text-secondary">{results.squareFeetNeeded.toFixed(2)} sq ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📱</div>
                    <p className="text-sm">Enter details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Additional Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Underlayment:</span>
                      <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Molding/Trim:</span>
                      <span className="font-semibold">{results.moldingNeeded} linear ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Additional materials will appear here</p>
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
