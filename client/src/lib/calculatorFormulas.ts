export interface FlooringCostInputs {
  length: number;
  width: number;
  materialCost: number;
  laborCost: number;
  wastePercentage: number;
  additionalCosts?: number;
}

export interface FlooringCostResults {
  baseArea: number;
  adjustedArea: number;
  materialTotal: number;
  laborTotal: number;
  additionalTotal: number;
  grandTotal: number;
  costPerSqFt: number;
}

export const calculateFlooringCost = (inputs: FlooringCostInputs): FlooringCostResults => {
  const baseArea = inputs.length * inputs.width;
  const adjustedArea = baseArea * (1 + inputs.wastePercentage / 100);
  const materialTotal = adjustedArea * inputs.materialCost;
  const laborTotal = adjustedArea * inputs.laborCost;
  const additionalTotal = inputs.additionalCosts || 0;
  const grandTotal = materialTotal + laborTotal + additionalTotal;
  const costPerSqFt = grandTotal / baseArea;

  return {
    baseArea,
    adjustedArea,
    materialTotal,
    laborTotal,
    additionalTotal,
    grandTotal,
    costPerSqFt
  };
};

export interface SquareFootageInputs {
  shape: 'rectangle' | 'square' | 'circle' | 'l-shape' | 'triangle';
  length?: number;
  width?: number;
  radius?: number;
  // L-Shape specific
  length1?: number;
  width1?: number;
  length2?: number;
  width2?: number;
  // Triangle specific
  base?: number;
  height?: number;
}

export interface SquareFootageResults {
  area: number;
  perimeter?: number;
  calculation: string;
  areaInYards: number;
  areaInInches: number;
}

export const calculateSquareFootage = (inputs: SquareFootageInputs): SquareFootageResults => {
  let area = 0;
  let perimeter = 0;
  let calculation = '';

  switch (inputs.shape) {
    case 'rectangle':
    case 'square':
      area = (inputs.length || 0) * (inputs.width || 0);
      perimeter = 2 * ((inputs.length || 0) + (inputs.width || 0));
      calculation = `${inputs.length} ft × ${inputs.width} ft = ${area.toFixed(2)} sq ft`;
      break;
    case 'circle':
      area = Math.PI * Math.pow(inputs.radius || 0, 2);
      perimeter = 2 * Math.PI * (inputs.radius || 0);
      calculation = `π × ${inputs.radius}² = ${area.toFixed(2)} sq ft`;
      break;
    case 'l-shape':
      const area1 = (inputs.length1 || 0) * (inputs.width1 || 0);
      const area2 = (inputs.length2 || 0) * (inputs.width2 || 0);
      area = area1 + area2;
      calculation = `(${inputs.length1} × ${inputs.width1}) + (${inputs.length2} × ${inputs.width2}) = ${area.toFixed(2)} sq ft`;
      break;
    case 'triangle':
      area = 0.5 * (inputs.base || 0) * (inputs.height || 0);
      calculation = `0.5 × ${inputs.base} × ${inputs.height} = ${area.toFixed(2)} sq ft`;
      break;
  }

  return {
    area,
    perimeter,
    calculation,
    areaInYards: area / 9,
    areaInInches: area * 144
  };
};

export interface WastePercentageInputs {
  roomComplexity: 'simple' | 'moderate' | 'complex';
  materialType: 'tile' | 'hardwood' | 'vinyl' | 'carpet' | 'laminate';
  installationMethod: 'straight' | 'diagonal' | 'pattern';
  roomShape: 'rectangular' | 'irregular';
}

export interface WastePercentageResults {
  recommendedWaste: number;
  minWaste: number;
  maxWaste: number;
  explanation: string;
  factors: string[];
}

export const calculateWastePercentage = (inputs: WastePercentageInputs): WastePercentageResults => {
  let baseWaste = 5;
  const factors: string[] = [];

  // Room complexity factor
  switch (inputs.roomComplexity) {
    case 'simple':
      baseWaste += 0;
      factors.push('Simple room layout');
      break;
    case 'moderate':
      baseWaste += 5;
      factors.push('Moderate complexity with some cuts');
      break;
    case 'complex':
      baseWaste += 10;
      factors.push('Complex room with many angles and cuts');
      break;
  }

  // Material type factor
  switch (inputs.materialType) {
    case 'tile':
      baseWaste += 2;
      factors.push('Ceramic/porcelain tile installation');
      break;
    case 'hardwood':
      baseWaste += 3;
      factors.push('Hardwood flooring installation');
      break;
    case 'vinyl':
      baseWaste += 1;
      factors.push('Vinyl flooring installation');
      break;
    case 'laminate':
      baseWaste += 2;
      factors.push('Laminate flooring installation');
      break;
    case 'carpet':
      baseWaste += 1;
      factors.push('Carpet installation');
      break;
  }

  // Installation method factor
  switch (inputs.installationMethod) {
    case 'straight':
      baseWaste += 0;
      factors.push('Straight installation pattern');
      break;
    case 'diagonal':
      baseWaste += 10;
      factors.push('Diagonal installation (+10% waste)');
      break;
    case 'pattern':
      baseWaste += 15;
      factors.push('Complex pattern installation (+15% waste)');
      break;
  }

  // Room shape factor
  if (inputs.roomShape === 'irregular') {
    baseWaste += 5;
    factors.push('Irregular room shape');
  }

  const recommendedWaste = Math.min(Math.max(baseWaste, 5), 30);
  const minWaste = Math.max(recommendedWaste - 3, 5);
  const maxWaste = Math.min(recommendedWaste + 5, 35);

  const explanation = `Based on your project parameters, we recommend ${recommendedWaste}% waste factor. This accounts for cuts, breakage, and future repairs.`;

  return {
    recommendedWaste,
    minWaste,
    maxWaste,
    explanation,
    factors
  };
};

export interface TileCalculatorInputs {
  roomLength: number;
  roomWidth: number;
  tileLength: number;
  tileWidth: number;
  groutWidth: number;
  wastePercentage: number;
}

export interface TileCalculatorResults {
  roomArea: number;
  tileArea: number;
  tilesNeeded: number;
  tilesWithWaste: number;
  groutNeeded: number;
  adhesiveNeeded: number;
  totalCost?: number;
}

export const calculateTileRequirements = (inputs: TileCalculatorInputs): TileCalculatorResults => {
  const roomArea = inputs.roomLength * inputs.roomWidth;
  const tileArea = (inputs.tileLength / 12) * (inputs.tileWidth / 12); // Convert inches to feet
  const tilesNeeded = Math.ceil(roomArea / tileArea);
  const tilesWithWaste = Math.ceil(tilesNeeded * (1 + inputs.wastePercentage / 100));
  
  // Grout calculation (approximate)
  const groutNeeded = Math.ceil(roomArea * 0.05); // Rough estimate: 0.05 lbs per sq ft
  
  // Adhesive calculation (approximate)
  const adhesiveNeeded = Math.ceil(roomArea / 50); // Rough estimate: 1 bag per 50 sq ft

  return {
    roomArea,
    tileArea,
    tilesNeeded,
    tilesWithWaste,
    groutNeeded,
    adhesiveNeeded
  };
};
