import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ShoppingBag, 
  ChefHat, 
  Box, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  Users
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  // These would be real API calls in a production app
  const { data: ordersData, isLoading: ordersLoading } = useQuery<any>({
    queryKey: ['/api/admin/dashboard/orders'],
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery<any>({
    queryKey: ['/api/admin/dashboard/revenue'],
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<any>({
    queryKey: ['/api/admin/dashboard/products'],
  });

  const { data: customersData, isLoading: customersLoading } = useQuery<any>({
    queryKey: ['/api/admin/dashboard/customers'],
  });

  // Placeholder data until the API is implemented
  const orderStats = ordersData || {
    total: 245,
    pending: 18,
    delivered: 203,
    cancelled: 24,
    percentChange: 12.5
  };

  const revenueStats = revenueData || {
    total: "₹86,400",
    today: "₹4,350",
    thisWeek: "₹28,760",
    percentChange: 8.2
  };

  const productStats = productsData || {
    total: 24,
    inStock: 18,
    lowStock: 4,
    outOfStock: 2,
    percentChange: -2.4
  };

  const customerStats = customersData || {
    total: 476,
    newToday: 12,
    newThisWeek: 54,
    percentChange: 14.3
  };

  // Mock recent orders until API is implemented
  const recentOrders = [
    { id: 1, customer: "Rahul Sharma", total: "₹860", status: "Delivered", date: "2 hours ago" },
    { id: 2, customer: "Priya Singh", total: "₹1,240", status: "Processing", date: "3 hours ago" },
    { id: 3, customer: "Amit Kumar", total: "₹750", status: "Pending", date: "5 hours ago" },
    { id: 4, customer: "Divya Patel", total: "₹1,100", status: "Cooking", date: "6 hours ago" },
    { id: 5, customer: "Rohan Joshi", total: "₹590", status: "Ready for pickup", date: "8 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className={orderStats.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                {orderStats.percentChange > 0 ? "+" : ""}{orderStats.percentChange}%
              </span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
          <CardFooter className="px-2 pb-2">
            <div className="grid grid-cols-3 w-full text-center text-xs">
              <div>
                <div className="font-semibold text-yellow-500">{orderStats.pending}</div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="font-semibold text-green-500">{orderStats.delivered}</div>
                <div className="text-muted-foreground">Delivered</div>
              </div>
              <div>
                <div className="font-semibold text-red-500">{orderStats.cancelled}</div>
                <div className="text-muted-foreground">Cancelled</div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.total}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className={revenueStats.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                {revenueStats.percentChange > 0 ? "+" : ""}{revenueStats.percentChange}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
          <CardFooter className="px-2 pb-2">
            <div className="grid grid-cols-2 w-full text-center text-xs">
              <div>
                <div className="font-semibold">{revenueStats.today}</div>
                <div className="text-muted-foreground">Today</div>
              </div>
              <div>
                <div className="font-semibold">{revenueStats.thisWeek}</div>
                <div className="text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats.total}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className={productStats.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                {productStats.percentChange > 0 ? "+" : ""}{productStats.percentChange}%
              </span>
              <span className="ml-1">product changes</span>
            </div>
          </CardContent>
          <CardFooter className="px-2 pb-2">
            <div className="grid grid-cols-3 w-full text-center text-xs">
              <div>
                <div className="font-semibold text-green-500">{productStats.inStock}</div>
                <div className="text-muted-foreground">In Stock</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-500">{productStats.lowStock}</div>
                <div className="text-muted-foreground">Low Stock</div>
              </div>
              <div>
                <div className="font-semibold text-red-500">{productStats.outOfStock}</div>
                <div className="text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className={customerStats.percentChange > 0 ? "text-green-500" : "text-red-500"}>
                {customerStats.percentChange > 0 ? "+" : ""}{customerStats.percentChange}%
              </span>
              <span className="ml-1">new customers</span>
            </div>
          </CardContent>
          <CardFooter className="px-2 pb-2">
            <div className="grid grid-cols-2 w-full text-center text-xs">
              <div>
                <div className="font-semibold">{customerStats.newToday}</div>
                <div className="text-muted-foreground">Today</div>
              </div>
              <div>
                <div className="font-semibold">{customerStats.newThisWeek}</div>
                <div className="text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
              View All
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0">
                    <td className="py-3 text-sm">#{order.id}</td>
                    <td className="py-3 text-sm">{order.customer}</td>
                    <td className="py-3 text-sm">{order.total}</td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'Cooking' ? 'bg-orange-100 text-orange-800' : ''}
                        ${order.status === 'Ready for pickup' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-3 text-sm">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}