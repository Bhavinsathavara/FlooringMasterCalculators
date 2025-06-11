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
  maxVariation: z.number().min(0.0625, 'Minimum variation is 1/16 inch'),
  levelingMethod: z.enum(['self-leveling', 'floor-patch', 'shims', 'plywood-overlay']),
  currentSubfloor: z.enum(['concrete', 'plywood', 'osb', 'hardwood']),
  targetFlooring: z.enum(['tile', 'hardwood', 'laminate', 'vinyl', 'carpet']),
});

type FormData = z.infer<typeof formSchema>;

interface LevelingResults {
  roomArea: number;
  levelingMaterial: number;
  primerNeeded: number;
  additionalMaterial: number;
  totalCost: number;
  costPerSqFt: number;
  levelingMethod: string;
  applicationSteps: string[];
  dryTime: string;
  toleranceAchieved: string;
}

export default function UnlevelFloorCalculator() {
  const [results, setResults] = useState<LevelingResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      maxVariation: 0.25,
      levelingMethod: 'self-leveling',
      currentSubfloor: 'concrete',
      targetFlooring: 'tile',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    
    const methodData = {
      'self-leveling': {
        coverage: 50, // sq ft per bag
        cost: 35,
        primer: true,
        dryTime: '24-48 hours',
        tolerance: '1/8" over 10 feet',
        additional: 0
      },
      'floor-patch': {
        coverage: 30,
        cost: 25,
        primer: true,
        dryTime: '4-6 hours',
        tolerance: '1/4" over 10 feet',
        additional: 0
      },
      'shims': {
        coverage: 100, // sq ft per bundle
        cost: 45,
        primer: false,
        dryTime: 'Immediate',
        tolerance: '1/16" precision',
        additional: 15 // screws and hardware
      },
      'plywood-overlay': {
        coverage: 32, // sq ft per sheet
        cost: 65,
        primer: false,
        dryTime: 'Immediate',
        tolerance: '1/8" over 10 feet',
        additional: 25 // screws and glue
      }
    };

    const method = methodData[data.levelingMethod];
    const bagsNeeded = Math.ceil(roomArea / method.coverage);
    const levelingMaterial = bagsNeeded;
    const primerNeeded = method.primer ? Math.ceil(roomArea / 200) : 0; // gallons
    const additionalMaterial = method.additional;

    const materialCost = (levelingMaterial * method.cost) + 
                        (primerNeeded * 45) + 
                        additionalMaterial;
    const totalCost = materialCost;
    const costPerSqFt = totalCost / roomArea;

    const applicationSteps = {
      'self-leveling': [
        'Clean and vacuum subfloor thoroughly',
        'Apply primer if required for substrate',
        'Mix self-leveling compound per manufacturer specs',
        'Pour and spread compound with gauge rake',
        'Use spiked roller to remove air bubbles',
        'Allow to cure completely before foot traffic'
      ],
      'floor-patch': [
        'Mark low areas and clean thoroughly',
        'Apply primer to patch areas if needed',
        'Mix floor patch compound to thick consistency',
        'Apply with trowel in thin lifts',
        'Feather edges to blend with surrounding floor',
        'Sand smooth when dry if necessary'
      ],
      'shims': [
        'Identify high and low spots with level',
        'Cut shims to appropriate thickness',
        'Place shims at joist locations',
        'Secure with appropriate fasteners',
        'Check level frequently during installation',
        'Fill gaps with appropriate filler'
      ],
      'plywood-overlay': [
        'Check subfloor for loose boards and secure',
        'Mark high spots and sand if necessary',
        'Install plywood with staggered joints',
        'Leave 1/8" gap between sheets',
        'Secure with ring shank nails or screws',
        'Sand joints smooth if needed'
      ]
    };

    setResults({
      roomArea,
      levelingMaterial,
      primerNeeded,
      additionalMaterial,
      totalCost,
      costPerSqFt,
      levelingMethod: data.levelingMethod,
      applicationSteps: applicationSteps[data.levelingMethod],
      dryTime: method.dryTime,
      toleranceAchieved: method.tolerance,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Uneven Floor Leveling Calculator"
      description="Calculate materials needed to level uneven subfloors before flooring installation."
      metaTitle="Floor Leveling Calculator - Subfloor Leveling Materials | FlooringCalc Pro"
      metaDescription="Calculate floor leveling compound and materials needed to fix uneven subfloors. Professional subfloor preparation calculator."
      keywords={['floor leveling calculator', 'subfloor leveling', 'uneven floor calculator', 'floor preparation calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Floor Assessment</h4>
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
                name="maxVariation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Floor Variation (inches)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0.0625">1/16" (Minor)</SelectItem>
                        <SelectItem value="0.125">1/8" (Slight)</SelectItem>
                        <SelectItem value="0.25">1/4" (Moderate)</SelectItem>
                        <SelectItem value="0.5">1/2" (Significant)</SelectItem>
                        <SelectItem value="1">1" (Major)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentSubfloor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Subfloor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subfloor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete</SelectItem>
                          <SelectItem value="plywood">Plywood</SelectItem>
                          <SelectItem value="osb">OSB</SelectItem>
                          <SelectItem value="hardwood">Hardwood</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetFlooring"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Flooring</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select flooring" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tile">Tile</SelectItem>
                          <SelectItem value="hardwood">Hardwood</SelectItem>
                          <SelectItem value="laminate">Laminate</SelectItem>
                          <SelectItem value="vinyl">Vinyl</SelectItem>
                          <SelectItem value="carpet">Carpet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="levelingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leveling Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="self-leveling">Self-Leveling Compound</SelectItem>
                        <SelectItem value="floor-patch">Floor Patch Compound</SelectItem>
                        <SelectItem value="shims">Shimming</SelectItem>
                        <SelectItem value="plywood-overlay">Plywood Overlay</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Leveling Materials'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Leveling Solution</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="concrete"
              variant="pattern"
            />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Material Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Leveling Material:</span>
                      <span className="font-semibold text-primary">{results.levelingMaterial} units</span>
                    </div>
                    {results.primerNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Primer Needed:</span>
                        <span className="font-semibold">{results.primerNeeded} gallons</span>
                      </div>
                    )}
                    {results.additionalMaterial > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Additional Materials:</span>
                        <span className="font-semibold">${results.additionalMaterial}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📐</div>
                    <p className="text-sm">Enter floor details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cost per Sq Ft:</span>
                      <span className="font-semibold">${results.costPerSqFt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Dry Time:</span>
                      <span className="font-semibold text-blue-600">{results.dryTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Final Tolerance:</span>
                      <span className="font-semibold text-green-600">{results.toleranceAchieved}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm">Project summary will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Application Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {results.applicationSteps.map((step, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-blue-600 mr-2 font-medium">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Calculator>
  );
}