import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, Combine, Percent, Grid, TreePine, Layers } from 'lucide-react';
import { Link } from 'wouter';
import type { CalculatorData } from '@/lib/calculatorData';

interface CalculatorCardProps {
  calculator: CalculatorData;
}

const iconComponents = {
  Calculator,
  Combine,
  Percent,
  Grid,
  TreePine,
  Layers,
};

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  const IconComponent = iconComponents[calculator.icon as keyof typeof iconComponents] || Calculator;
  const colorClass = colorClasses[calculator.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Card className="calculator-card bg-white shadow-lg border border-gray-200 fade-in hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg mr-4 ${colorClass}`}>
            <IconComponent size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{calculator.title}</h3>
            <p className="text-gray-600 text-sm">Professional calculation tool</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6 min-h-[3rem]">{calculator.description}</p>
        <Link href={calculator.route}>
          <Button className="w-full bg-primary text-white hover:bg-blue-700 transition-colors">
            <ArrowRight className="mr-2" size={16} />
            Use Calculator
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
