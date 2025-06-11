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
  plankWidth: z.number().min(1, 'Plank width must be greater than 0'),
  plankLength: z.number().min(1, 'Plank length must be greater than 0'),
  installationType: z.enum(['click-lock', 'glue-down', 'nail-down']),
  wastePercentage: z.number().min(0).max(50, 'Waste percentage must be between 0-50%'),
  plankCost: z.number().min(0, 'Plank cost must be positive'),
});

type FormData = z.infer<typeof formSchema>;

interface EngineeredResults {
  roomArea: number;
  adjustedArea: number;
  planksNeeded: number;
  boxesNeeded: number;
  squareFeetNeeded: number;
  underlaymentNeeded?: number;
  adhesiveNeeded?: number;
  totalMaterialCost: number;
  costPerSqFt: number;
  laborHours: number;
  installationTips: string[];
}

export default function EngineeredWoodCalculator() {
  const [results, setResults] = useState<EngineeredResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      plankWidth: 5,
      plankLength: 48,
      installationType: 'click-lock',
      wastePercentage: 10,
      plankCost: 4.50,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    const plankArea = (data.plankWidth * data.plankLength) / 144; // Convert to sq ft
    const planksNeeded = Math.ceil(adjustedArea / plankArea);
    const squareFeetPerBox = 20; // Typical engineered wood box coverage
    const boxesNeeded = Math.ceil(adjustedArea / squareFeetPerBox);
    
    let underlaymentNeeded, adhesiveNeeded;
    let laborMultiplier = 1;
    let installationTips: string[] = [];

    switch (data.installationType) {
      case 'click-lock':
        if (roomArea > 500) {
          underlaymentNeeded = Math.ceil(adjustedArea);
        }
        laborMultiplier = 0.8;
        installationTips = [
          'Ensure subfloor is level within 3/16" over 10 feet',
          'Leave 1/4" expansion gap around perimeter',
          'Install perpendicular to longest wall',
          'Use tapping block to avoid damage during installation'
        ];
        break;
      case 'glue-down':
        adhesiveNeeded = Math.ceil(adjustedArea / 200); // Gallons
        laborMultiplier = 1.2;
        installationTips = [
          'Test adhesive compatibility with subfloor',
          'Apply adhesive with recommended trowel size',
          'Work in small sections to prevent skin-over',
          'Roll planks with 100lb roller after installation'
        ];
        break;
      case 'nail-down':
        laborMultiplier = 1.0;
        installationTips = [
          'Use proper nail spacing: 6-8" apart',
          'Pre-drill near ends to prevent splitting',
          'Set nails flush with surface',
          'Check moisture content before installation'
        ];
        break;
    }

    const laborHours = Math.ceil((roomArea / 100) * 8 * laborMultiplier);
    const totalMaterialCost = (adjustedArea * data.plankCost) + 
                             (underlaymentNeeded ? underlaymentNeeded * 0.75 : 0) +
                             (adhesiveNeeded ? adhesiveNeeded * 45 : 0);
    const costPerSqFt = totalMaterialCost / roomArea;

    setResults({
      roomArea,
      adjustedArea,
      planksNeeded,
      boxesNeeded,
      squareFeetNeeded: adjustedArea,
      underlaymentNeeded,
      adhesiveNeeded,
      totalMaterialCost,
      costPerSqFt,
      laborHours,
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Engineered Wood Calculator"
      description="Calculate engineered wood flooring requirements with click-lock and glue-down installation options."
      metaTitle="Engineered Wood Calculator - Engineered Hardwood Calculator | FlooringCalc Pro"
      metaDescription="Calculate engineered wood flooring materials for click-lock and glue-down installations. Professional engineered hardwood calculator."
      keywords={['engineered wood calculator', 'engineered hardwood calculator', 'click-lock flooring calculator', 'engineered plank calculator']}
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
                  name="plankWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plank Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="5"
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

              <FormField
                control={form.control}
                name="installationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select installation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="click-lock">Click-Lock Floating</SelectItem>
                        <SelectItem value="glue-down">Glue Down</SelectItem>
                        <SelectItem value="nail-down">Nail Down</SelectItem>
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
                  name="plankCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Sq Ft ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="4.50"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Engineered Wood Requirements'}
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
                      <span className="font-medium">With Waste:</span>
                      <span className="font-semibold">{results.adjustedArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Planks Needed:</span>
                      <span className="font-semibold text-primary">{results.planksNeeded} planks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Boxes Needed:</span>
                      <span className="font-semibold text-secondary">{results.boxesNeeded} boxes</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🪵</div>
                    <p className="text-sm">Enter details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Material Cost:</span>
                      <span className="font-semibold">${results.totalMaterialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cost per Sq Ft:</span>
                      <span className="font-semibold">${results.costPerSqFt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours} hours</span>
                    </div>
                    {results.underlaymentNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Underlayment:</span>
                        <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                      </div>
                    )}
                    {results.adhesiveNeeded && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold">{results.adhesiveNeeded} gallons</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost breakdown will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && results.installationTips.length > 0 && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Installation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.installationTips.map((tip, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Calculator>
  );
}