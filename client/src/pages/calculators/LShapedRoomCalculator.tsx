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
  length1: z.number().min(0.1, 'Length 1 must be greater than 0'),
  width1: z.number().min(0.1, 'Width 1 must be greater than 0'),
  length2: z.number().min(0.1, 'Length 2 must be greater than 0'),
  width2: z.number().min(0.1, 'Width 2 must be greater than 0'),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'carpet', 'laminate']),
});

type FormData = z.infer<typeof formSchema>;

interface LShapedResults {
  section1Area: number;
  section2Area: number;
  totalArea: number;
  adjustedArea: number;
  materialNeeded: number;
  seamLength: number;
  transitionStrips: number;
  installationTips: string[];
}

export default function LShapedRoomCalculator() {
  const [results, setResults] = useState<LShapedResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length1: 0,
      width1: 0,
      length2: 0,
      width2: 0,
      wastePercentage: 15,
      flooringType: 'tile',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const section1Area = data.length1 * data.width1;
    const section2Area = data.length2 * data.width2;
    const totalArea = section1Area + section2Area;
    const adjustedArea = totalArea * (1 + data.wastePercentage / 100);

    // Calculate material needed based on flooring type
    let materialNeeded = Math.ceil(adjustedArea);
    
    // Calculate seam length (where sections meet)
    const seamLength = Math.min(data.width1, data.width2);
    
    // Transition strips needed
    let transitionStrips = 0;
    if (data.flooringType === 'hardwood' || data.flooringType === 'laminate') {
      transitionStrips = 1; // One transition at the L junction
    }

    // Installation tips based on room shape and flooring type
    const installationTips = [
      'Start installation from the longest straight wall',
      'Plan layout to minimize cuts at the L-junction',
      'Measure and mark the L-junction carefully'
    ];

    switch (data.flooringType) {
      case 'tile':
        installationTips.push('Use chalk lines to establish grid patterns for both sections');
        installationTips.push('Consider running tiles in same direction through both sections');
        installationTips.push('Plan grout lines to align across the junction');
        break;
        
      case 'hardwood':
        installationTips.push('Run planks parallel to longest wall when possible');
        installationTips.push('Consider T-molding transition at junction if direction changes');
        installationTips.push('Ensure expansion gaps at all walls');
        break;
        
      case 'vinyl':
      case 'laminate':
        installationTips.push('Maintain same plank direction throughout if possible');
        installationTips.push('Use transition strips where floor direction changes');
        installationTips.push('Stagger joints to avoid weak points at corners');
        break;
        
      case 'carpet':
        installationTips.push('Seam carpet at the narrowest point of junction');
        installationTips.push('Run carpet pile in same direction for consistent appearance');
        installationTips.push('Use hot melt tape for strong seam connection');
        break;
    }

    // Additional tips for L-shaped rooms
    installationTips.push('Work from inside corner outward when possible');
    installationTips.push('Check square at the L-junction frequently');

    setResults({
      section1Area,
      section2Area,
      totalArea,
      adjustedArea,
      materialNeeded,
      seamLength,
      transitionStrips,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="L-Shaped Room Calculator"
      description="Calculate flooring materials for L-shaped and irregular room layouts with precise area measurements."
      metaTitle="L-Shaped Room Calculator - L Shape Flooring Calculator | FlooringCalc Pro"
      metaDescription="Calculate flooring for L-shaped rooms. Professional L-shaped room area calculator with material estimates and installation guidance."
      keywords={['L-shaped room calculator', 'L shape flooring calculator', 'irregular room calculator', 'L-shaped area calculator']}
      faqs={[
        {
          question: "How do I measure an L-shaped room accurately?",
          answer: "Break the L-shape into two rectangles. Measure length and width of each section separately, then add the areas together. Use a sketch to avoid measuring overlapping areas twice."
        },
        {
          question: "Should flooring run the same direction in both sections?",
          answer: "Generally yes, for visual continuity. However, if one section is much longer, consider the primary traffic flow. Use transition strips where direction must change."
        },
        {
          question: "How much extra waste should I add for L-shaped rooms?",
          answer: "Add 15-20% waste for L-shaped rooms due to additional cuts at corners and junctions. Complex angles or multiple direction changes may require 20-25% extra material."
        },
        {
          question: "Where should I place seams in an L-shaped room?",
          answer: "Place seams in carpet at the narrowest junction point. For hard surfaces, align seams with natural break lines and use transition strips for direction changes."
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">L-Shaped Room Dimensions</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h5 className="font-medium mb-3 text-gray-900">Section 1 (Main Rectangle)</h5>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="length1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (ft)</FormLabel>
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
                    name="width1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (ft)</FormLabel>
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
              </div>

              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h5 className="font-medium mb-3 text-gray-900">Section 2 (Extension Rectangle)</h5>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="length2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (ft)</FormLabel>
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
                    name="width2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (ft)</FormLabel>
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
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white">
                Calculate L-Shaped Room
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">L-Shaped Room Results</h4>
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Area Calculations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section 1 Area:</span>
                    <span className="font-semibold">{results.section1Area.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section 2 Area:</span>
                    <span className="font-semibold">{results.section2Area.toFixed(1)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Area:</span>
                    <span className="font-semibold">{results.totalArea.toFixed(1)} sq ft</span>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Junction Seam Length:</span>
                    <span className="font-semibold">{results.seamLength.toFixed(1)} ft</span>
                  </div>
                  {results.transitionStrips > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transition Strips:</span>
                      <span className="font-semibold">{results.transitionStrips}</span>
                    </div>
                  )}
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
                  <p>Enter L-shaped room dimensions to calculate flooring requirements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <LoadingOverlay isLoading={isCalculating} message="Calculating L-shaped room layout..." theme="default" />
    </Calculator>
  );
}