import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/lib/types";
import { Link, useLocation } from "wouter";

export default function CategoryNav() {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories']
  });

  useEffect(() => {
    // Extract category from URL if on a category page
    if (location.startsWith('/category/')) {
      const slug = location.split('/').pop();
      setActiveCategory(slug || null);
    } else {
      setActiveCategory(null);
    }
  }, [location]);

  return (
    <section className="py-4 border-b sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
      <div className="container">
        <div className="flex overflow-x-auto gap-2 -mx-1 pb-1">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            asChild
          >
            <Link href="/">All Items</Link>
          </Button>

          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28" />
            ))
          ) : (
            categories?.map((category: Category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.slug ? "default" : "outline"}
                className="whitespace-nowrap"
                asChild
              >
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </Button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
