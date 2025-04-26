import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";

export interface ProductsQueryOptions {
  featured?: boolean;
  categoryId?: number;
  categorySlug?: string;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  onSale?: boolean;
}

export function useProducts(options: ProductsQueryOptions = {}) {
  const { 
    featured, 
    categoryId, 
    categorySlug, 
    limit, 
    search, 
    sort,
    onSale
  } = options;

  // First get category if categorySlug is provided
  const categoryQuery = useQuery<{ category: Category }>({
    queryKey: ['/api/categories', categorySlug],
    enabled: !!categorySlug,
  });

  // Determine actual categoryId to use
  const resolvedCategoryId = categoryId || (categorySlug ? categoryQuery.data?.category.id : undefined);
  
  // Build query parameters
  let endpoint = '/api/products';
  let queryParams = new URLSearchParams();
  
  if (featured) {
    endpoint = '/api/products/featured';
  } else if (resolvedCategoryId) {
    endpoint = `/api/products/category/${resolvedCategoryId}`;
  } else if (onSale) {
    // Use filter param for on_sale items
    queryParams.append('on_sale', 'true');
  }
  
  if (limit) {
    queryParams.append('limit', limit.toString());
  }
  
  if (search) {
    queryParams.append('search', search);
  }
  
  // Get the products
  const productsQuery = useQuery<{ products: Product[] }>({
    queryKey: [endpoint, queryParams.toString()],
    enabled: !categorySlug || !!(categorySlug && categoryQuery.data),
  });

  // Get all products or sort them if needed
  const products = productsQuery.data?.products || [];
  
  // Apply client-side sorting if needed
  let sortedProducts = [...products];
  
  if (sort) {
    switch (sort) {
      case 'newest':
        // Assuming newer products have higher IDs
        sortedProducts.sort((a, b) => b.id - a.id);
        break;
      case 'price_asc':
        sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'rating':
        sortedProducts.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
    }
  }

  return {
    products: sortedProducts,
    isLoading: categorySlug ? categoryQuery.isLoading || productsQuery.isLoading : productsQuery.isLoading,
    isError: categorySlug ? categoryQuery.isError || productsQuery.isError : productsQuery.isError,
    error: categorySlug ? categoryQuery.error || productsQuery.error : productsQuery.error,
  };
}

export function useFeaturedProducts(limit: number = 8) {
  return useProducts({ featured: true, limit });
}

export function useNewArrivals(limit: number = 8) {
  return useQuery<{ products: Product[] }>({
    queryKey: ['/api/products/new-arrivals', limit],
    select: (data) => ({
      products: data.products.slice(0, limit)
    })
  });
}

export function useProductByCategory(categoryId: number | string, limit?: number) {
  const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  return useProducts({ categoryId: id, limit });
}

export function useProductById(id: number | string | undefined) {
  const productId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return useQuery<{ product: Product }>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
}

export function useOnSaleProducts(limit: number = 8) {
  return useProducts({ onSale: true, limit });
}
