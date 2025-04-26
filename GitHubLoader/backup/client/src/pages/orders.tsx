import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, ShoppingBag, CheckCircle, XCircle, 
  TruckIcon, Package, Truck, Calendar 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

interface OrderItemWithProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image_url: string;
    [key: string]: any;
  };
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  total: number;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items: OrderItemWithProduct[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="text-green-600" size={18} />;
    case "pending":
      return <Clock className="text-yellow-600" size={18} />;
    case "processing":
      return <Package className="text-blue-600" size={18} />;
    case "shipped":
      return <Truck className="text-purple-600" size={18} />;
    case "cancelled":
      return <XCircle className="text-red-600" size={18} />;
    default:
      return <ShoppingBag className="text-gray-600" size={18} />;
  }
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch orders
  const { data, isLoading, error } = useQuery<{ orders: Order[] }>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  const orders = data?.orders || [];

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your orders",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [user, authLoading, toast, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-40 bg-gray-300 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 w-full bg-gray-300 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">We couldn't load your orders. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Format payment method
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "paypal":
        return "PayPal";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="text-primary mb-4" size={48} />
            <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Button asChild>
              <a href="/">Start Shopping</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center">
                      <ShoppingBag className="mr-2" size={18} />
                      Order #{order.id}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="mr-1" size={14} />
                      {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">
                        {order.status}
                      </span>
                    </Badge>
                    <span className="font-semibold text-lg">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="items">
                    <AccordionTrigger>Order Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h3 className="font-semibold mb-2">Items</h3>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-md overflow-hidden">
                                  <img 
                                    src={item.product.image_url} 
                                    alt={item.product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-sm text-gray-500">
                                    ${Number(item.price).toFixed(2)} x {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right font-semibold">
                                  ${(Number(item.price) * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Shipping Address */}
                        <div>
                          <h3 className="font-semibold mb-2">Shipping Address</h3>
                          <p className="text-gray-600">{order.shipping_address}</p>
                        </div>
                        
                        {/* Payment Information */}
                        <div>
                          <h3 className="font-semibold mb-2">Payment Information</h3>
                          <p className="text-gray-600">
                            Method: {formatPaymentMethod(order.payment_method)}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        {/* Price Summary */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${(Number(order.total) * 0.9).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span>${(Number(order.total) * 0.02).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>${(Number(order.total) * 0.08).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <a href={`/orders/${order.id}`}>View Details</a>
                </Button>
                {order.status === "delivered" && (
                  <Button variant="outline">Write a Review</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
