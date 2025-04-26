import { useState } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleOpenProductDialog = () => {
    setIsDialogOpen(true);
    setQuantity(1);
    setNotes('');
  };

  const handleCloseProductDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      quantity,
      notes: notes.trim(),
      product,
    });

    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} added to your order`,
    });

    setIsDialogOpen(false);
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const isOutOfStock = product.inStock === false;

  return (
    <>
      <div 
        className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
          isOutOfStock ? 'opacity-60' : ''
        }`}
      >
        {/* Product image */}
        <div className="aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute left-0 top-3 bg-destructive px-3 py-1 text-xs font-medium text-white">
            Out of Stock
          </div>
        )}

        {/* Product details */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-medium">{product.name}</h3>
            <span className="text-sm font-semibold">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <Button
            className="mt-4 w-full"
            disabled={isOutOfStock}
            onClick={handleOpenProductDialog}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Order'}
          </Button>
        </div>
      </div>

      {/* Product dialog for adding to cart */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseProductDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Product image */}
            {product.imageUrl && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            {/* Product description */}
            <p className="mb-4 text-muted-foreground">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-4 flex items-center justify-between">
              <span className="font-medium">Price</span>
              <span className="font-medium">{formatCurrency(product.price)}</span>
            </div>

            {/* Quantity selector */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Quantity
              </label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="flex w-12 items-center justify-center text-center">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleIncreaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>

            {/* Special instructions */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium"
              >
                Special Instructions
              </label>
              <Textarea
                id="notes"
                placeholder="Any special requests or notes for this item"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseProductDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddToCart}
            >
              Add to Order · {formatCurrency(Number(product.price) * quantity)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
