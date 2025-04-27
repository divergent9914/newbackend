import { Link } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderSuccess() {
  return (
    <div className="container max-w-md py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
          <CardDescription>
            Thank you for your order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your order has been received and is now being processed. 
            You will receive an order confirmation email shortly.
          </p>
          
          <div className="p-4 bg-muted rounded-md mt-4">
            <h3 className="font-semibold mb-2">Order Details</h3>
            <p className="text-sm text-muted-foreground">
              Order ID: #123456 <br />
              Estimated Delivery: 30-45 minutes
            </p>
          </div>
          
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              You can track your order status in your account dashboard
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href="/orders">Track My Order</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}