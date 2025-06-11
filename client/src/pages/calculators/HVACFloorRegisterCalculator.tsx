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
  ceilingHeight: z.number().min(7).max(20),
  hvacType: z.enum(['forced-air', 'radiant', 'baseboard']),
  registerSize: z.enum(['4x10', '4x12', '6x10', '6x12', '4x14']),
  flooringType: z.enum(['hardwood', 'tile', 'carpet', 'vinyl']),
});

type FormData = z.infer<typeof formSchema>;

interface HVACResults {
  roomVolume: number;
  registersNeeded: number;
  totalCost: number;
  placementTips: string[];
  flooringConsiderations: string[];
}

export default function HVACFloorRegisterCalculator() {
  const [results, setResults] = useState<HVACResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      ceilingHeight: 8,
      hvacType: 'forced-air',
      registerSize: '4x10',
      flooringType: 'hardwood',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const roomArea = data.roomLength * data.roomWidth;
    const roomVolume = roomArea * data.ceilingHeight;
    
    // Calculate registers needed based on room size and HVAC type
    const cfmPerSqFt = data.hvacType === 'forced-air' ? 1.5 : 1.0;
    const totalCFM = roomArea * cfmPerSqFt;
    
    const registerCFM = {
      '4x10': 75,
      '4x12': 90,
      '6x10': 110,
      '6x12': 135,
      '4x14': 105
    };

    const registersNeeded = Math.ceil(totalCFM / registerCFM[data.registerSize]);
    
    const registerCosts = {
      '4x10': 25,
      '4x12': 30,
      '6x10': 35,
      '6x12': 45,
      '4x14': 40
    };

    const totalCost = registersNeeded * registerCosts[data.registerSize];

    const placementTips = [
      'Position registers away from furniture placement areas',
      'Maintain 6-inch clearance from walls when possible',
      'Consider traffic flow patterns in register placement',
      'Place return air registers opposite supply registers'
    ];

    const flooringConsiderations = [
      'Plan register locations before flooring installation',
      'Use proper transition strips around register openings',
      'Ensure adequate support under register frames',
      'Consider floor thickness when sizing ductwork'
    ];

    setResults({
      roomVolume,
      registersNeeded,
      totalCost,
      placementTips,
      flooringConsiderations,
    });

    setIsCalculating(false);
  };

  return (
    <Calculator
      title="HVAC Floor Register Calculator"
      description="Calculate HVAC floor register requirements for optimal air circulation."
      metaTitle="HVAC Floor Register Calculator - Air Vent Calculator | FlooringCalc Pro"
      metaDescription="Calculate HVAC floor registers and air vents for proper heating and cooling. Professional HVAC register calculator."
      keywords={['HVAC register calculator', 'floor register calculator', 'air vent calculator', 'HVAC vent calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Room & HVAC Details</h4>
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
                name="registerSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Register Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4x10">4" x 10"</SelectItem>
                        <SelectItem value="4x12">4" x 12"</SelectItem>
                        <SelectItem value="6x10">6" x 10"</SelectItem>
                        <SelectItem value="6x12">6" x 12"</SelectItem>
                        <SelectItem value="4x14">4" x 14"</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate Register Requirements'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <LoadingOverlay isLoading={isCalculating} theme="concrete" variant="pattern" />
            
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">HVAC Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Registers Needed:</span>
                      <span className="font-semibold">{results.registersNeeded} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-semibold text-green-600">${results.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">🌡️</div>
                    <p className="text-sm">Enter room details to calculate</p>
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