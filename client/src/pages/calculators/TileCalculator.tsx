import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calculator from '@/components/Calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { calculateTileRequirements, type TileCalculatorInputs, type TileCalculatorResults } from '@/lib/calculatorFormulas';

const formSchema = z.object({
  roomLength: z.number().min(0.1, 'Room length must be greater than 0'),
  roomWidth: z.number().min(0.1, 'Room width must be greater than 0'),
  tileLength: z.number().min(0.1, 'Tile length must be greater than 0'),
  tileWidth: z.number().min(0.1, 'Tile width must be greater than 0'),
  groutWidth: z.number().min(0, 'Grout width must be 0 or greater'),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
});

type FormData = z.infer<typeof formSchema>;

export default function TileCalculator() {
  const [results, setResults] = useState<TileCalculatorResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      tileLength: 12,
      tileWidth: 12,
      groutWidth: 0.125,
      wastePercentage: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const calculationResults = calculateTileRequirements(data);
    setResults(calculationResults);
  };

  return (
    <Calculator
      title="Tile Calculator"
      description="Calculate tiles needed by size, grout spacing, adhesive quantity, and complex pattern layouts."
      metaTitle="Tile Calculator - Tiles, Grout & Adhesive Calculator | FlooringCalc Pro"
      metaDescription="Professional tile calculator for ceramic, porcelain, and stone tiles. Calculate tiles needed, grout, and adhesive quantities with pattern support."
      keywords={['tile calculator', 'ceramic tile calculator', 'tile grout calculator', 'tile adhesive calculator', 'tile pattern calculator']}
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
                  name="tileLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Length (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.125"
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
                  name="tileWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.125"
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

              <FormField
                control={form.control}
                name="groutWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grout Width (inches)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0625"
                        placeholder="0.125"
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
                Calculate Tile Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Tile Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tile Area:</span>
                      <span className="font-semibold">{results.tileArea.toFixed(4)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tiles Needed:</span>
                      <span className="font-semibold text-primary">{results.tilesNeeded} tiles</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">With Waste:</span>
                      <span className="font-semibold text-secondary">{results.tilesWithWaste} tiles</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🧮</div>
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
                      <span className="font-medium">Grout Needed:</span>
                      <span className="font-semibold">{results.groutNeeded} lbs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Adhesive Needed:</span>
                      <span className="font-semibold">{results.adhesiveNeeded} bags</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🏗️</div>
                    <p className="text-sm">Material estimates will appear here</p>
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
