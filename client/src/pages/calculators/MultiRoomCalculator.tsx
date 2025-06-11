import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calculator from '@/components/Calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';

const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  length: z.number().min(0.1, 'Length must be greater than 0'),
  width: z.number().min(0.1, 'Width must be greater than 0'),
  shape: z.enum(['rectangle', 'l-shape', 'circle']),
});

const formSchema = z.object({
  rooms: z.array(roomSchema).min(1, 'At least one room is required'),
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'carpet', 'laminate']),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  bulkDiscount: z.number().min(0).max(50, 'Bulk discount must be between 0-50%'),
});

type FormData = z.infer<typeof formSchema>;

interface MultiRoomResults {
  rooms: Array<{
    name: string;
    area: number;
    adjustedArea: number;
  }>;
  totalArea: number;
  totalAdjustedArea: number;
  materialNeeded: number;
  estimatedCost: number;
  savings: number;
  installationTips: string[];
}

export default function MultiRoomCalculator() {
  const [results, setResults] = useState<MultiRoomResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rooms: [{ name: 'Living Room', length: 0, width: 0, shape: 'rectangle' }],
      flooringType: 'vinyl',
      wastePercentage: 10,
      bulkDiscount: 5,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const roomResults = data.rooms.map(room => {
      let area = 0;
      
      switch (room.shape) {
        case 'rectangle':
          area = room.length * room.width;
          break;
        case 'l-shape':
          // Simplified L-shape calculation
          area = room.length * room.width * 0.75; // Approximate
          break;
        case 'circle':
          area = Math.PI * (room.length / 2) * (room.length / 2); // Length as diameter
          break;
      }

      const adjustedArea = area * (1 + data.wastePercentage / 100);

      return {
        name: room.name,
        area,
        adjustedArea,
      };
    });

    const totalArea = roomResults.reduce((sum, room) => sum + room.area, 0);
    const totalAdjustedArea = roomResults.reduce((sum, room) => sum + room.adjustedArea, 0);
    const materialNeeded = Math.ceil(totalAdjustedArea);

    // Cost calculation with bulk pricing
    const materialCosts = {
      'tile': 4.50,
      'hardwood': 8.00,
      'vinyl': 3.25,
      'laminate': 2.75,
      'carpet': 3.00,
    };

    const baseCost = materialNeeded * materialCosts[data.flooringType];
    const bulkDiscountAmount = baseCost * (data.bulkDiscount / 100);
    const estimatedCost = baseCost - bulkDiscountAmount;

    // Installation tips for multi-room projects
    const installationTips = [
      'Order all materials at once to ensure consistent dye lots',
      'Plan installation sequence to minimize disruption',
      'Consider transition strips between rooms',
      'Schedule delivery to accommodate installation timeline'
    ];

    if (data.rooms.length > 3) {
      installationTips.push('Large projects may qualify for contractor discounts');
    }

    switch (data.flooringType) {
      case 'hardwood':
        installationTips.push('Run planks in same direction throughout connected spaces');
        installationTips.push('Acclimate all wood in climate-controlled area');
        break;
      case 'tile':
        installationTips.push('Maintain consistent grout lines between rooms');
        installationTips.push('Plan tile layout to minimize cuts at doorways');
        break;
      case 'vinyl':
      case 'laminate':
        installationTips.push('Use transition strips at doorways and level changes');
        installationTips.push('Install underlayment consistently throughout');
        break;
      case 'carpet':
        installationTips.push('Plan seams in low-traffic areas');
        installationTips.push('Maintain pile direction consistency');
        break;
    }

    setResults({
      rooms: roomResults,
      totalArea,
      totalAdjustedArea,
      materialNeeded,
      estimatedCost,
      savings: bulkDiscountAmount,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Multi-Room Calculator"
      description="Calculate flooring materials for multiple rooms and entire homes with bulk pricing and project coordination."
      metaTitle="Multi-Room Flooring Calculator - Whole House Calculator | FlooringCalc Pro"
      metaDescription="Calculate flooring for multiple rooms and entire homes. Professional multi-room calculator with bulk pricing and project coordination features."
      keywords={['multi-room calculator', 'whole house flooring calculator', 'multiple room calculator', 'bulk flooring calculator']}
      faqs={[
        {
          question: "How do I coordinate flooring across multiple rooms?",
          answer: "Choose one primary flooring type for main living areas. Use transition strips between different materials. Maintain consistent plank direction in connected spaces for visual flow."
        },
        {
          question: "Should I order materials for all rooms at once?",
          answer: "Yes, order all materials together to ensure consistent dye lots, wood grain matching, and bulk pricing. Store materials properly if installation spans multiple weeks."
        },
        {
          question: "How much can I save with bulk ordering?",
          answer: "Bulk orders often save 5-15% on materials. Large projects may qualify for contractor pricing. Factor in delivery costs - single delivery is more economical than multiple shipments."
        },
        {
          question: "What's the best installation sequence for multiple rooms?",
          answer: "Start with bedrooms and work toward main living areas. Install flooring before final trim work. Plan around furniture delivery and family living needs during installation."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Multi-Room Project</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">Rooms</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', length: 0, width: 0, shape: 'rectangle' })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Room
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 border-2 border-dashed border-gray-300">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1 mr-2">
                              <FormLabel>Room Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Room name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`rooms.${index}.shape`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Shape</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select shape" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="rectangle">Rectangle</SelectItem>
                                <SelectItem value="l-shape">L-Shape</SelectItem>
                                <SelectItem value="circle">Circle</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.length`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch(`rooms.${index}.shape`) === 'circle' ? 'Diameter (ft)' : 'Length (ft)'}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch(`rooms.${index}.shape`) !== 'circle' && (
                          <FormField
                            control={form.control}
                            name={`rooms.${index}.width`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Width (ft)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
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

              <div className="grid grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="bulkDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bulk Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate Multi-Room Project
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Project Summary</h4>
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.rooms.map((room, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{room.name}:</span>
                      <span className="font-semibold">{room.adjustedArea.toFixed(1)} sq ft</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Totals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Area:</span>
                    <span className="font-semibold">{results.totalArea.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area with Waste:</span>
                    <span className="font-semibold">{results.totalAdjustedArea.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material Needed:</span>
                    <span className="font-semibold text-primary">{results.materialNeeded} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bulk Savings:</span>
                    <span className="font-semibold text-green-600">${results.savings.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-bold text-lg text-primary">${results.estimatedCost.toFixed(0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Tips</CardTitle>
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
                  <p>Add rooms and specifications to calculate your multi-room project</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating multi-room project..." theme="default" />
    </Calculator>
  );
}