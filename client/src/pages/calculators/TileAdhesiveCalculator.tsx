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
  tileLength: z.number().min(0.1, 'Tile length must be greater than 0'),
  tileWidth: z.number().min(0.1, 'Tile width must be greater than 0'),
  tileType: z.enum(['ceramic', 'porcelain', 'natural-stone', 'glass', 'metal']),
  adhesiveType: z.enum(['standard', 'premium', 'epoxy', 'rapid-set']),
  substrateType: z.enum(['concrete', 'plywood', 'cement-board', 'existing-tile', 'drywall']),
  tileThickness: z.number().min(1).max(50, 'Tile thickness must be between 1-50mm'),
  applicationMethod: z.enum(['trowel', 'back-butter', 'full-coverage']),
  wastePercentage: z.number().min(0).max(30, 'Waste percentage must be between 0-30%'),
});

type FormData = z.infer<typeof formSchema>;

interface AdhesiveResults {
  roomArea: number;
  tileArea: number;
  tilesNeeded: number;
  coverageRate: number;
  adhesiveNeeded: number;
  adhesiveWithWaste: number;
  totalCost: number;
  applicationTips: string[];
  coverageFactors: { [key: string]: number };
}

export default function TileAdhesiveCalculator() {
  const [results, setResults] = useState<AdhesiveResults | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: 0,
      roomWidth: 0,
      tileLength: 12,
      tileWidth: 12,
      tileType: 'ceramic',
      adhesiveType: 'standard',
      substrateType: 'concrete',
      tileThickness: 8,
      applicationMethod: 'trowel',
      wastePercentage: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const roomArea = data.roomLength * data.roomWidth;
    const tileArea = (data.tileLength / 12) * (data.tileWidth / 12);
    const tilesNeeded = Math.ceil(roomArea / tileArea);

    // Base coverage rates (sq ft per gallon)
    const baseCoverageRates = {
      'standard': 60,
      'premium': 55,
      'epoxy': 45,
      'rapid-set': 50,
    };

    // Tile type multipliers
    const tileMultipliers = {
      'ceramic': 1.0,
      'porcelain': 0.9,
      'natural-stone': 0.8,
      'glass': 1.1,
      'metal': 1.0,
    };

    // Substrate multipliers
    const substrateMultipliers = {
      'concrete': 1.0,
      'plywood': 1.2,
      'cement-board': 1.1,
      'existing-tile': 1.3,
      'drywall': 1.4,
    };

    // Application method multipliers
    const methodMultipliers = {
      'trowel': 1.0,
      'back-butter': 1.5,
      'full-coverage': 1.8,
    };

    // Thickness factor (more adhesive for thicker tiles)
    const thicknessFactor = Math.max(1.0, data.tileThickness / 8);

    const coverageRate = baseCoverageRates[data.adhesiveType] * 
                        tileMultipliers[data.tileType] * 
                        substrateMultipliers[data.substrateType] * 
                        methodMultipliers[data.applicationMethod] / 
                        thicknessFactor;

    const adhesiveNeeded = roomArea / coverageRate;
    const adhesiveWithWaste = adhesiveNeeded * (1 + data.wastePercentage / 100);

    // Cost estimation (per gallon)
    const adhesiveCosts = {
      'standard': 35,
      'premium': 50,
      'epoxy': 75,
      'rapid-set': 45,
    };

    const totalCost = Math.ceil(adhesiveWithWaste) * adhesiveCosts[data.adhesiveType];

    // Application tips based on selections
    const applicationTips: string[] = [];
    
    if (data.tileType === 'natural-stone') {
      applicationTips.push('Use white adhesive to prevent staining light-colored stone');
    }
    if (data.tileType === 'porcelain') {
      applicationTips.push('Use premium adhesive for better bond with dense porcelain');
    }
    if (data.applicationMethod === 'back-butter') {
      applicationTips.push('Apply adhesive to both tile back and substrate for maximum bond');
    }
    if (data.substrateType === 'plywood') {
      applicationTips.push('Prime plywood substrate before adhesive application');
    }
    if (data.adhesiveType === 'rapid-set') {
      applicationTips.push('Work in small sections - rapid-set adhesive cures quickly');
    }

    applicationTips.push('Allow adhesive to cure for 24-48 hours before grouting');
    applicationTips.push('Check manufacturer specifications for trowel notch size');

    const coverageFactors = {
      'Tile Type': tileMultipliers[data.tileType],
      'Substrate': substrateMultipliers[data.substrateType],
      'Application': methodMultipliers[data.applicationMethod],
      'Thickness': 1 / thicknessFactor,
    };

    setResults({
      roomArea,
      tileArea,
      tilesNeeded,
      coverageRate,
      adhesiveNeeded,
      adhesiveWithWaste,
      totalCost,
      applicationTips,
      coverageFactors,
    });
  };

  return (
    <Calculator
      title="Tile Adhesive Calculator"
      description="Calculate adhesive quantities for ceramic, porcelain, and stone tile installations."
      metaTitle="Tile Adhesive Calculator - Tile Glue Quantity Estimator | FlooringCalc Pro"
      metaDescription="Calculate tile adhesive quantities needed for ceramic, porcelain, and stone tiles. Professional adhesive calculator with coverage rates."
      keywords={['tile adhesive calculator', 'tile glue calculator', 'ceramic tile adhesive', 'tile mortar calculator']}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Project Specifications</h4>
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
                  name="tileLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Length (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="12"
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
                  name="tileWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Width (inches)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="12"
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
                name="tileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tile Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tile type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ceramic">Ceramic Tile</SelectItem>
                        <SelectItem value="porcelain">Porcelain Tile</SelectItem>
                        <SelectItem value="natural-stone">Natural Stone</SelectItem>
                        <SelectItem value="glass">Glass Tile</SelectItem>
                        <SelectItem value="metal">Metal Tile</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adhesiveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adhesive Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select adhesive type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard Adhesive</SelectItem>
                        <SelectItem value="premium">Premium Adhesive</SelectItem>
                        <SelectItem value="epoxy">Epoxy Adhesive</SelectItem>
                        <SelectItem value="rapid-set">Rapid Set</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="substrateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Substrate</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select substrate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete</SelectItem>
                          <SelectItem value="plywood">Plywood</SelectItem>
                          <SelectItem value="cement-board">Cement Board</SelectItem>
                          <SelectItem value="existing-tile">Existing Tile</SelectItem>
                          <SelectItem value="drywall">Drywall</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tileThickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Thickness (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="8"
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
                  name="applicationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trowel">Trowel Only</SelectItem>
                          <SelectItem value="back-butter">Back Buttering</SelectItem>
                          <SelectItem value="full-coverage">Full Coverage</SelectItem>
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
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700">
                Calculate Adhesive Requirements
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Adhesive Requirements</h4>
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Room Area:</span>
                      <span className="font-semibold">{results.roomArea.toFixed(2)} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Coverage Rate:</span>
                      <span className="font-semibold">{results.coverageRate.toFixed(1)} sq ft/gal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Base Adhesive:</span>
                      <span className="font-semibold text-primary">{results.adhesiveNeeded.toFixed(2)} gallons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">With Waste:</span>
                      <span className="font-semibold text-secondary">{Math.ceil(results.adhesiveWithWaste)} gallons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tiles Needed:</span>
                      <span className="font-semibold">{results.tilesNeeded} tiles</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <div className="text-3xl mb-2">🧪</div>
                    <p className="text-sm">Enter details to calculate adhesive</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Coverage Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(results.coverageFactors).map(([factor, value]) => (
                      <div key={factor} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{factor}:</span>
                        <span className="text-sm font-semibold">{value.toFixed(2)}x</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${results.totalCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Total Adhesive Cost</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm">Cost estimate will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <ul className="space-y-2">
                    {results.applicationTips.map((tip, index) => (
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
          </div>
        </div>
      </div>
    </Calculator>
  );
}