import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calculator from '@/components/Calculator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { calculateWastePercentage, type WastePercentageInputs, type WastePercentageResults } from '@/lib/calculatorFormulas';

const formSchema = z.object({
  roomComplexity: z.enum(['simple', 'moderate', 'complex']),
  materialType: z.enum(['tile', 'hardwood', 'vinyl', 'carpet', 'laminate']),
  installationMethod: z.enum(['straight', 'diagonal', 'pattern']),
  roomShape: z.enum(['rectangular', 'irregular']),
});

type FormData = z.infer<typeof formSchema>;

export default function WastePercentageCalculator() {
  const [results, setResults] = useState<WastePercentageResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomComplexity: 'simple',
      materialType: 'tile',
      installationMethod: 'straight',
      roomShape: 'rectangular',
    },
  });

  const onSubmit = (data: FormData) => {
    const calculationResults = calculateWastePercentage(data);
    setResults(calculationResults);
  };

  return (
    <Calculator
      title="Flooring Waste Percentage Calculator"
      description="Calculate optimal waste percentages based on room complexity, material type, and installation method."
      metaTitle="Flooring Waste Calculator - Material Waste Percentage | FlooringCalc Pro"
      metaDescription="Calculate optimal flooring waste percentage for your project. Reduce material costs and minimize over-ordering with precise calculations."
      keywords={['flooring waste calculator', 'material waste percentage', 'flooring overage calculator', 'waste factor calculator']}
      faqs={[
        {
          question: "What is the standard waste percentage for flooring?",
          answer: "Standard waste percentages: Tile 10-15%, Hardwood 10-15%, Vinyl/Laminate 5-10%, Carpet 10%, Stone 15-20%. Complex rooms or diagonal patterns require 15-25% additional waste allowance."
        },
        {
          question: "Why do I need extra flooring material?",
          answer: "Extra material accounts for cutting waste, defective pieces, future repairs, and installation errors. Pattern matching, diagonal layouts, and irregular rooms increase waste significantly."
        },
        {
          question: "How does room complexity affect waste percentage?",
          answer: "Simple rectangular rooms: 5-10% waste. Moderate complexity (few obstacles): 10-15%. Complex rooms (many angles, islands): 15-25%. Each additional cut increases waste."
        },
        {
          question: "Should I order extra for future repairs?",
          answer: "Yes, order 5-10% extra for future repairs and dye lot matching. Store leftover material in a dry location. Different production runs may not match exactly."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Parameters</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="roomComplexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Complexity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="simple">Simple - Basic rectangular room</SelectItem>
                        <SelectItem value="moderate">Moderate - Some obstacles and cuts</SelectItem>
                        <SelectItem value="complex">Complex - Many angles and obstacles</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tile">Ceramic/Porcelain Tile</SelectItem>
                        <SelectItem value="hardwood">Hardwood Flooring</SelectItem>
                        <SelectItem value="vinyl">Vinyl Flooring</SelectItem>
                        <SelectItem value="laminate">Laminate Flooring</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select installation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="straight">Straight Pattern</SelectItem>
                        <SelectItem value="diagonal">Diagonal Installation</SelectItem>
                        <SelectItem value="pattern">Complex Pattern (Herringbone, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="rectangular">Rectangular/Square</SelectItem>
                        <SelectItem value="irregular">Irregular Shape</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Waste Percentage
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Recommended Waste</h4>
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              {results ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{results.recommendedWaste}%</div>
                    <div className="text-lg text-gray-600">Recommended Waste</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-secondary">{results.minWaste}%</div>
                      <div className="text-sm text-gray-600">Minimum</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-red-600">{results.maxWaste}%</div>
                      <div className="text-sm text-gray-600">Maximum</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-700 mb-3">{results.explanation}</p>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Factors Considered:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {results.factors.map((factor, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Select project parameters to calculate waste percentage</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Calculator>
  );
}
