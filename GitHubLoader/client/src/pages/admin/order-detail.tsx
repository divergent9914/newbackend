import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { 
  Clock, 
  MapPin, 
  ChefHat, 
  ChevronLeft, 
  Phone, 
  Mail, 
  Truck, 
  ShoppingBag,
  User,
  Calendar,
  FileText,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderMode } from "@/lib/types";

export default function OrderDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/orders/:id");
  const orderId = params?.id ? parseInt(params.id) : null;

  // Get order data
  const { data: order, isLoading } = useQuery<any>({
    queryKey: ['/api/admin/orders', orderId],
    enabled: !!orderId
  });

  // Mock data until API is implemented
  const mockOrder = {
    id: orderId,
    userId: 123,
    kitchenId: 1,
    orderMode: OrderMode.DELIVERY,
    orderStatus: "confirmed",
    deliverySlotId: 1,
    deliveryAddress: "123 Main St, Ganeshguri, Guwahati, Assam 781005",
    subtotal: "560.00",
    deliveryFee: "40.00",
    serviceFee: "20.00",
    total: "620.00",
    createdAt: "2023-04-25T14:30:00Z",
    user: {
      id: 123,
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul.sharma@example.com"
    },
    kitchen: {
      id: 1,
      name: "Aamis Central Kitchen",
      area: "Ganeshguri",
      city: "Guwahati",
      isActive: true
    },
    deliverySlot: {
      id: 1,
      startTime: "2023-04-25T16:30:00Z",
      endTime: "2023-04-25T17:00:00Z"
    },
    items: [
      {
        id: 1,
        orderId: orderId,
        productId: 1,
        quantity: 1,
        price: "320.00",
        notes: "Extra spicy",
        product: {
          id: 1,
          name: "Assamese Duck Curry",
          description: "Traditional duck curry with bamboo shoot and spices",
          price: "320.00",
          imageUrl: "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          inStock: true
        }
      },
      {
        id: 2,
        orderId: orderId,
        productId: 4,
        quantity: 2,
        price: "180.00",
        product: {
          id: 4,
          name: "Khar",
          description: "Traditional starter made with raw papaya and lentils",
          price: "180.00",
          imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          inStock: true
        }
      }
    ],
    timeline: [
      { status: "pending", timestamp: "2023-04-25T14:30:00Z" },
      { status: "confirmed", timestamp: "2023-04-25T14:35:00Z" }
    ]
  };

  const orderData = order || mockOrder;

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

  const getNextStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["cooking", "cancelled"];
      case "cooking":
        return ["ready", "cancelled"];
      case "ready":
        return ["out_for_delivery", "completed", "cancelled"];
      case "out_for_delivery":
        return ["delivered", "cancelled"];
      case "delivered":
        return ["completed"];
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatuses(orderData.orderStatus);

  const getModeIcon = (mode: OrderMode) => {
    switch (mode) {
      case OrderMode.DELIVERY:
        return <Truck className="h-4 w-4" />;
      case OrderMode.TAKEAWAY:
        return <ShoppingBag className="h-4 w-4" />;
      case OrderMode.DINE_IN:
        return <ChefHat className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDeliveryTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{orderData.id}</h1>
            <div className="flex items-center space-x-2">
              <p className="text-muted-foreground">
                {formatDate(orderData.createdAt)}
              </p>
              <span>•</span>
              <div className="flex items-center space-x-1">
                {getModeIcon(orderData.orderMode)}
                <p className="text-muted-foreground">{getModeLabel(orderData.orderMode)}</p>
              </div>
              <span>•</span>
              {getStatusBadge(orderData.orderStatus)}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {orderData.orderStatus !== "completed" && orderData.orderStatus !== "cancelled" && (
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    Update to {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Items in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items?.map((item: any) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="h-16 w-16 overflow-hidden rounded-md">
                      <img 
                        src={item.product?.imageUrl} 
                        alt={item.product?.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.product?.name}</h4>
                        <p className="font-medium">₹{item.price}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.description}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-muted-foreground">
                        <p>Qty: {item.quantity}</p>
                        {item.notes && (
                          <>
                            <span className="mx-2">•</span>
                            <p className="text-sm">Note: {item.notes}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col items-end space-y-2 pt-6">
              <div className="flex w-full justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{orderData.subtotal}</span>
              </div>
              <div className="flex w-full justify-between text-sm">
                <span>Delivery Fee</span>
                <span>₹{orderData.deliveryFee}</span>
              </div>
              <div className="flex w-full justify-between text-sm">
                <span>Service Fee</span>
                <span>₹{orderData.serviceFee}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex w-full justify-between font-medium">
                <span>Total</span>
                <span>₹{orderData.total}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Status updates for this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                {orderData.timeline?.map((event: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-4 flex flex-col items-center">
                      <div className={`rounded-full p-1 ${
                        index === 0 ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-background" />
                      </div>
                      {index < orderData.timeline.length - 1 && (
                        <div className="h-full w-px bg-muted" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          Status changed to{" "}
                          {getStatusBadge(event.status)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{orderData.user?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{orderData.user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{orderData.user?.email || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info (for delivery orders) */}
          {orderData.orderMode === OrderMode.DELIVERY && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Delivery Time</p>
                    <p className="text-sm text-muted-foreground">
                      {orderData.deliverySlot 
                        ? formatDeliveryTime(orderData.deliverySlot.startTime, orderData.deliverySlot.endTime)
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kitchen Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kitchen Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Kitchen</p>
                  <p className="text-sm text-muted-foreground">{orderData.kitchen?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{orderData.kitchen?.area}, {orderData.kitchen?.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {orderData.orderStatus !== "cancelled" && (
                <Button variant="destructive" className="w-full">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}