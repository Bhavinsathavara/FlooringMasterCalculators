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
  bambooType: z.enum(['solid', 'engineered', 'strand-woven', 'click-lock']),
  plankWidth: z.enum(['3-inch', '4-inch', '5-inch', '6-inch', '7-inch']),
  plankLength: z.enum(['36-inch', '48-inch', '72-inch', 'random']),
  grade: z.enum(['select', 'natural', 'rustic']),
  finish: z.enum(['unfinished', 'pre-finished', 'hand-scraped', 'smooth']),
  installationType: z.enum(['nail-down', 'glue-down', 'floating']),
  subfloorType: z.enum(['concrete', 'plywood', 'osb', 'existing-floor']),
  includeUnderlayment: z.boolean(),
  includeMoistureBrrier: z.boolean(),
  includeTransitions: z.boolean(),
  includeMolding: z.boolean(),
  wastePercentage: z.number().min(5).max(25, 'Waste percentage must be between 5-25%'),
  roomComplexity: z.enum(['simple', 'moderate', 'complex']),
});

type FormData = z.infer<typeof formSchema>;

interface BambooResults {
  roomArea: number;
  squareFeetNeeded: number;
  boardFeetNeeded: number;
  boxes: number;
  underlaymentNeeded: number;
  moistureBarrierNeeded: number;
  transitionStrips: number;
  moldingNeeded: number;
  nailsNeeded: number;
  adhesiveNeeded: number;
  laborHours: number;
  totalMaterialCost: number;
  installationTips: string[];
  maintenanceGuide: string[];
  ecoFriendlyBenefits: string[];
  durabilityRating: string;
}

export default function BambooFlooringCalculator() {
  const [results, setResults] = useState<BambooResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      bambooType: 'engineered',
      plankWidth: '5-inch',
      plankLength: '48-inch',
      grade: 'natural',
      finish: 'pre-finished',
      installationType: 'floating',
      subfloorType: 'plywood',
      includeUnderlayment: true,
      includeMoistureBrrier: false,
      includeTransitions: false,
      includeMolding: false,
      wastePercentage: 10,
      roomComplexity: 'simple',
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const perimeter = 2 * (data.roomLength + data.roomWidth);

    // Calculate square footage with waste
    const squareFeetNeeded = roomArea * (1 + data.wastePercentage / 100);

    // Board feet calculation (varies by type)
    const boardFeetFactors = {
      'solid': 1.0,
      'engineered': 0.85,
      'strand-woven': 0.9,
      'click-lock': 0.8,
    };

    const boardFeetNeeded = squareFeetNeeded * boardFeetFactors[data.bambooType];

    // Boxes calculation (typically 20-24 sq ft per box)
    const sqFtPerBox = data.bambooType === 'solid' ? 20 : 22;
    const boxes = Math.ceil(squareFeetNeeded / sqFtPerBox);

    // Underlayment calculation
    const underlaymentNeeded = data.includeUnderlayment && data.installationType === 'floating' 
      ? Math.ceil(roomArea * 1.05) : 0;

    // Moisture barrier calculation
    const moistureBarrierNeeded = data.includeMoistureBrrier || data.subfloorType === 'concrete'
      ? Math.ceil(roomArea * 1.1) : 0;

    // Transition strips and molding
    const transitionStrips = data.includeTransitions ? Math.ceil(perimeter / 8) : 0;
    const moldingNeeded = data.includeMolding ? Math.ceil(perimeter * 0.9) : 0;

    // Fasteners calculation
    let nailsNeeded = 0;
    let adhesiveNeeded = 0;

    if (data.installationType === 'nail-down') {
      nailsNeeded = Math.ceil(squareFeetNeeded / 100); // 1 lb per 100 sq ft
    } else if (data.installationType === 'glue-down') {
      adhesiveNeeded = Math.ceil(squareFeetNeeded / 150); // 1 gallon per 150 sq ft
    }

    // Labor hours calculation
    const complexityFactors = {
      simple: 1.0,
      moderate: 1.3,
      complex: 1.6,
    };

    const installationFactors = {
      'nail-down': 1.2,
      'glue-down': 1.4,
      'floating': 1.0,
    };

    const gradeFactors = {
      'select': 1.0,
      'natural': 1.1,
      'rustic': 1.2,
    };

    const baseHours = roomArea * 0.4; // 0.4 hours per sq ft base
    const laborHours = baseHours * 
                      complexityFactors[data.roomComplexity] * 
                      installationFactors[data.installationType] *
                      gradeFactors[data.grade];

    // Cost calculations
    const bambooCosts = {
      'solid': { 'select': 6.50, 'natural': 5.50, 'rustic': 4.50 },
      'engineered': { 'select': 5.50, 'natural': 4.50, 'rustic': 3.50 },
      'strand-woven': { 'select': 7.50, 'natural': 6.50, 'rustic': 5.50 },
      'click-lock': { 'select': 4.50, 'natural': 3.50, 'rustic': 2.50 },
    };

    const bambooCost = squareFeetNeeded * bambooCosts[data.bambooType][data.grade];
    const underlaymentCost = underlaymentNeeded * 0.60; // $0.60 per sq ft
    const moistureBarrierCost = moistureBarrierNeeded * 0.40; // $0.40 per sq ft
    const transitionCost = transitionStrips * 28; // $28 per transition
    const moldingCost = moldingNeeded * 3.50; // $3.50 per linear ft
    const nailsCost = nailsNeeded * 12; // $12 per lb
    const adhesiveCost = adhesiveNeeded * 40; // $40 per gallon

    const totalMaterialCost = bambooCost + underlaymentCost + moistureBarrierCost + 
                             transitionCost + moldingCost + nailsCost + adhesiveCost;

    // Installation tips
    const installationTips: string[] = [
      'Acclimate bamboo 72 hours before installation',
      'Check moisture content - should be 6-9%',
      'Maintain 1/4" expansion gap around perimeter',
      'Bamboo is harder than most hardwoods - use proper cutting tools',
    ];

    if (data.subfloorType === 'concrete') {
      installationTips.push('Test concrete for moisture - use moisture barrier if >3 lbs/24hrs');
    }

    if (data.installationType === 'nail-down') {
      installationTips.push('Pre-drill nail holes to prevent splitting');
    }

    if (data.finish === 'unfinished') {
      installationTips.push('Sand progressively 80-100-120 grit before finishing');
    }

    // Maintenance guide
    const maintenanceGuide: string[] = [
      'Sweep or vacuum regularly with soft bristle attachment',
      'Clean with bamboo-specific cleaners only',
      'Avoid excessive moisture - mop with damp (not wet) cloth',
      'Use felt pads under furniture legs',
      'Maintain 30-50% relative humidity',
      'Refinish every 3-5 years depending on traffic',
    ];

    // Eco-friendly benefits
    const ecoFriendlyBenefits: string[] = [
      'Bamboo grows 30x faster than hardwood trees',
      'Regenerates from root system without replanting',
      'Absorbs 35% more CO2 than equivalent hardwood forests',
      'Formaldehyde-free options available',
      'Biodegradable and renewable resource',
      'Often locally sourced reducing transportation impact',
    ];

    // Durability ratings
    const durabilityRatings = {
      'solid': 'Excellent - 25+ years with proper care',
      'engineered': 'Very Good - 15-25 years',
      'strand-woven': 'Excellent - 20-30 years (hardest)',
      'click-lock': 'Good - 10-20 years',
    };

    setResults({
      roomArea,
      squareFeetNeeded,
      boardFeetNeeded,
      boxes,
      underlaymentNeeded,
      moistureBarrierNeeded,
      transitionStrips,
      moldingNeeded,
      nailsNeeded,
      adhesiveNeeded,
      laborHours,
      totalMaterialCost,
      installationTips,
      maintenanceGuide,
      ecoFriendlyBenefits,
      durabilityRating: durabilityRatings[data.bambooType],
    });
  };

  return (
    <Calculator
      title="Bamboo Flooring Calculator"
      description="Calculate bamboo flooring materials including solid, engineered, and strand-woven bamboo requirements."
      metaTitle="Bamboo Flooring Calculator - Eco-Friendly Bamboo Calculator | FlooringCalc Pro"
      metaDescription="Calculate bamboo flooring materials including solid, engineered, and strand-woven bamboo. Professional eco-friendly flooring calculator."
      keywords={['bamboo flooring calculator', 'bamboo floor calculator', 'eco-friendly flooring calculator', 'sustainable flooring calculator']}
      category="materials"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Bamboo Specifications</h4>
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
                  name="bambooType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bamboo Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bamboo type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="solid">Solid Bamboo</SelectItem>
                          <SelectItem value="engineered">Engineered Bamboo</SelectItem>
                          <SelectItem value="strand-woven">Strand-Woven Bamboo</SelectItem>
                          <SelectItem value="click-lock">Click-Lock Bamboo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="select">Select Grade</SelectItem>
                          <SelectItem value="natural">Natural Grade</SelectItem>
                          <SelectItem value="rustic">Rustic Grade</SelectItem>
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
                  name="plankWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plank Width</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select width" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3-inch">3 inches</SelectItem>
                          <SelectItem value="4-inch">4 inches</SelectItem>
                          <SelectItem value="5-inch">5 inches</SelectItem>
                          <SelectItem value="6-inch">6 inches</SelectItem>
                          <SelectItem value="7-inch">7 inches</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plankLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plank Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="36-inch">36 inches</SelectItem>
                          <SelectItem value="48-inch">48 inches</SelectItem>
                          <SelectItem value="72-inch">72 inches</SelectItem>
                          <SelectItem value="random">Random Length</SelectItem>
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
                  name="finish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finish</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unfinished">Unfinished</SelectItem>
                          <SelectItem value="pre-finished">Pre-Finished</SelectItem>
                          <SelectItem value="hand-scraped">Hand-Scraped</SelectItem>
                          <SelectItem value="smooth">Smooth</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="installationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installation Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select installation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nail-down">Nail Down</SelectItem>
                          <SelectItem value="glue-down">Glue Down</SelectItem>
                          <SelectItem value="floating">Floating Floor</SelectItem>
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
                  name="subfloorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subfloor Type</FormLabel>
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
                          <SelectItem value="existing-floor">Existing Floor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roomComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Complexity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">Simple - Rectangular</SelectItem>
                          <SelectItem value="moderate">Moderate - Some cuts</SelectItem>
                          <SelectItem value="complex">Complex - Many obstacles</SelectItem>
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
                <h5 className="font-medium text-gray-900">Additional Materials</h5>
                
                <FormField
                  control={form.control}
                  name="includeUnderlayment"
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
                      <FormLabel className="text-sm font-normal">Include underlayment</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeMoistureBrrier"
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
                  name="includeTransitions"
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
                      <FormLabel className="text-sm font-normal">Include transition strips</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeMolding"
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
                      <FormLabel className="text-sm font-normal">Include quarter round</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Bamboo Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Material Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Bamboo Flooring</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Square Feet Needed:</span>
                      <span className="font-semibold text-primary">{results.squareFeetNeeded.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Board Feet:</span>
                      <span className="font-semibold text-secondary">{results.boardFeetNeeded.toFixed(2)} bd ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Boxes to Order:</span>
                      <span className="font-semibold text-amber-600">{results.boxes} boxes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Labor Hours:</span>
                      <span className="font-semibold">{results.laborHours.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Durability:</span>
                      <span className="font-semibold text-green-600 text-sm">{results.durabilityRating}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🎋</div>
                    <p className="text-sm">Enter details to calculate bamboo</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Installation Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    {results.underlaymentNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Underlayment:</span>
                        <span className="font-semibold">{results.underlaymentNeeded} sq ft</span>
                      </div>
                    )}
                    {results.moistureBarrierNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Moisture Barrier:</span>
                        <span className="font-semibold">{results.moistureBarrierNeeded} sq ft</span>
                      </div>
                    )}
                    {results.transitionStrips > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Transitions:</span>
                        <span className="font-semibold">{results.transitionStrips} pieces</span>
                      </div>
                    )}
                    {results.moldingNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Quarter Round:</span>
                        <span className="font-semibold">{results.moldingNeeded} linear ft</span>
                      </div>
                    )}
                    {results.nailsNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Nails:</span>
                        <span className="font-semibold">{results.nailsNeeded} lbs</span>
                      </div>
                    )}
                    {results.adhesiveNeeded > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Adhesive:</span>
                        <span className="font-semibold">{results.adhesiveNeeded} gallons</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm">Installation materials will appear here</p>
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
                      ${results.totalMaterialCost.toFixed(2)}
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

            <Card className="bg-green-100">
              <CardHeader>
                <CardTitle className="text-lg">Eco-Friendly Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.ecoFriendlyBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Environmental benefits will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Installation Tips</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.installationTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Professional tips will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg">Maintenance Guide</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.maintenanceGuide.map((guide, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{guide}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Maintenance tips will appear here</p>
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