import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calculator from '@/components/Calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { calculateFlooringCost, type FlooringCostInputs, type FlooringCostResults } from '@/lib/calculatorFormulas';

const formSchema = z.object({
  length: z.number().min(0.1, 'Length must be greater than 0'),
  width: z.number().min(0.1, 'Width must be greater than 0'),
  materialCost: z.number().min(0, 'Material cost must be 0 or greater'),
  laborCost: z.number().min(0, 'Labor cost must be 0 or greater'),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  additionalCosts: z.number().min(0, 'Additional costs must be 0 or greater').optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function FlooringCostCalculator() {
  const [results, setResults] = useState<FlooringCostResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: 0,
      width: 0,
      materialCost: 0,
      laborCost: 0,
      wastePercentage: 10,
      additionalCosts: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    const inputs: FlooringCostInputs = {
      length: data.length,
      width: data.width,
      materialCost: data.materialCost,
      laborCost: data.laborCost,
      wastePercentage: data.wastePercentage,
      additionalCosts: data.additionalCosts || 0,
    };

    const calculationResults = calculateFlooringCost(inputs);
    setResults(calculationResults);
  };

  return (
    <Calculator
      title="Flooring Cost Calculator"
      description="Calculate total project costs including materials, labor, and additional expenses for your flooring project."
      metaTitle="Flooring Cost Calculator - Free Professional Tool | FlooringCalc Pro"
      metaDescription="Calculate accurate flooring costs including materials, labor, and waste. Professional-grade calculator for contractors and homeowners. Get instant estimates."
      keywords={['flooring cost calculator', 'flooring price estimator', 'flooring budget calculator', 'flooring installation cost']}
      faqs={[
        {
          question: "How much does flooring installation typically cost?",
          answer: "Installation costs vary by material: Carpet $1-4/sq ft, Hardwood $4-8/sq ft, Tile $5-10/sq ft, Vinyl $2-5/sq ft, Laminate $2-6/sq ft. Complex patterns and subfloor prep increase costs."
        },
        {
          question: "What additional costs should I budget for?",
          answer: "Include underlayment ($0.50-2/sq ft), transitions ($15-50 each), quarter round molding ($1-3/linear ft), subfloor repairs, and disposal fees. Add 10-20% contingency for unexpected issues."
        },
        {
          question: "How do I get accurate labor estimates?",
          answer: "Get quotes from 3+ licensed contractors. Prices vary by region, complexity, and contractor experience. Include removal of existing flooring, subfloor prep, and cleanup in estimates."
        },
        {
          question: "When is DIY flooring installation worth it?",
          answer: "DIY saves 50-70% on labor for floating floors (laminate, LVP). Consider professional installation for tile, hardwood, or rooms with complex layouts requiring specialized tools and experience."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Details</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Length (ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter length"
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
                    <FormLabel>Room Width (ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter width"
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
                name="materialCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Cost per Sq Ft ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Cost per Sq Ft ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                    <FormLabel>Waste Percentage</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select waste percentage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">5% - Standard rectangular room</SelectItem>
                        <SelectItem value="10">10% - Room with few cuts</SelectItem>
                        <SelectItem value="15">15% - Complex layout</SelectItem>
                        <SelectItem value="20">20% - Diagonal/pattern install</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalCosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Costs ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Total Cost
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Cost Breakdown</h4>
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              {results ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="font-medium">Base Area:</span>
                    <span className="font-semibold">{results.baseArea.toFixed(2)} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="font-medium">With Waste:</span>
                    <span className="font-semibold">{results.adjustedArea.toFixed(2)} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="font-medium">Material Cost:</span>
                    <span className="font-semibold text-primary">${results.materialTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="font-medium">Labor Cost:</span>
                    <span className="font-semibold text-secondary">${results.laborTotal.toFixed(2)}</span>
                  </div>
                  {results.additionalTotal > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="font-medium">Additional Costs:</span>
                      <span className="font-semibold">${results.additionalTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 text-lg">
                    <span className="font-bold">Total Project Cost:</span>
                    <span className="font-bold text-2xl text-primary">${results.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-4">
                    <p><strong>Cost per Sq Ft:</strong> ${results.costPerSqFt.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🧮</div>
                  <p>Enter project details to see cost breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Calculator>
  );
}
