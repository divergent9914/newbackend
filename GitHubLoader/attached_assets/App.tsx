import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Cart from "@/components/Cart";
import AuthModal from "@/components/AuthModal";
import DeliverySlotModal from "@/components/DeliverySlotModal";
import LocationSelector from "@/components/LocationSelector";
import LocationDetector from "@/components/LocationDetector";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Modals and sheets */}
      <Cart />
      <AuthModal />
      <DeliverySlotModal />
      <LocationSelector />
      <LocationDetector />
      <Toaster />
    </div>
  );
}

export default App;
