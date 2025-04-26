import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import CategoryNav from "@/components/category-nav";

export default function ProductDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ['/api/products', id]
  });

  const { data: relatedProducts, isLoading: isRelatedLoading } = useQuery({
    queryKey: ['/api/products/related', id],
    enabled: !!product
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: uuidv4(),
      productId: parseInt(id),
      quantity,
      notes: notes.trim() || undefined,
      product
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  return (
    <>
      <CategoryNav />
      
      <div className="container py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[350px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <div className="pt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden h-[350px]">
              <img 
                src={product.imageUrl || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(product.price)}</p>
              
              <div className="text-muted-foreground">
                {product.description}
              </div>
              
              {!product.inStock && (
                <div className="text-destructive font-medium">
                  Currently out of stock
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!product.inStock}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center">
                      {quantity}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.inStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Instructions</label>
                  <Textarea 
                    placeholder="Any specific preferences? E.g., less spicy, no onions, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!product.inStock}
                  />
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> 
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Product not found</h3>
            <p className="text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
          </div>
        )}

        {/* Related Products */}
        {product && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isRelatedLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-40 rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                  </Card>
                ))
              ) : relatedProducts && relatedProducts.length > 0 ? (
                relatedProducts.slice(0, 4).map(product => (
                  <Card key={product.id} className="overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <div className="h-40 overflow-hidden">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-primary font-medium mt-1">{formatCurrency(product.price)}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground">No related products found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
