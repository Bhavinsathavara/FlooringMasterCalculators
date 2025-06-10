import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
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
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
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
