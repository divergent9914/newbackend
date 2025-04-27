import { useState } from 'react';
import { useCart } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { useNavigate } from 'wouter';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    instructions: ''
  });

  // Calculate totals
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'phone', 'email', 'address', 'city', 'pincode'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: 'Missing information',
          description: `Please fill in the ${field} field.`,
          variant: 'destructive'
        });
        return false;
      }
    }

    if (items.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Please add some items before checkout.',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create address object from form data
      const deliveryAddress = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        instructions: formData.instructions
      };

      // Submit order to backend
      const response = await apiRequest('/orders', {
        method: 'POST',
        body: {
          items,
          deliveryAddress,
          paymentMethod,
          subtotal,
          deliveryFee,
          total
        }
      });

      if (response.ok) {
        const orderData = await response.json();
        toast({
          title: 'Order placed successfully!',
          description: `Your order #${orderData.id} has been confirmed.`
        });
        
        // Clear cart and redirect to success page
        clearCart();
        navigate('/order-success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery & Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
                <CardDescription>
                  Enter your delivery details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea 
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input 
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions (optional)</Label>
                  <Textarea 
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Any specific instructions for delivery"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
              
              <Separator />
              
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Select your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  defaultValue="CARD" 
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="CARD" id="payment-card" />
                    <Label htmlFor="payment-card" className="flex-1 cursor-pointer">Pay with Card (Online)</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="COD" id="payment-cod" />
                    <Label htmlFor="payment-cod" className="flex-1 cursor-pointer">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="UPI" id="payment-upi" />
                    <Label htmlFor="payment-upi" className="flex-1 cursor-pointer">UPI Payment</Label>
                  </div>
                </RadioGroup>
              </CardContent>
              
              <CardFooter className="flex justify-between flex-wrap gap-4">
                <Button variant="outline" type="button" onClick={() => navigate('/cart')}>
                  Back to Cart
                </Button>
                <Button type="submit" className="min-w-[150px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ₹${total.toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between pb-2 border-b">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{((item.salePrice || item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p>₹{subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Delivery Fee</p>
                      <p>₹{deliveryFee.toFixed(2)}</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <p>Total</p>
                      <p>₹{total.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
                    Continue Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}