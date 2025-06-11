import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import components directly for reliable loading
import HomePage from "@/pages/HomePage";
import FlooringCostCalculator from "@/pages/calculators/FlooringCostCalculator";
import SquareFootageCalculator from "@/pages/calculators/SquareFootageCalculator";
import WastePercentageCalculator from "@/pages/calculators/WastePercentageCalculator";
import TileCalculator from "@/pages/calculators/TileCalculator";
import HardwoodCalculator from "@/pages/calculators/HardwoodCalculator";
import VinylCalculator from "@/pages/calculators/VinylCalculator";
import InstallationCostCalculator from "@/pages/calculators/InstallationCostCalculator";
import MaterialQuantityCalculator from "@/pages/calculators/MaterialQuantityCalculator";
import LaborCostCalculator from "@/pages/calculators/LaborCostCalculator";
import RoomAreaCalculator from "@/pages/calculators/RoomAreaCalculator";
import TileAdhesiveCalculator from "@/pages/calculators/TileAdhesiveCalculator";
import CarpetCalculator from "@/pages/calculators/CarpetCalculator";
import EpoxyFlooringCalculator from "@/pages/calculators/EpoxyFlooringCalculator";
import LaminateCalculator from "@/pages/calculators/LaminateCalculator";
import ConcreteFlooringCalculator from "@/pages/calculators/ConcreteFlooringCalculator";
import BaseboardTrimCalculator from "@/pages/calculators/BaseboardTrimCalculator";
import StoneFlooringCalculator from "@/pages/calculators/StoneFlooringCalculator";
import RoomShapeCalculator from "@/pages/calculators/RoomShapeCalculator";
import BambooFlooringCalculator from "@/pages/calculators/BambooFlooringCalculator";
import SubfloorCalculator from "@/pages/calculators/SubfloorCalculator";
import CorkFlooringCalculator from "@/pages/calculators/CorkFlooringCalculator";
import LoadingDemoPage from "@/pages/LoadingDemoPage";
import EngineeredWoodCalculator from "@/pages/calculators/EngineeredWoodCalculator";
import SheetVinylCalculator from "@/pages/calculators/SheetVinylCalculator";
import LinoleumCalculator from "@/pages/calculators/LinoleumCalculator";
import AreaRugCalculator from "@/pages/calculators/AreaRugCalculator";
import GarageFloorCalculator from "@/pages/calculators/GarageFloorCalculator";
import RubberFlooringCalculator from "@/pages/calculators/RubberFlooringCalculator";
import ParquetLayoutCalculator from "@/pages/calculators/ParquetLayoutCalculator";
import FloatingFloorGapCalculator from "@/pages/calculators/FloatingFloorGapCalculator";
import StairCalculator from "@/pages/calculators/StairCalculator";
import UnlevelFloorCalculator from "@/pages/calculators/UnlevelFloorCalculator";
import RadiantHeatingCalculator from "@/pages/calculators/RadiantHeatingCalculator";
import AcousticUnderlaymentCalculator from "@/pages/calculators/AcousticUnderlaymentCalculator";
import TransitionStripCalculator from "@/pages/calculators/TransitionStripCalculator";
import FloorRepairCalculator from "@/pages/calculators/FloorRepairCalculator";
import MoldingCalculator from "@/pages/calculators/MoldingCalculator";
import HVACFloorRegisterCalculator from "@/pages/calculators/HVACFloorRegisterCalculator";
import FloorJoistCalculator from "@/pages/calculators/FloorJoistCalculator";
import FloorFinishingCalculator from "@/pages/calculators/FloorFinishingCalculator";
import FloorLoadCalculator from "@/pages/calculators/FloorLoadCalculator";
import TileGroutCalculator from "@/pages/calculators/TileGroutCalculator";
import TilePatternCalculator from "@/pages/calculators/TilePatternCalculator";
import MoistureBarrierCalculator from "@/pages/calculators/MoistureBarrierCalculator";
import CircularRoomCalculator from "@/pages/calculators/CircularRoomCalculator";
import LShapedRoomCalculator from "@/pages/calculators/LShapedRoomCalculator";
import RectangularRoomCalculator from "@/pages/calculators/RectangularRoomCalculator";
import MultiRoomCalculator from "@/pages/calculators/MultiRoomCalculator";
import TestPage from "@/pages/TestPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Switch>
          {/* Test Page */}
          <Route path="/test" component={TestPage} />
          
          {/* Home Page */}
          <Route path="/" component={HomePage} />
          
          {/* Calculator Pages */}
          <Route path="/calculator/flooring-cost" component={FlooringCostCalculator} />
          <Route path="/calculator/square-footage" component={SquareFootageCalculator} />
          <Route path="/calculator/installation-cost" component={InstallationCostCalculator} />
          <Route path="/calculator/waste-percentage" component={WastePercentageCalculator} />
          <Route path="/calculator/material-quantity" component={MaterialQuantityCalculator} />
          <Route path="/calculator/labor-cost" component={LaborCostCalculator} />
          <Route path="/calculator/room-area" component={RoomAreaCalculator} />
          <Route path="/calculator/tile" component={TileCalculator} />
          <Route path="/calculator/tile-adhesive" component={TileAdhesiveCalculator} />
          <Route path="/calculator/carpet" component={CarpetCalculator} />
          <Route path="/calculator/epoxy" component={EpoxyFlooringCalculator} />
          <Route path="/calculator/laminate" component={LaminateCalculator} />
          <Route path="/calculator/concrete" component={ConcreteFlooringCalculator} />
          <Route path="/calculator/baseboard" component={BaseboardTrimCalculator} />
          <Route path="/calculator/vinyl" component={VinylCalculator} />
          <Route path="/calculator/stone" component={StoneFlooringCalculator} />
          <Route path="/calculator/room-shape" component={RoomShapeCalculator} />
          <Route path="/calculator/bamboo" component={BambooFlooringCalculator} />
          <Route path="/calculator/cork" component={CorkFlooringCalculator} />
          <Route path="/calculator/subfloor" component={SubfloorCalculator} />
          <Route path="/calculator/hardwood" component={HardwoodCalculator} />
          <Route path="/calculator/engineered-wood" component={EngineeredWoodCalculator} />
          <Route path="/calculator/sheet-vinyl" component={SheetVinylCalculator} />
          <Route path="/calculator/linoleum" component={LinoleumCalculator} />
          <Route path="/calculator/area-rug" component={AreaRugCalculator} />
          <Route path="/calculator/garage-floor" component={GarageFloorCalculator} />
          <Route path="/calculator/rubber-flooring" component={RubberFlooringCalculator} />
          <Route path="/calculator/parquet" component={ParquetLayoutCalculator} />
          <Route path="/calculator/floating-floor-gap" component={FloatingFloorGapCalculator} />
          <Route path="/calculator/stairs" component={StairCalculator} />
          <Route path="/calculator/floor-leveling" component={UnlevelFloorCalculator} />
          <Route path="/calculator/radiant-heating" component={RadiantHeatingCalculator} />
          <Route path="/calculator/acoustic-underlayment" component={AcousticUnderlaymentCalculator} />
          <Route path="/calculator/transition-strips" component={TransitionStripCalculator} />
          <Route path="/calculator/floor-repair" component={FloorRepairCalculator} />
          <Route path="/calculator/molding" component={MoldingCalculator} />
          <Route path="/calculator/hvac-registers" component={HVACFloorRegisterCalculator} />
          <Route path="/calculator/floor-joists" component={FloorJoistCalculator} />
          <Route path="/calculator/floor-finishing" component={FloorFinishingCalculator} />
          <Route path="/calculator/floor-load" component={FloorLoadCalculator} />
          <Route path="/calculator/tile-grout" component={TileGroutCalculator} />
          <Route path="/calculator/tile-pattern" component={TilePatternCalculator} />
          <Route path="/calculator/moisture-barrier" component={MoistureBarrierCalculator} />
          <Route path="/calculator/circular-room" component={CircularRoomCalculator} />
          <Route path="/calculator/l-shaped-room" component={LShapedRoomCalculator} />
          <Route path="/calculator/rectangular-room" component={RectangularRoomCalculator} />
          <Route path="/calculator/multi-room" component={MultiRoomCalculator} />
          
          {/* Demo Pages */}
          <Route path="/demo/loading-animations" component={LoadingDemoPage} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
