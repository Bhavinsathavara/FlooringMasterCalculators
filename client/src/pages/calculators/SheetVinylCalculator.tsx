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
  rollWidth: z.number().min(6, 'Roll width must be at least 6 feet'),
  wastePercentage: z.number().min(0).max(30, 'Waste percentage must be between 0-30%'),
  seamTolerance: z.number().min(0).max(12, 'Seam tolerance must be between 0-12 inches'),
  vinylCost: z.number().min(0, 'Vinyl cost must be positive'),
});

type FormData = z.infer<typeof formSchema>;

interface SheetVinylResults {
  roomArea: number;
  linearFeetNeeded: number;
  totalSquareFeet: number;
  seamLayout: string;
  wasteAmount: number;
  totalCost: number;
  costPerSqFt: number;
  installationTips: string[];
  rollsNeeded: number;
}

export default function SheetVinylCalculator() {
  const [results, setResults] = useState<SheetVinylResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      rollWidth: 12,
      wastePercentage: 10,
      seamTolerance: 6,
      vinylCost: 2.85,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    let linearFeetNeeded: number;
    let seamLayout: string;
    let rollsNeeded = 1;

    // Determine if seams are needed
    if (data.roomWidth <= data.rollWidth && data.roomLength <= data.rollWidth) {
      // Single piece installation
      linearFeetNeeded = Math.max(data.roomLength, data.roomWidth);
      seamLayout = "Single piece installation - no seams required";
    } else if (data.roomWidth <= data.rollWidth) {
      // Run lengthwise
      linearFeetNeeded = data.roomLength;
      seamLayout = "Single width - vinyl runs lengthwise";
    } else if (data.roomLength <= data.rollWidth) {
      // Run widthwise
      linearFeetNeeded = data.roomWidth;
      seamLayout = "Single width - vinyl runs widthwise";
    } else {
      // Multiple pieces needed
      const piecesWidthwise = Math.ceil(data.roomWidth / data.rollWidth);
      const piecesLengthwise = Math.ceil(data.roomLength / data.rollWidth);
      
      if (piecesWidthwise <= piecesLengthwise) {
        linearFeetNeeded = data.roomLength * piecesWidthwise;
        rollsNeeded = piecesWidthwise;
        seamLayout = `${piecesWidthwise} pieces running lengthwise with ${piecesWidthwise - 1} seam(s)`;
      } else {
        linearFeetNeeded = data.roomWidth * piecesLengthwise;
        rollsNeeded = piecesLengthwise;
        seamLayout = `${piecesLengthwise} pieces running widthwise with ${piecesLengthwise - 1} seam(s)`;
      }
    }

    // Add waste and seam tolerance
    const wasteMultiplier = 1 + (data.wastePercentage / 100);
    const seamToleranceLinearFeet = (data.seamTolerance / 12) * rollsNeeded;
    linearFeetNeeded = (linearFeetNeeded + seamToleranceLinearFeet) * wasteMultiplier;

    const totalSquareFeet = linearFeetNeeded * data.rollWidth;
    const wasteAmount = totalSquareFeet - roomArea;
    const totalCost = totalSquareFeet * data.vinylCost;
    const costPerSqFt = totalCost / roomArea;

    const installationTips = [
      'Acclimate vinyl for 24 hours before installation',
      'Ensure subfloor is smooth and level',
      'Use sharp utility knife for clean cuts',
      'Roll out seams with 100lb roller',
      rollsNeeded > 1 ? 'Pattern match at seams for best appearance' : 'Single piece installation minimizes seams',
      'Leave 1/8" gap at walls for expansion'
    ];

    setResults({
      roomArea,
      linearFeetNeeded: Math.ceil(linearFeetNeeded),
      totalSquareFeet: Math.ceil(totalSquareFeet),
      seamLayout,
      wasteAmount,
      totalCost,
      costPerSqFt,
      installationTips,
      rollsNeeded,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Sheet Vinyl Calculator"
      description="Calculate sheet vinyl roll requirements with seam planning and waste minimization."
      metaTitle="Sheet Vinyl Calculator - Vinyl Roll Calculator | FlooringCalc Pro"
      metaDescription="Calculate sheet vinyl roll requirements with seam planning. Professional sheet vinyl calculator for roll goods and waste minimization."
      keywords={['sheet vinyl calculator', 'vinyl roll calculator', 'sheet vinyl roll calculator', 'vinyl sheet estimator']}
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

              <FormField
                control={form.control}
                name="rollWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Width (ft)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select roll width" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6">6 feet</SelectItem>
                        <SelectItem value="9">9 feet</SelectItem>
                        <SelectItem value="12">12 feet</SelectItem>
                        <SelectItem value="13.2">13.2 feet</SelectItem>
                        <SelectItem value="15">15 feet</SelectItem>
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
                  name="seamTolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seam Tolerance (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="6"
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
                name="vinylCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vinyl Cost per Sq Ft ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="2.85"
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
                {isCalculating ? 'Calculating...' : 'Calculate Sheet Vinyl Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <h4 className="text-lg font-semibold mb-4">Calculation Results</h4>
          <div className="space-y-4">
            <LoadingOverlay
              isLoading={isCalculating}
              theme="vinyl"
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
                      <span className="font-medium">Linear Feet Needed:</span>
                      <span className="font-semibold text-primary">{results.linearFeetNeeded} ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Square Feet:</span>
                      <span className="font-semibold">{results.totalSquareFeet} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Rolls Needed:</span>
                      <span className="font-semibold text-secondary">{results.rollsNeeded} roll(s)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Waste Amount:</span>
                      <span className="font-semibold">{results.wasteAmount.toFixed(2)} sq ft</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">📏</div>
                    <p className="text-sm">Enter details to calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Seam Layout</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">{results.seamLayout}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cost per Sq Ft:</span>
                      <span className="font-semibold">${results.costPerSqFt.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">✂️</div>
                    <p className="text-sm">Seam layout will appear here</p>
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