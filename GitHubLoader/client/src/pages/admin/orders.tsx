import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, 
  ArrowUpDown,
  ChevronDown,
  MoreVertical,
  Filter
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Order, OrderMode } from "@/lib/types";

export default function OrdersList() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [currentTab, setCurrentTab] = useState("all");

  // Get orders data
  const { data: ordersData, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });

  // Mock data until API is implemented
  const mockOrders: Order[] = [
    {
      id: 1,
      userId: 123,
      kitchenId: 1,
      orderMode: OrderMode.DELIVERY,
      orderStatus: "pending",
      deliverySlotId: 1,
      deliveryAddress: "123 Main St, Guwahati, Assam 781005",
      subtotal: "560.00",
      deliveryFee: "40.00",
      serviceFee: "20.00",
      total: "620.00",
      createdAt: "2023-04-25T14:30:00Z",
      kitchen: {
        id: 1,
        name: "Aamis Central Kitchen",
        area: "Ganeshguri",
        city: "Guwahati",
        isActive: true
      },
      items: [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 1,
          price: "320.00",
          product: {
            id: 1,
            name: "Assamese Duck Curry",
            price: "320.00",
            inStock: true
          }
        },
        {
          id: 2,
          orderId: 1,
          productId: 4,
          quantity: 2,
          price: "180.00",
          product: {
            id: 4,
            name: "Khar",
            price: "180.00",
            inStock: true
          }
        }
      ]
    },
    {
      id: 2,
      userId: 124,
      kitchenId: 1,
      orderMode: OrderMode.TAKEAWAY,
      orderStatus: "confirmed",
      subtotal: "280.00",
      deliveryFee: "0.00",
      serviceFee: "10.00",
      total: "290.00",
      createdAt: "2023-04-25T14:30:00Z",
      kitchen: {
        id: 1,
        name: "Aamis Central Kitchen",
        area: "Ganeshguri",
        city: "Guwahati",
        isActive: true
      },
      items: [
        {
          id: 3,
          orderId: 2,
          productId: 2,
          quantity: 1,
          price: "280.00",
          product: {
            id: 2,
            name: "Bamboo Shoot Pork",
            price: "280.00",
            inStock: true
          }
        }
      ]
    },
    {
      id: 3,
      userId: 125,
      kitchenId: 2,
      orderMode: OrderMode.DELIVERY,
      orderStatus: "cooking",
      deliverySlotId: 2,
      deliveryAddress: "456 Park Ave, Guwahati, Assam 781006",
      subtotal: "760.00",
      deliveryFee: "50.00",
      serviceFee: "30.00",
      total: "840.00",
      createdAt: "2023-04-25T15:15:00Z",
      kitchen: {
        id: 2,
        name: "Aamis Downtown",
        area: "Zoo Road",
        city: "Guwahati",
        isActive: true
      },
      items: [
        {
          id: 4,
          orderId: 3,
          productId: 1,
          quantity: 2,
          price: "320.00",
          product: {
            id: 1,
            name: "Assamese Duck Curry",
            price: "320.00",
            inStock: true
          }
        },
        {
          id: 5,
          orderId: 3,
          productId: 2,
          quantity: 1,
          price: "280.00",
          product: {
            id: 2,
            name: "Bamboo Shoot Pork",
            price: "280.00",
            inStock: true
          }
        }
      ]
    },
    {
      id: 4,
      userId: 126,
      kitchenId: 1,
      orderMode: OrderMode.DINE_IN,
      orderStatus: "completed",
      subtotal: "500.00",
      deliveryFee: "0.00",
      serviceFee: "20.00",
      total: "520.00",
      createdAt: "2023-04-25T13:00:00Z",
      kitchen: {
        id: 1,
        name: "Aamis Central Kitchen",
        area: "Ganeshguri",
        city: "Guwahati",
        isActive: true
      },
      items: [
        {
          id: 6,
          orderId: 4,
          productId: 3,
          quantity: 2,
          price: "250.00",
          product: {
            id: 3,
            name: "Masor Tenga",
            price: "250.00",
            inStock: true
          }
        }
      ]
    },
    {
      id: 5,
      userId: 127,
      kitchenId: 3,
      orderMode: OrderMode.DELIVERY,
      orderStatus: "cancelled",
      deliverySlotId: 3,
      deliveryAddress: "789 River Rd, Guwahati, Assam 781007",
      subtotal: "400.00",
      deliveryFee: "60.00",
      serviceFee: "15.00",
      total: "475.00",
      createdAt: "2023-04-25T12:45:00Z",
      kitchen: {
        id: 3,
        name: "Aamis Riverside",
        area: "Uzanbazar",
        city: "Guwahati",
        isActive: true
      },
      items: [
        {
          id: 7,
          orderId: 5,
          productId: 5,
          quantity: 1,
          price: "260.00",
          product: {
            id: 5,
            name: "Chicken with Ash Gourd",
            price: "260.00",
            inStock: true
          }
        },
        {
          id: 8,
          orderId: 5,
          productId: 4,
          quantity: 1,
          price: "180.00",
          product: {
            id: 4,
            name: "Khar",
            price: "180.00",
            inStock: true
          }
        }
      ]
    }
  ];

  // Use mock data until real API data is available
  const orders = ordersData || mockOrders;

  // Filter and process orders based on tab and search
  const filteredOrders = orders.filter(order => {
    let matches = true;
    
    // Filter by tab (order status)
    if (currentTab !== "all") {
      matches = matches && order.orderStatus === currentTab;
    }
    
    // Filter by status dropdown if selected
    if (statusFilter && statusFilter !== "all") {
      matches = matches && order.orderStatus === statusFilter;
    }
    
    // Filter by search query (order ID or customer address)
    if (searchQuery) {
      const orderIdMatch = String(order.id).includes(searchQuery);
      const addressMatch = order.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      matches = matches && (orderIdMatch || addressMatch);
    }
    
    return matches;
  });

  // Group orders by status for tab counts
  const orderCounts = orders.reduce(
    (acc: Record<string, number>, order) => {
      const status = order.orderStatus || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      acc.all = (acc.all || 0) + 1;
      return acc;
    },
    { all: 0 }
  );

  const toggleOrderSelection = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
      case "cooking":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Cooking</Badge>;
      case "ready":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Ready</Badge>;
      case "out_for_delivery":
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Out for Delivery</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModeLabel = (mode: OrderMode) => {
    switch (mode) {
      case OrderMode.DELIVERY:
        return "Delivery";
      case OrderMode.TAKEAWAY:
        return "Takeaway";
      case OrderMode.DINE_IN:
        return "Dine In";
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or address..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cooking">Cooking</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All Orders
            <Badge variant="secondary" className="ml-2">{orderCounts.all || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">{orderCounts.pending || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed
            <Badge variant="secondary" className="ml-2">{orderCounts.confirmed || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cooking">
            Cooking
            <Badge variant="secondary" className="ml-2">{orderCounts.cooking || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">{orderCounts.completed || 0}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="w-12 px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <span className="sr-only">Select all</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={() => {
                          if (selectedOrders.length === filteredOrders.length) {
                            setSelectedOrders([]);
                          } else {
                            setSelectedOrders(filteredOrders.map(order => order.id));
                          }
                        }}
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium">
                      ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Mode</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Kitchen</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium">
                      Total
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(order.orderStatus)}</td>
                    <td className="px-4 py-3">{getModeLabel(order.orderMode)}</td>
                    <td className="px-4 py-3">{order.kitchen?.name}</td>
                    <td className="px-4 py-3 font-medium">₹{order.total}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/orders/${order.id}`)}>
                            View Order Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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