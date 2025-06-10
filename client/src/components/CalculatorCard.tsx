import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Calculator, Ruler, Wrench, Percent, Package, Users, Home,
  Grid, Droplets, Grid3x3, Puzzle, Mountain, Gem, Square, TreePine, Layers2, 
  FileImage, Grid2x2, Expand, Layers, ScrollText, Leaf, Waves, Paintbrush, Building,
  Car, Dumbbell, TreeDeciduous, Trees, RotateCcw, Layers3, SquareStack, Shield,
  RectangleHorizontal, CornerUpLeft, Circle, Building2
} from 'lucide-react';
import { Link } from 'wouter';
import type { CalculatorData } from '@/lib/calculatorData';

interface CalculatorCardProps {
  calculator: CalculatorData;
}

const iconComponents = {
  Calculator,
  Ruler,
  Wrench,
  Percent,
  Package,
  Users,
  Home,
  Grid,
  Droplets,
  Grid3x3,
  Puzzle,
  Mountain,
  Gem,
  Square,
  TreePine,
  Layers2,
  FileImage,
  Grid2x2,
  Expand,
  Layers,
  ScrollText,
  Leaf,
  Waves,
  Paintbrush,
  Building,
  Car,
  Dumbbell,
  TreeDeciduous,
  Trees,
  RotateCcw,
  Layers3,
  SquareStack,
  Shield,
  RectangleHorizontal,
  CornerUpLeft,
  Circle,
  Building2,
};

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  teal: 'bg-teal-100 text-teal-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  slate: 'bg-slate-100 text-slate-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  gray: 'bg-gray-100 text-gray-600',
  violet: 'bg-violet-100 text-violet-600',
  stone: 'bg-stone-100 text-stone-600',
  rose: 'bg-rose-100 text-rose-600',
  neutral: 'bg-neutral-100 text-neutral-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  lime: 'bg-lime-100 text-lime-600',
  pink: 'bg-pink-100 text-pink-600',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-600',
  brown: 'bg-yellow-100 text-yellow-800',
  zinc: 'bg-zinc-100 text-zinc-600',
  sky: 'bg-sky-100 text-sky-600',
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
