import { Switch, Route, useRoute } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LocationModal from "@/components/location-modal";
import AuthModal from "@/components/auth-modal";
import DeliverySlotModal from "@/components/delivery-slot-modal";
import CartSheet from "@/components/cart-sheet";
import Home from "@/pages/home";
import Category from "@/pages/category";
import ProductDetail from "@/pages/product-detail";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
import AdminRouter from "@/pages/admin";

function Router() {
  const [isAdminRoute] = useRoute("/admin*");
  
  // If on admin route, return only the admin router without header/footer
  if (isAdminRoute) {
    return <AdminRouter />;
  }
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin/*" component={AdminRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAdminRoute] = useRoute("/admin*");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          {!isAdminRoute && (
            <>
              <Header />
              <LocationModal />
              <AuthModal />
              <DeliverySlotModal />
              <CartSheet />
            </>
          )}
          <main className={`flex-1 ${isAdminRoute ? 'bg-gray-50' : ''}`}>
            <Router />
          </main>
          {!isAdminRoute && <Footer />}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
