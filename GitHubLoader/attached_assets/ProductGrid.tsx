import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/types';
import { useLocationStore } from '@/lib/store';
import ProductCard from './ProductCard';

interface ProductGridProps {
  categorySlug?: string;
}

export default function ProductGrid({ categorySlug }: ProductGridProps) {
  const [location] = useLocation();
  const { selectedKitchen } = useLocationStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Parse query params if no categorySlug is provided
  const params = new URLSearchParams(location.split('?')[1]);
  const queryCategorySlug = params.get('category') || categorySlug;
  
  // Fetch products based on kitchen and category
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', {
      kitchenId: selectedKitchen?.id,
      categorySlug: queryCategorySlug
    }],
    enabled: !!selectedKitchen?.id,
  });
  
  // Filter products based on category
  const filterProducts = useCallback(() => {
    if (!products) return [];
    
    if (!queryCategorySlug) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(
      (product: Product) => product.categorySlug === queryCategorySlug
    );
    setFilteredProducts(filtered);
  }, [products, queryCategorySlug]);
  
  useEffect(() => {
    filterProducts();
  }, [filterProducts, products, queryCategorySlug]);
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i}
            className="rounded-lg bg-card p-4 shadow-sm animate-pulse"
          >
            <div className="aspect-square w-full rounded-md bg-muted"></div>
            <div className="mt-4 h-4 w-2/3 rounded-md bg-muted"></div>
            <div className="mt-2 h-4 w-full rounded-md bg-muted"></div>
            <div className="mt-4 h-10 w-full rounded-md bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No products found</h3>
        <p className="mt-2 text-muted-foreground">
          {queryCategorySlug
            ? "No products found in this category"
            : "No products available"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
