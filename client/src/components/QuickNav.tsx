import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';

const popularCalculators = [
  { name: 'Flooring Cost', href: '/calculator/flooring-cost', icon: '💰', description: 'Calculate total project costs' },
  { name: 'Square Footage', href: '/calculator/square-footage', icon: '📐', description: 'Measure room areas' },
  { name: 'Tile Calculator', href: '/calculator/tile', icon: '🏛️', description: 'Tiles and materials needed' },
  { name: 'Hardwood', href: '/calculator/hardwood', icon: '🪵', description: 'Wood flooring estimates' },
  { name: 'Laminate', href: '/calculator/laminate', icon: '🏠', description: 'Laminate flooring plans' },
  { name: 'Vinyl', href: '/calculator/vinyl', icon: '📱', description: 'Vinyl flooring calculations' },
  { name: 'Carpet', href: '/calculator/carpet', icon: '🧸', description: 'Carpet material estimates' },
  { name: 'Baseboard Trim', href: '/calculator/baseboard', icon: '📏', description: 'Trim and molding lengths' },
];

export default function QuickNav() {
  return (
    <Card className="mb-8 bg-white shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Popular Calculators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {popularCalculators.map((calc) => (
            <Link key={calc.name} href={calc.href} className="group block">
              <div className="bg-gray-50 p-3 rounded-lg hover:bg-blue-50 hover:border-primary border border-transparent transition-all text-center">
                <div className="text-lg mb-1">{calc.icon}</div>
                <h3 className="font-medium text-xs text-gray-900 group-hover:text-primary leading-tight">{calc.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}