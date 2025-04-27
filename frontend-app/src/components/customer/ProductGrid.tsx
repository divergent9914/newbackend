import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import { Product } from '@/lib/store';

interface ProductGridProps {
  categorySlug?: string | null;
}

export default function ProductGrid({ categorySlug }: ProductGridProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch products from API
  const { data: products, isError } = useQuery({
    queryKey: ['/api/products', categorySlug],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const url = categorySlug 
          ? `/api/products?category=${categorySlug}` 
          : '/api/products';
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        return data as Product[];
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  // Filter products by category if provided
  const filteredProducts = categorySlug && products
    ? products.filter((product: Product) => product.categorySlug === categorySlug)
    : products;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center p-8 border rounded-lg bg-red-50 text-red-600">
        <h3 className="text-lg font-medium mb-2">Failed to load products</h3>
        <p>There was an error loading the products. Please try again later.</p>
      </div>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-gray-500">
          {categorySlug 
            ? `No products available in this category. Please check back later.` 
            : `No products available at the moment. Please check back later.`}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredProducts?.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}