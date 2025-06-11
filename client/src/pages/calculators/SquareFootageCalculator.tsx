import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calculator from '@/components/Calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { calculateSquareFootage, type SquareFootageInputs, type SquareFootageResults } from '@/lib/calculatorFormulas';

const baseSchema = z.object({
  shape: z.enum(['rectangle', 'square', 'circle', 'l-shape', 'triangle']),
});

const rectangleSchema = baseSchema.extend({
  length: z.number().min(0.1, 'Length must be greater than 0'),
  width: z.number().min(0.1, 'Width must be greater than 0'),
});

const circleSchema = baseSchema.extend({
  radius: z.number().min(0.1, 'Radius must be greater than 0'),
});

const lShapeSchema = baseSchema.extend({
  length1: z.number().min(0.1, 'Length 1 must be greater than 0'),
  width1: z.number().min(0.1, 'Width 1 must be greater than 0'),
  length2: z.number().min(0.1, 'Length 2 must be greater than 0'),
  width2: z.number().min(0.1, 'Width 2 must be greater than 0'),
});

const triangleSchema = baseSchema.extend({
  base: z.number().min(0.1, 'Base must be greater than 0'),
  height: z.number().min(0.1, 'Height must be greater than 0'),
});

export default function SquareFootageCalculator() {
  const [results, setResults] = useState<SquareFootageResults | null>(null);
  const [selectedShape, setSelectedShape] = useState<string>('rectangle');

  const form = useForm({
    defaultValues: {
      shape: 'rectangle',
      length: 0,
      width: 0,
      radius: 0,
      length1: 0,
      width1: 0,
      length2: 0,
      width2: 0,
      base: 0,
      height: 0,
    },
  });

  const onSubmit = (data: any) => {
    const inputs: SquareFootageInputs = {
      shape: data.shape,
      length: data.length,
      width: data.width,
      radius: data.radius,
      length1: data.length1,
      width1: data.width1,
      length2: data.length2,
      width2: data.width2,
      base: data.base,
      height: data.height,
    };

    const calculationResults = calculateSquareFootage(inputs);
    setResults(calculationResults);
  };

  const renderShapeInputs = () => {
    switch (selectedShape) {
      case 'rectangle':
      case 'square':
        return (
          <>
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
                  <FormLabel>Width (ft)</FormLabel>
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
          </>
        );
      case 'circle':
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
                    placeholder="Enter radius"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'l-shape':
        return (
          <>
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
                        placeholder="Length 1"
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
                        placeholder="Width 1"
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
                name="length2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length 2 (ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Length 2"
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
                        placeholder="Width 2"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      case 'triangle':
        return (
          <>
            <FormField
              control={form.control}
              name="base"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base (ft)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter base"
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
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (ft)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter height"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Calculator
      title="Square Footage Calculator"
      description="Calculate precise square footage for regular, irregular, and complex room shapes with our advanced measurement tool."
      metaTitle="Square Footage Calculator - Room Area Calculator | FlooringCalc Pro"
      metaDescription="Calculate room square footage for any shape - rectangular, L-shaped, circular rooms. Professional room area calculator with instant results."
      keywords={['square footage calculator', 'room area calculator', 'floor area calculator', 'room size calculator']}
      faqs={[
        {
          question: "How do I measure an irregular shaped room?",
          answer: "Break irregular rooms into basic shapes (rectangles, triangles, circles). Measure each section separately, calculate their areas, then add them together. For L-shaped rooms, use our L-shape calculator option."
        },
        {
          question: "What's the difference between square feet and square yards?",
          answer: "1 square yard = 9 square feet. To convert: divide square feet by 9 for square yards, or multiply square yards by 9 for square feet. Carpet is often sold by square yards, while most other flooring uses square feet."
        },
        {
          question: "Do I need to subtract area for doorways and built-ins?",
          answer: "Subtract large permanent fixtures like kitchen islands or built-in cabinets. Don't subtract doorways, small closets, or areas under 10 sq ft - the extra material accounts for waste and future repairs."
        },
        {
          question: "How accurate should my measurements be?",
          answer: "Measure to the nearest 1/4 inch for best results. Use a quality tape measure and double-check all measurements. For large rooms, consider thermal expansion - measure at room temperature."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room Measurements</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Shape</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedShape(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room shape" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rectangle">Rectangle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="l-shape">L-Shape</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renderShapeInputs()}

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Square Footage
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Results</h4>
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              {results ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{results.area.toFixed(2)}</div>
                    <div className="text-lg text-gray-600">Square Feet</div>
                  </div>
                  <div className="text-center text-sm text-gray-500 border-t pt-4">
                    <p><strong>Calculation:</strong> {results.calculation}</p>
                    <p className="mt-2"><strong>Also equals:</strong></p>
                    <p>{results.areaInYards.toFixed(2)} square yards</p>
                    <p>{results.areaInInches.toFixed(0)} square inches</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">📐</div>
                  <p>Enter measurements to calculate square footage</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Calculator>
  );
}
