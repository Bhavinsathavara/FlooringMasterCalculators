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
  subfloorType: z.enum(['plywood', 'osb', 'particle-board', 'cement-board', 'drycore']),
  thickness: z.enum(['1/2-inch', '5/8-inch', '3/4-inch', '1-inch', '1-1/8-inch']),
  joistSpacing: z.enum(['12-inch', '16-inch', '19.2-inch', '24-inch']),
  existing: z.enum(['none', 'remove', 'over-existing']),
  moistureBarrier: z.boolean(),
  soundDampening: z.boolean(),
  radiantHeat: z.boolean(),
  wastePercentage: z.number().min(5).max(20, 'Waste percentage must be between 5-20%'),
});

type FormData = z.infer<typeof formSchema>;

interface SubfloorResults {
  roomArea: number;
  sheetsNeeded: number;
  squareFeetNeeded: number;
  fasteners: {
    screws: number;
    adhesive: number;
  };
  moistureBarrierNeeded: number;
  soundDampeningNeeded: number;
  laborHours: number;
  totalCost: number;
  installationSteps: string[];
  toolsRequired: string[];
}

export default function SubfloorCalculator() {
  const [results, setResults] = useState<SubfloorResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      subfloorType: 'plywood',
      thickness: '3/4-inch',
      joistSpacing: '16-inch',
      existing: 'none',
      moistureBarrier: false,
      soundDampening: false,
      radiantHeat: false,
      wastePercentage: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);

    // Calculate sheets needed (4x8 = 32 sq ft per sheet)
    const sheetsNeeded = Math.ceil(adjustedArea / 32);
    const squareFeetNeeded = sheetsNeeded * 32;

    // Fastener calculations
    const spacing = parseInt(data.joistSpacing.split('-')[0]);
    const screwsPerSheet = Math.ceil((48 / spacing) * (96 / 8)) * 2; // 2 screws per joist intersection
    const totalScrews = sheetsNeeded * screwsPerSheet;
    
    // Adhesive calculation (1 tube per 4 sheets)
    const adhesiveTubes = Math.ceil(sheetsNeeded / 4);

    // Additional materials
    const moistureBarrierNeeded = data.moistureBarrier ? Math.ceil(roomArea * 1.1) : 0;
    const soundDampeningNeeded = data.soundDampening ? Math.ceil(roomArea * 1.05) : 0;

    // Labor calculation
    const baseHours = roomArea * 0.15; // 0.15 hours per sq ft
    const complexityMultiplier = data.existing === 'remove' ? 2.5 : data.existing === 'over-existing' ? 1.3 : 1.0;
    const laborHours = baseHours * complexityMultiplier;

    // Cost calculation
    const materialCosts = {
      'plywood': { '1/2-inch': 32, '5/8-inch': 38, '3/4-inch': 45, '1-inch': 62, '1-1/8-inch': 68 },
      'osb': { '1/2-inch': 22, '5/8-inch': 26, '3/4-inch': 30, '1-inch': 42, '1-1/8-inch': 46 },
      'particle-board': { '1/2-inch': 18, '5/8-inch': 22, '3/4-inch': 26, '1-inch': 36, '1-1/8-inch': 40 },
      'cement-board': { '1/2-inch': 45, '5/8-inch': 52, '3/4-inch': 58, '1-inch': 75, '1-1/8-inch': 82 },
      'drycore': { '1/2-inch': 55, '5/8-inch': 62, '3/4-inch': 68, '1-inch': 85, '1-1/8-inch': 92 },
    };

    const materialCost = sheetsNeeded * materialCosts[data.subfloorType][data.thickness];
    const screwCost = Math.ceil(totalScrews / 100) * 12; // $12 per 100 screws
    const adhesiveCost = adhesiveTubes * 8; // $8 per tube
    const moistureBarrierCost = moistureBarrierNeeded * 0.35; // $0.35 per sq ft
    const soundDampeningCost = soundDampeningNeeded * 1.25; // $1.25 per sq ft

    const totalCost = materialCost + screwCost + adhesiveCost + moistureBarrierCost + soundDampeningCost;

    // Installation steps
    const installationSteps = [
      data.existing === 'remove' ? 'Remove existing subfloor' : null,
      'Check joist level and spacing',
      'Mark joist locations on walls',
      data.moistureBarrier ? 'Install moisture barrier' : null,
      data.soundDampening ? 'Install sound dampening material' : null,
      'Cut subfloor panels to fit',
      'Apply construction adhesive to joists',
      'Install subfloor panels with 1/8" gaps',
      'Secure with appropriate fasteners',
      'Check for squeaks and refasten if needed',
    ].filter(Boolean) as string[];

    // Tools required
    const toolsRequired = [
      'Circular saw',
      'Drill/driver',
      'Chalk line',
      'Measuring tape',
      'Safety glasses',
      'Hearing protection',
      'Knee pads',
    ];

    if (data.subfloorType === 'cement-board') {
      toolsRequired.push('Carbide blade');
      toolsRequired.push('Dust mask');
    }

    setResults({
      roomArea,
      sheetsNeeded,
      squareFeetNeeded,
      fasteners: {
        screws: totalScrews,
        adhesive: adhesiveTubes,
      },
      moistureBarrierNeeded,
      soundDampeningNeeded,
      laborHours,
      totalCost,
      installationSteps,
      toolsRequired,
    });
  };

  return (
    <Calculator
      title="Subfloor Calculator"
      description="Calculate subfloor materials including plywood, OSB, and cement board requirements."
      metaTitle="Subfloor Calculator - Plywood OSB Calculator | FlooringCalc Pro"
      metaDescription="Calculate subfloor materials including plywood, OSB, and cement board. Professional subfloor installation calculator."
      keywords={['subfloor calculator', 'plywood calculator', 'osb calculator', 'cement board calculator']}
      category="advanced"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Subfloor Specifications</h4>
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
                  name="subfloorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subfloor Material</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plywood">Plywood</SelectItem>
                          <SelectItem value="osb">OSB (Oriented Strand Board)</SelectItem>
                          <SelectItem value="particle-board">Particle Board</SelectItem>
                          <SelectItem value="cement-board">Cement Board</SelectItem>
                          <SelectItem value="drycore">DryCore Subfloor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thickness</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select thickness" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1/2-inch">1/2 inch</SelectItem>
                          <SelectItem value="5/8-inch">5/8 inch</SelectItem>
                          <SelectItem value="3/4-inch">3/4 inch</SelectItem>
                          <SelectItem value="1-inch">1 inch</SelectItem>
                          <SelectItem value="1-1/8-inch">1-1/8 inch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="joistSpacing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joist Spacing</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select spacing" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12-inch">12 inches O.C.</SelectItem>
                          <SelectItem value="16-inch">16 inches O.C.</SelectItem>
                          <SelectItem value="19.2-inch">19.2 inches O.C.</SelectItem>
                          <SelectItem value="24-inch">24 inches O.C.</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="existing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Subfloor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Existing Subfloor</SelectItem>
                          <SelectItem value="remove">Remove Existing</SelectItem>
                          <SelectItem value="over-existing">Install Over Existing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Additional Options</h5>
                
                <FormField
                  control={form.control}
                  name="moistureBarrier"
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
                      <FormLabel className="text-sm font-normal">Include moisture barrier</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="soundDampening"
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
                      <FormLabel className="text-sm font-normal">Include sound dampening</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="radiantHeat"
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
                      <FormLabel className="text-sm font-normal">Radiant heat compatible</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Subfloor Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Subfloor Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Sheets Needed:</span>
                      <span className="font-semibold text-primary">{results.sheetsNeeded} sheets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Sq Ft:</span>
                      <span className="font-semibold text-secondary">{results.squareFeetNeeded} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Screws Needed:</span>
                      <span className="font-semibold">{results.fasteners.screws} screws</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Adhesive:</span>
                      <span className="font-semibold">{results.fasteners.adhesive} tubes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🏗️</div>
                    <p className="text-sm">Enter details to calculate subfloor</p>
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
                    {results.moistureBarrierNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Moisture Barrier:</span>
                        <span className="font-semibold">{results.moistureBarrierNeeded} sq ft</span>
                      </div>
                    )}
                    {results.soundDampeningNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sound Dampening:</span>
                        <span className="font-semibold">{results.soundDampeningNeeded} sq ft</span>
                      </div>
                    )}
                    {results.moistureBarrierNeeded === 0 && results.soundDampeningNeeded === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        <p className="text-sm">Select additional materials above</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Additional materials will appear here</p>
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
                    <p className="text-sm text-gray-600">Material Cost Only</p>
                    <p className="text-xs text-gray-500 mt-2">Labor costs vary by region</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost estimate will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Installation Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ol className="space-y-2">
                    {results.installationSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Installation steps will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg">Tools Required</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="grid grid-cols-2 gap-2">
                    {results.toolsRequired.map((tool, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                        <span className="text-sm text-gray-700">{tool}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Tool list will appear here</p>
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