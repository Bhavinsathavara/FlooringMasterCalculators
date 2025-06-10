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
          <Route path="/calculator/tile" component={TileCalculator} />
          <Route path="/calculator/hardwood" component={HardwoodCalculator} />
          <Route path="/calculator/vinyl" component={VinylCalculator} />
          
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
