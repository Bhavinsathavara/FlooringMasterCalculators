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
  flooringType: z.enum(['tile', 'hardwood', 'vinyl', 'laminate', 'carpet', 'stone', 'concrete']),
  installationComplexity: z.enum(['basic', 'standard', 'complex', 'premium']),
  projectTimeline: z.enum(['standard', 'rush', 'weekend']),
  crewSize: z.enum(['1-person', '2-person', '3-person', 'crew']),
  region: z.enum(['rural', 'suburban', 'urban', 'metro']),
  experienceLevel: z.enum(['apprentice', 'journeyman', 'master', 'specialist']),
});

type FormData = z.infer<typeof formSchema>;

interface LaborResults {
  roomArea: number;
  baseHourlyRate: number;
  hoursRequired: number;
  complexityMultiplier: number;
  timelineMultiplier: number;
  crewMultiplier: number;
  regionMultiplier: number;
  experienceMultiplier: number;
  subtotal: number;
  totalLaborCost: number;
  costPerSqFt: number;
  recommendedDuration: string;
}

export default function LaborCostCalculator() {
  const [results, setResults] = useState<LaborResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      flooringType: 'tile',
      installationComplexity: 'standard',
      projectTimeline: 'standard',
      crewSize: '2-person',
      region: 'suburban',
      experienceLevel: 'journeyman',
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    
    // Base hourly rates by experience level
    const baseHourlyRates = {
      apprentice: 25,
      journeyman: 45,
      master: 65,
      specialist: 85,
    };

    // Hours required per sq ft by flooring type
    const hoursPerSqFt = {
      tile: 0.45,
      hardwood: 0.35,
      vinyl: 0.25,
      laminate: 0.20,
      carpet: 0.15,
      stone: 0.60,
      concrete: 0.30,
    };

    // Complexity multipliers
    const complexityMultipliers = {
      basic: 0.8,
      standard: 1.0,
      complex: 1.4,
      premium: 1.8,
    };

    // Timeline multipliers
    const timelineMultipliers = {
      standard: 1.0,
      rush: 1.5,
      weekend: 1.3,
    };

    // Crew size multipliers
    const crewMultipliers = {
      '1-person': 1.0,
      '2-person': 0.85,
      '3-person': 0.75,
      'crew': 0.70,
    };

    // Regional cost multipliers
    const regionMultipliers = {
      rural: 0.75,
      suburban: 1.0,
      urban: 1.25,
      metro: 1.6,
    };

    // Experience multipliers
    const experienceMultipliers = {
      apprentice: 0.8,
      journeyman: 1.0,
      master: 1.3,
      specialist: 1.6,
    };

    const baseHourlyRate = baseHourlyRates[data.experienceLevel];
    const hoursRequired = roomArea * hoursPerSqFt[data.flooringType];
    const complexityMultiplier = complexityMultipliers[data.installationComplexity];
    const timelineMultiplier = timelineMultipliers[data.projectTimeline];
    const crewMultiplier = crewMultipliers[data.crewSize];
    const regionMultiplier = regionMultipliers[data.region];
    const experienceMultiplier = experienceMultipliers[data.experienceLevel];

    const adjustedHours = hoursRequired * complexityMultiplier;
    const subtotal = adjustedHours * baseHourlyRate;
    const totalLaborCost = subtotal * timelineMultiplier * crewMultiplier * regionMultiplier;
    const costPerSqFt = totalLaborCost / roomArea;

    // Estimate project duration
    const workingHoursPerDay = 8;
    const crewSizes = { '1-person': 1, '2-person': 2, '3-person': 3, 'crew': 4 };
    const effectiveHoursPerDay = workingHoursPerDay * crewSizes[data.crewSize] * crewMultiplier;
    const daysRequired = Math.ceil(adjustedHours / effectiveHoursPerDay);
    
    let recommendedDuration = '';
    if (daysRequired <= 1) {
      recommendedDuration = '1 day';
    } else if (daysRequired <= 3) {
      recommendedDuration = `${daysRequired} days`;
    } else {
      const weeks = Math.ceil(daysRequired / 5);
      recommendedDuration = `${weeks} week${weeks > 1 ? 's' : ''}`;
    }

    setResults({
      roomArea,
      baseHourlyRate,
      hoursRequired: adjustedHours,
      complexityMultiplier,
      timelineMultiplier,
      crewMultiplier,
      regionMultiplier,
      experienceMultiplier,
      subtotal,
      totalLaborCost,
      costPerSqFt,
      recommendedDuration,
    });
  };

  return (
    <Calculator
      title="Flooring Labor Cost Calculator"
      description="Calculate labor costs for flooring installation based on project complexity and regional rates."
      metaTitle="Flooring Labor Cost Calculator - Installation Labor Estimator | FlooringCalc Pro"
      metaDescription="Calculate accurate flooring labor costs. Professional labor cost estimator for contractors and homeowners planning flooring projects."
      keywords={['flooring labor cost', 'installation labor calculator', 'contractor cost estimator', 'flooring labor rates']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Labor Requirements</h4>
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
                        <SelectItem value="tile">Ceramic/Porcelain Tile</SelectItem>
                        <SelectItem value="hardwood">Hardwood Flooring</SelectItem>
                        <SelectItem value="vinyl">Vinyl Flooring</SelectItem>
                        <SelectItem value="laminate">Laminate Flooring</SelectItem>
                        <SelectItem value="carpet">Carpet</SelectItem>
                        <SelectItem value="stone">Natural Stone</SelectItem>
                        <SelectItem value="concrete">Polished Concrete</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installationComplexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Complexity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic - Simple rectangular layout</SelectItem>
                        <SelectItem value="standard">Standard - Few obstacles, standard cuts</SelectItem>
                        <SelectItem value="complex">Complex - Multiple rooms, intricate cuts</SelectItem>
                        <SelectItem value="premium">Premium - Custom patterns, high-end finish</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectTimeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard Schedule</SelectItem>
                          <SelectItem value="rush">Rush Job (+50%)</SelectItem>
                          <SelectItem value="weekend">Weekend Work (+30%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crewSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crew Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crew size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-person">1 Person</SelectItem>
                          <SelectItem value="2-person">2 Person Team</SelectItem>
                          <SelectItem value="3-person">3 Person Team</SelectItem>
                          <SelectItem value="crew">4+ Person Crew</SelectItem>
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
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rural">Rural Area</SelectItem>
                          <SelectItem value="suburban">Suburban</SelectItem>
                          <SelectItem value="urban">Urban</SelectItem>
                          <SelectItem value="metro">Major Metro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installer Experience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apprentice">Apprentice</SelectItem>
                          <SelectItem value="journeyman">Journeyman</SelectItem>
                          <SelectItem value="master">Master Craftsman</SelectItem>
                          <SelectItem value="specialist">Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Labor Costs
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Labor Cost Analysis</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Hours Required:</span>
                      <span className="font-semibold">{results.hoursRequired.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimated Duration:</span>
                      <span className="font-semibold text-primary">{results.recommendedDuration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Base Hourly Rate:</span>
                      <span className="font-semibold">${results.baseHourlyRate}/hour</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">⏱️</div>
                    <p className="text-sm">Enter details to see project overview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Cost Multipliers</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Complexity:</span>
                      <span className="text-sm font-medium">{results.complexityMultiplier}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Timeline:</span>
                      <span className="text-sm font-medium">{results.timelineMultiplier}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crew Efficiency:</span>
                      <span className="text-sm font-medium">{results.crewMultiplier}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Regional:</span>
                      <span className="text-sm font-medium">{results.regionMultiplier}x</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Multipliers will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary text-white">
              <CardContent className="p-6">
                {results ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      ${results.totalLaborCost.toFixed(2)}
                    </div>
                    <p className="text-blue-100 mb-3">Total Labor Cost</p>
                    <div className="text-lg">
                      ${results.costPerSqFt.toFixed(2)} per sq ft
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-blue-100">Labor cost will appear here</p>
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