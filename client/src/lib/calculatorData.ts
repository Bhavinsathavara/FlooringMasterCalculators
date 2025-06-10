export interface CalculatorData {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'materials' | 'advanced';
  icon: string;
  color: string;
  route: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export const calculators: CalculatorData[] = [
  {
    id: 'flooring-cost',
    title: 'Flooring Cost Calculator',
    description: 'Calculate total project costs including materials, labor, and additional expenses for your flooring project.',
    category: 'basic',
    icon: 'Calculator',
    color: 'blue',
    route: '/calculator/flooring-cost',
    metaTitle: 'Flooring Cost Calculator - Free Professional Tool | FlooringCalc Pro',
    metaDescription: 'Calculate accurate flooring costs including materials, labor, and waste. Professional-grade calculator for contractors and homeowners. Get instant estimates.',
    keywords: ['flooring cost calculator', 'flooring price estimator', 'flooring budget calculator', 'flooring installation cost']
  },
  {
    id: 'square-footage',
    title: 'Square Footage Calculator',
    description: 'Calculate precise square footage for regular, irregular, and complex room shapes with our advanced measurement tool.',
    category: 'basic',
    icon: 'RulerCombined',
    color: 'green',
    route: '/calculator/square-footage',
    metaTitle: 'Square Footage Calculator - Room Area Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate room square footage for any shape - rectangular, L-shaped, circular rooms. Professional room area calculator with instant results.',
    keywords: ['square footage calculator', 'room area calculator', 'floor area calculator', 'room size calculator']
  },
  {
    id: 'waste-percentage',
    title: 'Waste Percentage Calculator',
    description: 'Calculate optimal waste percentages based on room complexity, material type, and installation method.',
    category: 'basic',
    icon: 'Percent',
    color: 'yellow',
    route: '/calculator/waste-percentage',
    metaTitle: 'Flooring Waste Calculator - Material Waste Percentage | FlooringCalc Pro',
    metaDescription: 'Calculate optimal flooring waste percentage for your project. Reduce material costs and minimize over-ordering with precise calculations.',
    keywords: ['flooring waste calculator', 'material waste percentage', 'flooring overage calculator', 'waste factor calculator']
  },
  {
    id: 'tile-calculator',
    title: 'Tile Calculator',
    description: 'Calculate tiles needed by size, grout spacing, adhesive quantity, and complex pattern layouts.',
    category: 'materials',
    icon: 'Grid',
    color: 'amber',
    route: '/calculator/tile',
    metaTitle: 'Tile Calculator - Tiles, Grout & Adhesive Calculator | FlooringCalc Pro',
    metaDescription: 'Professional tile calculator for ceramic, porcelain, and stone tiles. Calculate tiles needed, grout, and adhesive quantities with pattern support.',
    keywords: ['tile calculator', 'ceramic tile calculator', 'tile grout calculator', 'tile adhesive calculator', 'tile pattern calculator']
  },
  {
    id: 'hardwood-calculator',
    title: 'Hardwood Calculator',
    description: 'Calculate hardwood flooring needs including boards, nails, underlayment, and finishing materials.',
    category: 'materials',
    icon: 'TreePine',
    color: 'red',
    route: '/calculator/hardwood',
    metaTitle: 'Hardwood Flooring Calculator - Wood Floor Calculator | FlooringCalc Pro',
    metaDescription: 'Professional hardwood flooring calculator. Calculate solid and engineered wood flooring materials, nails, underlayment, and finishing supplies.',
    keywords: ['hardwood flooring calculator', 'wood flooring calculator', 'engineered wood calculator', 'hardwood cost calculator']
  },
  {
    id: 'vinyl-calculator',
    title: 'Vinyl Flooring Calculator',
    description: 'Calculate vinyl flooring requirements for luxury vinyl tile, sheet vinyl, and plank installations.',
    category: 'materials',
    icon: 'Layers',
    color: 'purple',
    route: '/calculator/vinyl',
    metaTitle: 'Vinyl Flooring Calculator - LVT & LVP Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate luxury vinyl tile (LVT), vinyl plank (LVP), and sheet vinyl flooring requirements. Professional vinyl flooring calculator.',
    keywords: ['vinyl flooring calculator', 'LVT calculator', 'luxury vinyl calculator', 'vinyl plank calculator', 'sheet vinyl calculator']
  },
];

export const getCalculatorByRoute = (route: string): CalculatorData | undefined => {
  return calculators.find(calc => calc.route === route);
};

export const getCalculatorsByCategory = (category: string): CalculatorData[] => {
  if (category === 'all') return calculators;
  return calculators.filter(calc => calc.category === category);
};
