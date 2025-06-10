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
  // Basic Calculations
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
    icon: 'Ruler',
    color: 'green',
    route: '/calculator/square-footage',
    metaTitle: 'Square Footage Calculator - Room Area Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate room square footage for any shape - rectangular, L-shaped, circular rooms. Professional room area calculator with instant results.',
    keywords: ['square footage calculator', 'room area calculator', 'floor area calculator', 'room size calculator']
  },
  {
    id: 'installation-cost',
    title: 'Installation Cost Estimator',
    description: 'Estimate professional installation costs based on flooring type, room complexity, and local labor rates.',
    category: 'basic',
    icon: 'Wrench',
    color: 'orange',
    route: '/calculator/installation-cost',
    metaTitle: 'Flooring Installation Cost Estimator - Labor Cost Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate flooring installation costs with professional labor rates. Get accurate estimates for tile, hardwood, vinyl, and carpet installation.',
    keywords: ['flooring installation cost', 'installation cost estimator', 'labor cost calculator', 'flooring contractor cost']
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
    id: 'material-quantity',
    title: 'Material Quantity Calculator',
    description: 'Calculate exact quantities of flooring materials needed including adhesives, underlayment, and trim.',
    category: 'basic',
    icon: 'Package',
    color: 'teal',
    route: '/calculator/material-quantity',
    metaTitle: 'Flooring Material Quantity Calculator - Material Estimator | FlooringCalc Pro',
    metaDescription: 'Calculate exact flooring material quantities needed. Professional material estimator for adhesives, underlayment, trim, and transition strips.',
    keywords: ['material quantity calculator', 'flooring material estimator', 'flooring supplies calculator', 'material planning tool']
  },
  {
    id: 'labor-cost',
    title: 'Labor Cost Calculator',
    description: 'Calculate labor costs for flooring installation based on project complexity and regional rates.',
    category: 'basic',
    icon: 'Users',
    color: 'indigo',
    route: '/calculator/labor-cost',
    metaTitle: 'Flooring Labor Cost Calculator - Installation Labor Estimator | FlooringCalc Pro',
    metaDescription: 'Calculate accurate flooring labor costs. Professional labor cost estimator for contractors and homeowners planning flooring projects.',
    keywords: ['flooring labor cost', 'installation labor calculator', 'contractor cost estimator', 'flooring labor rates']
  },
  {
    id: 'room-area-irregular',
    title: 'Room Area Calculator',
    description: 'Calculate area for irregular and regular room shapes including L-shaped, curved, and multi-room layouts.',
    category: 'basic',
    icon: 'Home',
    color: 'slate',
    route: '/calculator/room-area',
    metaTitle: 'Room Area Calculator - Irregular & Regular Shapes | FlooringCalc Pro',
    metaDescription: 'Calculate room area for any shape - irregular, L-shaped, curved rooms. Professional room area calculator with complex shape support.',
    keywords: ['room area calculator', 'irregular room calculator', 'L-shaped room calculator', 'curved room area']
  },

  // Tile & Stone Materials
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
    id: 'tile-adhesive',
    title: 'Tile Adhesive Calculator',
    description: 'Calculate adhesive quantities for ceramic, porcelain, and stone tile installations.',
    category: 'materials',
    icon: 'Droplets',
    color: 'cyan',
    route: '/calculator/tile-adhesive',
    metaTitle: 'Tile Adhesive Calculator - Tile Glue Quantity Estimator | FlooringCalc Pro',
    metaDescription: 'Calculate tile adhesive quantities needed for ceramic, porcelain, and stone tiles. Professional adhesive calculator with coverage rates.',
    keywords: ['tile adhesive calculator', 'tile glue calculator', 'ceramic tile adhesive', 'tile mortar calculator']
  },
  {
    id: 'tile-grout',
    title: 'Tile Grout Calculator',
    description: 'Calculate grout quantities based on tile size, grout joint width, and installation area.',
    category: 'materials',
    icon: 'Grid3x3',
    color: 'gray',
    route: '/calculator/tile-grout',
    metaTitle: 'Tile Grout Calculator - Grout Quantity Estimator | FlooringCalc Pro',
    metaDescription: 'Calculate tile grout quantities needed based on tile size and grout joint width. Professional grout calculator for any tile project.',
    keywords: ['tile grout calculator', 'grout quantity calculator', 'tile grout estimator', 'ceramic tile grout']
  },
  {
    id: 'tile-pattern',
    title: 'Tile Pattern Calculator',
    description: 'Calculate materials for complex tile patterns including herringbone, chevron, and basketweave layouts.',
    category: 'materials',
    icon: 'Puzzle',
    color: 'violet',
    route: '/calculator/tile-pattern',
    metaTitle: 'Tile Pattern Calculator - Herringbone & Pattern Layout | FlooringCalc Pro',
    metaDescription: 'Calculate tile quantities for complex patterns like herringbone, chevron, and basketweave. Professional pattern layout calculator.',
    keywords: ['tile pattern calculator', 'herringbone tile calculator', 'chevron tile calculator', 'tile layout calculator']
  },
  {
    id: 'stone-flooring',
    title: 'Stone Flooring Calculator',
    description: 'Calculate natural stone flooring requirements including travertine, slate, and granite tiles.',
    category: 'materials',
    icon: 'Mountain',
    color: 'stone',
    route: '/calculator/stone-flooring',
    metaTitle: 'Stone Flooring Calculator - Natural Stone Tile Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate natural stone flooring materials including travertine, slate, granite, and marble tiles. Professional stone flooring calculator.',
    keywords: ['stone flooring calculator', 'natural stone calculator', 'travertine calculator', 'slate flooring calculator']
  },
  {
    id: 'marble-tile',
    title: 'Marble Tile Calculator',
    description: 'Calculate marble tile quantities, cutting waste, and installation materials for luxury marble floors.',
    category: 'materials',
    icon: 'Gem',
    color: 'rose',
    route: '/calculator/marble-tile',
    metaTitle: 'Marble Tile Calculator - Luxury Marble Flooring Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate marble tile quantities and installation materials. Professional marble flooring calculator with cutting waste and luxury installation estimates.',
    keywords: ['marble tile calculator', 'marble flooring calculator', 'luxury tile calculator', 'marble installation calculator']
  },
  {
    id: 'granite-slab',
    title: 'Granite Slab Calculator',
    description: 'Calculate granite slab requirements for flooring with precise measurements and waste factors.',
    category: 'materials',
    icon: 'Square',
    color: 'neutral',
    route: '/calculator/granite-slab',
    metaTitle: 'Granite Slab Calculator - Granite Flooring Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate granite slab requirements for flooring projects. Professional granite calculator with precise measurements and cutting waste factors.',
    keywords: ['granite slab calculator', 'granite flooring calculator', 'granite tile calculator', 'stone slab calculator']
  },

  // Wood Flooring
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
    id: 'engineered-wood',
    title: 'Engineered Wood Calculator',
    description: 'Calculate engineered wood flooring requirements with click-lock and glue-down installation options.',
    category: 'materials',
    icon: 'Layers2',
    color: 'amber',
    route: '/calculator/engineered-wood',
    metaTitle: 'Engineered Wood Calculator - Engineered Hardwood Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate engineered wood flooring materials for click-lock and glue-down installations. Professional engineered hardwood calculator.',
    keywords: ['engineered wood calculator', 'engineered hardwood calculator', 'click-lock flooring calculator', 'engineered plank calculator']
  },
  {
    id: 'laminate-flooring',
    title: 'Laminate Calculator',
    description: 'Calculate laminate flooring materials including planks, underlayment, and transition strips.',
    category: 'materials',
    icon: 'FileImage',
    color: 'orange',
    route: '/calculator/laminate',
    metaTitle: 'Laminate Flooring Calculator - Laminate Plank Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate laminate flooring materials including planks, underlayment, and transitions. Professional laminate flooring calculator.',
    keywords: ['laminate flooring calculator', 'laminate plank calculator', 'laminate installation calculator', 'floating floor calculator']
  },
  {
    id: 'parquet-layout',
    title: 'Parquet Layout Calculator',
    description: 'Calculate parquet flooring patterns and material requirements for intricate wood floor designs.',
    category: 'materials',
    icon: 'Grid2x2',
    color: 'brown',
    route: '/calculator/parquet',
    metaTitle: 'Parquet Flooring Calculator - Parquet Pattern Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate parquet flooring materials and patterns. Professional parquet layout calculator for intricate wood floor designs.',
    keywords: ['parquet flooring calculator', 'parquet pattern calculator', 'wood parquet calculator', 'parquet layout calculator']
  },
  {
    id: 'floating-floor-gap',
    title: 'Floating Floor Gap Calculator',
    description: 'Calculate expansion gaps and clearances required for floating floor installations.',
    category: 'advanced',
    icon: 'Expand',
    color: 'sky',
    route: '/calculator/floating-floor-gap',
    metaTitle: 'Floating Floor Gap Calculator - Expansion Gap Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate expansion gaps for floating floors. Professional gap calculator for laminate, engineered wood, and vinyl floating installations.',
    keywords: ['floating floor gap calculator', 'expansion gap calculator', 'floor expansion calculator', 'floating floor clearance']
  },

  // Vinyl & Resilient
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
  {
    id: 'sheet-vinyl-roll',
    title: 'Sheet Vinyl Calculator',
    description: 'Calculate sheet vinyl roll requirements with seam planning and waste minimization.',
    category: 'materials',
    icon: 'ScrollText',
    color: 'emerald',
    route: '/calculator/sheet-vinyl',
    metaTitle: 'Sheet Vinyl Calculator - Vinyl Roll Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate sheet vinyl roll requirements with seam planning. Professional sheet vinyl calculator for roll goods and waste minimization.',
    keywords: ['sheet vinyl calculator', 'vinyl roll calculator', 'sheet vinyl roll calculator', 'vinyl sheet estimator']
  },
  {
    id: 'linoleum-tile',
    title: 'Linoleum Calculator',
    description: 'Calculate linoleum tile and sheet requirements for eco-friendly flooring installations.',
    category: 'materials',
    icon: 'Leaf',
    color: 'lime',
    route: '/calculator/linoleum',
    metaTitle: 'Linoleum Calculator - Linoleum Tile & Sheet Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate linoleum tile and sheet requirements. Professional linoleum calculator for eco-friendly flooring installations.',
    keywords: ['linoleum calculator', 'linoleum tile calculator', 'linoleum sheet calculator', 'eco flooring calculator']
  },

  // Carpet & Soft Flooring
  {
    id: 'carpet-flooring',
    title: 'Carpet Calculator',
    description: 'Calculate carpet requirements including padding, tack strips, and installation materials.',
    category: 'materials',
    icon: 'Waves',
    color: 'pink',
    route: '/calculator/carpet',
    metaTitle: 'Carpet Calculator - Carpet & Padding Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate carpet requirements including padding, tack strips, and installation materials. Professional carpet flooring calculator.',
    keywords: ['carpet calculator', 'carpet flooring calculator', 'carpet padding calculator', 'carpet installation calculator']
  },
  {
    id: 'area-rug-size',
    title: 'Area Rug Calculator',
    description: 'Calculate optimal area rug sizes for different room layouts and furniture arrangements.',
    category: 'materials',
    icon: 'Square',
    color: 'fuchsia',
    route: '/calculator/area-rug',
    metaTitle: 'Area Rug Size Calculator - Rug Size Guide | FlooringCalc Pro',
    metaDescription: 'Calculate optimal area rug sizes for any room layout. Professional rug size calculator with furniture placement guidelines.',
    keywords: ['area rug calculator', 'rug size calculator', 'area rug size guide', 'room rug calculator']
  },

  // Specialty & Commercial
  {
    id: 'epoxy-flooring',
    title: 'Epoxy Coverage Calculator',
    description: 'Calculate epoxy flooring coverage for garage floors, basements, and commercial applications.',
    category: 'advanced',
    icon: 'Paintbrush',
    color: 'blue',
    route: '/calculator/epoxy',
    metaTitle: 'Epoxy Flooring Calculator - Epoxy Coverage Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate epoxy flooring coverage for garage floors and commercial spaces. Professional epoxy coating calculator with primer and topcoat estimates.',
    keywords: ['epoxy flooring calculator', 'epoxy coverage calculator', 'garage floor epoxy calculator', 'epoxy coating calculator']
  },
  {
    id: 'concrete-flooring',
    title: 'Concrete Floor Calculator',
    description: 'Calculate concrete flooring costs including polishing, staining, and sealing materials.',
    category: 'advanced',
    icon: 'Building',
    color: 'stone',
    route: '/calculator/concrete',
    metaTitle: 'Concrete Flooring Calculator - Polished Concrete Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate concrete flooring costs including polishing, staining, and sealing. Professional concrete floor calculator for commercial and residential projects.',
    keywords: ['concrete flooring calculator', 'polished concrete calculator', 'concrete floor cost calculator', 'stained concrete calculator']
  },
  {
    id: 'garage-floor-coating',
    title: 'Garage Floor Calculator',
    description: 'Calculate garage floor coating materials including epoxy, polyurea, and polyaspartic systems.',
    category: 'advanced',
    icon: 'Car',
    color: 'zinc',
    route: '/calculator/garage-floor',
    metaTitle: 'Garage Floor Calculator - Garage Coating Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate garage floor coating materials for epoxy, polyurea, and polyaspartic systems. Professional garage floor calculator.',
    keywords: ['garage floor calculator', 'garage coating calculator', 'garage floor epoxy calculator', 'garage flooring calculator']
  },
  {
    id: 'rubber-gym-flooring',
    title: 'Rubber Flooring Calculator',
    description: 'Calculate rubber flooring for gyms, playgrounds, and commercial fitness facilities.',
    category: 'advanced',
    icon: 'Dumbbell',
    color: 'red',
    route: '/calculator/rubber-flooring',
    metaTitle: 'Rubber Flooring Calculator - Gym & Fitness Floor Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate rubber flooring for gyms, fitness centers, and playgrounds. Professional rubber flooring calculator with thickness and density options.',
    keywords: ['rubber flooring calculator', 'gym flooring calculator', 'fitness flooring calculator', 'rubber mat calculator']
  },
  {
    id: 'cork-flooring',
    title: 'Cork Flooring Calculator',
    description: 'Calculate cork flooring materials for eco-friendly and sustainable flooring installations.',
    category: 'materials',
    icon: 'TreeDeciduous',
    color: 'yellow',
    route: '/calculator/cork',
    metaTitle: 'Cork Flooring Calculator - Eco-Friendly Floor Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate cork flooring materials for sustainable installations. Professional cork flooring calculator for eco-friendly flooring projects.',
    keywords: ['cork flooring calculator', 'eco flooring calculator', 'sustainable flooring calculator', 'cork tile calculator']
  },
  {
    id: 'bamboo-flooring',
    title: 'Bamboo Flooring Calculator',
    description: 'Calculate bamboo flooring requirements for sustainable and durable floor installations.',
    category: 'materials',
    icon: 'Trees',
    color: 'green',
    route: '/calculator/bamboo',
    metaTitle: 'Bamboo Flooring Calculator - Sustainable Floor Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate bamboo flooring materials for sustainable installations. Professional bamboo flooring calculator with strand woven and engineered options.',
    keywords: ['bamboo flooring calculator', 'bamboo floor calculator', 'sustainable bamboo calculator', 'strand woven bamboo calculator']
  },

  // Installation & Accessories
  {
    id: 'baseboard-trim',
    title: 'Baseboard & Trim Calculator',
    description: 'Calculate baseboard, quarter round, and trim lengths needed for flooring installations.',
    category: 'advanced',
    icon: 'Ruler',
    color: 'slate',
    route: '/calculator/baseboard-trim',
    metaTitle: 'Baseboard Calculator - Trim & Molding Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate baseboard, quarter round, and trim lengths for flooring projects. Professional trim calculator with miter cuts and waste factors.',
    keywords: ['baseboard calculator', 'trim calculator', 'molding calculator', 'quarter round calculator']
  },
  {
    id: 'floor-leveling',
    title: 'Floor Leveling Calculator',
    description: 'Calculate self-leveling compound quantities needed to level subfloors before installation.',
    category: 'advanced',
    icon: 'RotateCcw',
    color: 'orange',
    route: '/calculator/floor-leveling',
    metaTitle: 'Floor Leveling Calculator - Self Leveling Compound Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate self-leveling compound quantities for subfloor preparation. Professional floor leveling calculator with coverage rates.',
    keywords: ['floor leveling calculator', 'self leveling compound calculator', 'subfloor leveling calculator', 'floor prep calculator']
  },
  {
    id: 'underlayment-coverage',
    title: 'Underlayment Calculator',
    description: 'Calculate underlayment coverage for different flooring types and installation methods.',
    category: 'advanced',
    icon: 'Layers3',
    color: 'teal',
    route: '/calculator/underlayment',
    metaTitle: 'Underlayment Calculator - Flooring Underlayment Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate underlayment coverage for laminate, engineered wood, and vinyl flooring. Professional underlayment calculator.',
    keywords: ['underlayment calculator', 'flooring underlayment calculator', 'underpad calculator', 'floor underlayment estimator']
  },
  {
    id: 'floor-joist-span',
    title: 'Floor Joist Calculator',
    description: 'Calculate floor joist spans and spacing requirements for structural flooring support.',
    category: 'advanced',
    icon: 'Grid',
    color: 'brown',
    route: '/calculator/floor-joist',
    metaTitle: 'Floor Joist Calculator - Joist Span Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate floor joist spans and spacing for structural support. Professional joist calculator with load calculations and building codes.',
    keywords: ['floor joist calculator', 'joist span calculator', 'floor joist spacing calculator', 'structural flooring calculator']
  },
  {
    id: 'subfloor-material',
    title: 'Subfloor Calculator',
    description: 'Calculate subfloor materials including plywood, OSB, and cement board requirements.',
    category: 'advanced',
    icon: 'SquareStack',
    color: 'amber',
    route: '/calculator/subfloor',
    metaTitle: 'Subfloor Calculator - Plywood & OSB Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate subfloor materials including plywood, OSB, and cement board. Professional subfloor calculator with fastener requirements.',
    keywords: ['subfloor calculator', 'plywood calculator', 'OSB calculator', 'cement board calculator']
  },
  {
    id: 'moisture-barrier',
    title: 'Moisture Barrier Calculator',
    description: 'Calculate moisture barrier and vapor retarder requirements for flooring installations.',
    category: 'advanced',
    icon: 'Shield',
    color: 'blue',
    route: '/calculator/moisture-barrier',
    metaTitle: 'Moisture Barrier Calculator - Vapor Barrier Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate moisture barrier and vapor retarder requirements. Professional moisture barrier calculator for basement and concrete installations.',
    keywords: ['moisture barrier calculator', 'vapor barrier calculator', 'moisture retarder calculator', 'floor moisture barrier']
  },

  // Room Shape Calculators
  {
    id: 'rectangular-room',
    title: 'Rectangular Room Calculator',
    description: 'Calculate flooring for standard rectangular and square room layouts with precision.',
    category: 'basic',
    icon: 'RectangleHorizontal',
    color: 'blue',
    route: '/calculator/rectangular-room',
    metaTitle: 'Rectangular Room Calculator - Square Room Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate flooring for rectangular and square rooms. Professional room calculator with precise measurements and material estimates.',
    keywords: ['rectangular room calculator', 'square room calculator', 'room flooring calculator', 'rectangular flooring calculator']
  },
  {
    id: 'l-shaped-room',
    title: 'L-Shaped Room Calculator',
    description: 'Calculate flooring for L-shaped and irregular room configurations with complex layouts.',
    category: 'basic',
    icon: 'CornerUpLeft',
    color: 'green',
    route: '/calculator/l-shaped-room',
    metaTitle: 'L-Shaped Room Calculator - Irregular Room Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate flooring for L-shaped and irregular rooms. Professional calculator for complex room layouts and configurations.',
    keywords: ['L-shaped room calculator', 'irregular room calculator', 'complex room calculator', 'L-shape flooring calculator']
  },
  {
    id: 'circular-room',
    title: 'Circular Room Calculator',
    description: 'Calculate flooring for circular, curved, and round room designs with specialized formulas.',
    category: 'basic',
    icon: 'Circle',
    color: 'purple',
    route: '/calculator/circular-room',
    metaTitle: 'Circular Room Calculator - Round Room Calculator | FlooringCalc Pro',
    metaDescription: 'Calculate flooring for circular and round rooms. Professional circular room calculator with curved layout support.',
    keywords: ['circular room calculator', 'round room calculator', 'curved room calculator', 'circular flooring calculator']
  },
  {
    id: 'multi-room-estimator',
    title: 'Multi-Room Estimator',
    description: 'Calculate flooring costs and materials for multiple rooms in a single comprehensive estimate.',
    category: 'advanced',
    icon: 'Building2',
    color: 'indigo',
    route: '/calculator/multi-room',
    metaTitle: 'Multi-Room Flooring Calculator - Whole House Estimator | FlooringCalc Pro',
    metaDescription: 'Calculate flooring for multiple rooms in one estimate. Professional multi-room calculator for whole house flooring projects.',
    keywords: ['multi-room calculator', 'whole house flooring calculator', 'multiple room calculator', 'house flooring estimator']
  },
];

export const getCalculatorByRoute = (route: string): CalculatorData | undefined => {
  return calculators.find(calc => calc.route === route);
};

export const getCalculatorsByCategory = (category: string): CalculatorData[] => {
  if (category === 'all') return calculators;
  return calculators.filter(calc => calc.category === category);
};
