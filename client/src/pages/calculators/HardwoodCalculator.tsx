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
  boardWidth: z.number().min(1, 'Board width must be greater than 0'),
  boardLength: z.number().min(1, 'Board length must be greater than 0'),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  installationType: z.enum(['nail-down', 'glue-down', 'floating']),
});

type FormData = z.infer<typeof formSchema>;

interface HardwoodResults {
  roomArea: number;
  adjustedArea: number;
  boardsNeeded: number;
  squareFeetNeeded: number;
  nailsNeeded?: number;
  adhesiveNeeded?: number;
  underlaymentNeeded?: number;
}

export default function HardwoodCalculator() {
  const [results, setResults] = useState<HardwoodResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      boardWidth: 3.25,
      boardLength: 84,
      wastePercentage: 10,
      installationType: 'nail-down',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    
    // Simulate calculation time for demo purposes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    const boardArea = (data.boardWidth * data.boardLength) / 144; // Convert sq inches to sq feet
    const boardsNeeded = Math.ceil(adjustedArea / boardArea);
    const squareFeetNeeded = adjustedArea;

    let nailsNeeded, adhesiveNeeded, underlaymentNeeded;

    switch (data.installationType) {
      case 'nail-down':
        nailsNeeded = Math.ceil(roomArea / 100); // Rough estimate: 1 box per 100 sq ft
        break;
      case 'glue-down':
        adhesiveNeeded = Math.ceil(roomArea / 200); // Rough estimate: 1 gallon per 200 sq ft
        break;
      case 'floating':
        underlaymentNeeded = Math.ceil(adjustedArea); // 1:1 ratio with flooring
        break;
    }

    setResults({
      roomArea,
      adjustedArea,
      boardsNeeded,
      squareFeetNeeded,
      nailsNeeded,
      adhesiveNeeded,
      underlaymentNeeded,
    });
    
    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Hardwood Flooring Calculator"
      description="Calculate hardwood flooring needs including boards, nails, underlayment, and finishing materials."
      metaTitle="Hardwood Flooring Calculator - Wood Floor Calculator | FlooringCalc Pro"
      metaDescription="Professional hardwood flooring calculator. Calculate solid and engineered wood flooring materials, nails, underlayment, and finishing supplies."
      keywords={['hardwood flooring calculator', 'wood flooring calculator', 'engineered wood calculator', 'hardwood cost calculator']}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="boardWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="3.25"
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
                  name="boardLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board Length (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="84"
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
                name="installationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select installation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nail-down">Nail Down</SelectItem>
                        <SelectItem value="glue-down">Glue Down</SelectItem>
                        <SelectItem value="floating">Floating Floor</SelectItem>
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
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Hardwood Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="hardwood"
              variant="pattern"
            />
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
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Boards Needed:</span>
                      <span className="font-semibold text-primary">{results.boardsNeeded} boards</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Sq Ft to Order:</span>
                      <span className="font-semibold text-secondary">{results.squareFeetNeeded.toFixed(2)} sq ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🌳</div>
                    <p className="text-sm">Enter details to calculate</p>
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
                    {results.nailsNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Nails/Staples:</span>
                        <span className="font-semibold">{results.nailsNeeded} boxes</span>
                      </div>
                    )}
                    {results.adhesiveNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold">{results.adhesiveNeeded} gallons</span>
                      </div>
                    )}
                    {results.underlaymentNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Underlayment:</span>
                        <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔨</div>
                    <p className="text-sm">Installation materials will appear here</p>
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
