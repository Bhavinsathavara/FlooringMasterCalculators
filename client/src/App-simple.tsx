import { useState, useEffect } from 'react';
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
import TestPage from "@/pages/TestPage";
import NotFound from "@/pages/not-found";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure components are loaded before rendering
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/test" component={TestPage} />
              <Route path="/" component={HomePage} />
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
              <Route path="/calculator/hardwood" component={HardwoodCalculator} />
              <Route path="/calculator/vinyl" component={VinylCalculator} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;