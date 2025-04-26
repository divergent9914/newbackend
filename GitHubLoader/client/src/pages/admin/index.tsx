import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { 
  ShoppingBag, 
  Users, 
  Box, 
  BarChart, 
  Settings, 
  Home,
  ChefHat
} from "lucide-react";

import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Get order count
  const { data: ordersData } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/admin/orders'],
  });
  
  const pendingOrders = ordersData?.orders?.filter(order => order.orderStatus === "pending").length || 0;

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    navigate(`/admin/${value === "dashboard" ? '' : value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">Aamis Admin</h1>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
            <nav className="space-y-2">
              <Button
                variant={currentTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTabChange("dashboard")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentTab === "orders" ? "default" : "ghost"}
                className="w-full justify-start relative"
                onClick={() => handleTabChange("orders")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
                {pendingOrders > 0 && (
                  <span className="absolute right-2 top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingOrders}
                  </span>
                )}
              </Button>
              <Button
                variant={currentTab === "products" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTabChange("products")}
              >
                <Box className="mr-2 h-4 w-4" />
                Products
              </Button>
              <Button
                variant={currentTab === "kitchens" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTabChange("kitchens")}
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Kitchens
              </Button>
              <Button
                variant={currentTab === "customers" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTabChange("customers")}
              >
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Button>
              <Button
                variant={currentTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTabChange("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

// Placeholder components until we create the real ones
const AdminDashboard = () => <div>Dashboard Content</div>;
const OrdersList = () => <div>Orders List Content</div>;
const OrderDetail = () => <div>Order Detail Content</div>;
const ProductsList = () => <div>Products List Content</div>;
const ProductEdit = () => <div>Product Edit Content</div>;
const KitchensList = () => <div>Kitchens List Content</div>;
const KitchenEdit = () => <div>Kitchen Edit Content</div>;

export default function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/orders" component={OrdersList} />
        <Route path="/admin/orders/:id" component={OrderDetail} />
        <Route path="/admin/products" component={ProductsList} />
        <Route path="/admin/products/new" component={ProductEdit} />
        <Route path="/admin/products/:id" component={ProductEdit} />
        <Route path="/admin/kitchens" component={KitchensList} />
        <Route path="/admin/kitchens/new" component={KitchenEdit} />
        <Route path="/admin/kitchens/:id" component={KitchenEdit} />
      </Switch>
    </AdminLayout>
  );
}