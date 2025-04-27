import { useCartStore, type Product } from '@/lib/store';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  
  const handleAddToCart = () => {
    addItem(product);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition group relative">
      <Link href={`/store/product/${product.id}`} className="block">
        <div className="relative h-48 bg-gray-100">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {product.isPopular && (
            <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              Popular
            </span>
          )}
          
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-1 mb-1">
            {product.isVeg ? (
              <span className="w-4 h-4 border border-green-500 flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </span>
            ) : (
              <span className="w-4 h-4 border border-red-500 flex items-center justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
            )}
            <span className="text-xs text-gray-500">{product.weight}</span>
          </div>
          
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold">₹{(product.salePrice || product.price) / 100}</span>
              {product.salePrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{product.price / 100}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Add to cart button - positioned outside of the link */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart();
        }}
        disabled={!product.isAvailable}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="h-4 w-4" />
      </button>
    </div>
  );
}