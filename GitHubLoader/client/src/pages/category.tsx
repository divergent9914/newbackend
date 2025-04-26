import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import CategoryNav from "@/components/category-nav";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/lib/types";

export default function Category() {
  const { slug } = useParams();
  
  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['/api/categories', slug]
  });
  
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['/api/products', { categorySlug: slug }]
  });
  
  useEffect(() => {
    // Scroll to top when category changes
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <>
      <CategoryNav />

      <section className="py-8">
        <div className="container">
          <div className="mb-8">
            {isCategoryLoading ? (
              <Skeleton className="h-8 w-64 mb-2" />
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
                {category?.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isProductsLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : products?.length > 0 ? (
              products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-muted-foreground">There are no products in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
