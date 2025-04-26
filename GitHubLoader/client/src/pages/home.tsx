import { useQuery } from "@tanstack/react-query";
import Hero from "@/components/hero";
import CategoryNav from "@/components/category-nav";
import OrderModeSelector from "@/components/order-mode";
import ProductCard from "@/components/product-card";
import PromotionBanner from "@/components/promotion-banner";
import { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['/api/products/featured']
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories']
  });

  const { data: productsByCategory, isLoading: isCategoryProductsLoading } = useQuery({
    queryKey: ['/api/products/by-category']
  });

  return (
    <>
      <Hero />

      <CategoryNav />

      <OrderModeSelector />

      {/* Featured Items */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-2xl font-bold mb-4">Featured Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isFeaturedLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts?.map((product: Product) => (
                <ProductCard key={product.id} product={product} featured />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories Sections */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Assamese Specialties</h2>
          
          <div className="space-y-8">
            {isCategoryProductsLoading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              ))
            ) : (
              categories?.map((category: Category) => {
                const categoryProducts = productsByCategory?.[category.id] || [];
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={category.id}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      {category.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({categoryProducts.length} items)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryProducts.slice(0, 2).map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <PromotionBanner />
    </>
  );
}
