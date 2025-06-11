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
  roomLength: z.number().min(0.1),
  roomWidth: z.number().min(0.1),
  flooringType: z.enum(['laminate', 'hardwood', 'vinyl', 'tile']),
  soundRating: z.enum(['standard', 'enhanced', 'premium']),
  buildingType: z.enum(['single-family', 'condo', 'apartment', 'commercial']),
  wastePercentage: z.number().min(5).max(15),
});

type FormData = z.infer<typeof formSchema>;

interface AcousticResults {
  roomArea: number;
  adjustedArea: number;
  rollsNeeded: number;
  acousticTape: number;
  totalCost: number;
  soundReduction: string;
  installationTips: string[];
}

export default function AcousticUnderlaymentCalculator() {
  const [results, setResults] = useState<AcousticResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      flooringType: 'laminate',
      soundRating: 'standard',
      buildingType: 'single-family',
      wastePercentage: 10,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roomArea = data.roomLength * data.roomWidth;
    const adjustedArea = roomArea * (1 + data.wastePercentage / 100);
    
    const rollCoverage = 100; // sq ft per roll
    const rollsNeeded = Math.ceil(adjustedArea / rollCoverage);
    
    const perimeter = (data.roomLength + data.roomWidth) * 2;
    const acousticTape = Math.ceil(perimeter / 50); // 50 ft rolls

    const ratingCosts = {
      standard: 1.25,
      enhanced: 2.15,
      premium: 3.85
    };

    const materialCost = adjustedArea * ratingCosts[data.soundRating];
    const tapeCost = acousticTape * 35;
    const totalCost = materialCost + tapeCost;

    const soundReductionRatings = {
      standard: 'IIC 65, STC 66',
      enhanced: 'IIC 72, STC 71', 
      premium: 'IIC 74, STC 73'
    };

    const installationTips = [
      'Install perpendicular to flooring direction',
      'Butt seams tightly without overlapping',
      'Use acoustic tape on all seams',
      'Trim excess at walls with sharp knife',
      'Do not cover with plastic vapor barrier',
      'Install flooring immediately after underlayment'
    ];

    setResults({
      roomArea,
      adjustedArea,
      rollsNeeded,
      acousticTape,
      totalCost,
      soundReduction: soundReductionRatings[data.soundRating],
      installationTips,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="Acoustic Underlayment Calculator"
      description="Calculate acoustic underlayment materials for sound reduction in multi-story buildings."
      metaTitle="Acoustic Underlayment Calculator - Sound Barrier Calculator | FlooringCalc Pro"
      metaDescription="Calculate acoustic underlayment for sound reduction. Professional sound barrier calculator for laminate, hardwood, and vinyl flooring."
      keywords={['acoustic underlayment calculator', 'sound barrier calculator', 'noise reduction flooring']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Sound Control Requirements</h4>
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
                name="soundRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sound Rating Required</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard (IIC 65)</SelectItem>
                        <SelectItem value="enhanced">Enhanced (IIC 72)</SelectItem>
                        <SelectItem value="premium">Premium (IIC 74)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Acoustic Materials'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="vinyl" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Material Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Area Coverage:</span>
                      <span className="font-semibold">{results.adjustedArea.toFixed(0)} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Rolls Needed:</span>
                      <span className="font-semibold">{results.rollsNeeded} rolls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sound Rating:</span>
                      <span className="font-semibold text-blue-600">{results.soundReduction}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🔇</div>
                    <p className="text-sm">Enter details to calculate</p>
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