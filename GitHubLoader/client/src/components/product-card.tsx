import { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency, truncateText } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (withNotes = false) => {
    if (withNotes) {
      setIsDialogOpen(true);
      return;
    }

    addItem({
      id: uuidv4(),
      productId: product.id,
      quantity: 1,
      product
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  const handleAddWithNotes = () => {
    addItem({
      id: uuidv4(),
      productId: product.id,
      quantity: 1,
      notes,
      product
    });

    setIsDialogOpen(false);
    setNotes("");

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  if (featured) {
    return (
      <>
        <Card className="overflow-hidden group">
          <div className="h-48 overflow-hidden relative">
            <img 
              src={product.imageUrl || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
              alt={product.name} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-medium">Out of Stock</span>
              </div>
            )}
            {product.inStock && product.categorySlug === "bestseller" && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                Bestseller
              </div>
            )}
            {product.inStock && product.categorySlug === "chef-special" && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                Chef's Special
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <Link href={`/product/${product.id}`}>
              <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">{product.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {truncateText(product.description || "", 60)}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="font-semibold">{formatCurrency(product.price)}</div>
              <Button 
                size="sm"
                variant="default"
                className="h-8 w-8 p-0"
                disabled={!product.inStock}
                onClick={() => handleAddToCart(true)}
              >
                <Plus size={16} />
                <span className="sr-only">Add to cart</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Special Instructions</DialogTitle>
              <DialogDescription>
                Any specific preferences for {product.name}?
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., less spicy, no onions, etc."
              className="min-h-[100px]"
            />
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWithNotes}>Add to Cart</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex border rounded-lg p-3 bg-card hover:bg-accent/20 transition-colors">
        <div className="h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
            alt={product.name} 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-3 flex-1 min-w-0 flex flex-col">
          <Link href={`/product/${product.id}`}>
            <h4 className="font-medium hover:text-primary cursor-pointer">{product.name}</h4>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {truncateText(product.description || "", 70)}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div className="font-medium">{formatCurrency(product.price)}</div>
            <Button 
              size="sm"
              variant="default"
              className="h-8 w-8 p-0"
              disabled={!product.inStock}
              onClick={() => handleAddToCart(true)}
            >
              <Plus size={16} />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Special Instructions</DialogTitle>
            <DialogDescription>
              Any specific preferences for {product.name}?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., less spicy, no onions, etc."
            className="min-h-[100px]"
          />
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWithNotes}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
