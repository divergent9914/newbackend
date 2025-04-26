import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Filter, ChevronDown, X, 
  SortAsc, SortDesc, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/product-card";
import { ShoppingCart } from "@/components/shopping-cart";
import { QuickViewModal } from "@/components/quick-view-modal";
import type { Category, Product } from "@shared/schema";

type SortOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const sortOptions: SortOption[] = [
  { label: "Newest", value: "newest", icon: <SortDesc size={16} /> },
  { label: "Price: Low to High", value: "price_asc", icon: <SortAsc size={16} /> },
  { label: "Price: High to Low", value: "price_desc", icon: <SortDesc size={16} /> },
  { label: "Best Rating", value: "rating", icon: <Check size={16} /> },
];

export default function CategoryPage() {
  const [match, params] = useRoute("/category/:slug");
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [] as string[],
    onSale: false,
  });
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Fetch all categories
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['/api/categories'],
  });

  // Fetch current category
  const { data: categoryData, isLoading: categoryLoading } = useQuery<{ category: Category }>({
    queryKey: [`/api/categories/${params?.slug}`],
    enabled: !!params?.slug && params.slug !== "all",
  });

  // Fetch products for this category or all products if slug is "all"
  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: Product[] }>({
    queryKey: params?.slug === "all" 
      ? ['/api/products'] 
      : [`/api/products/category/${categoryData?.category.id}`],
    enabled: params?.slug === "all" || !!categoryData?.category.id,
  });

  // Extract unique brands from products for filtering
  const uniqueBrands = productsData?.products
    ? Array.from(new Set(productsData.products.map(p => p.brand).filter(Boolean)))
    : [];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Apply filters and sorting
  const applyFilters = () => {
    if (!productsData?.products) return;
    
    let filtered = [...productsData.products];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term))
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(p => 
      Number(p.price) >= filters.priceRange[0] && 
      Number(p.price) <= filters.priceRange[1]
    );
    
    // Apply brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => p.brand && filters.brands.includes(p.brand));
    }
    
    // Apply sale filter
    if (filters.onSale) {
      filtered = filtered.filter(p => p.on_sale);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "rating":
        filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case "newest":
      default:
        // Assuming newer products have higher IDs
        filtered.sort((a, b) => b.id - a.id);
        break;
    }
    
    setFilteredProducts(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      priceRange: [0, 1000],
      brands: [],
      onSale: false,
    });
    setSortBy("newest");
  };

  // Toggle brand in filter
  const toggleBrandFilter = (brand: string) => {
    setFilters(prev => {
      const brands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands };
    });
  };

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [productsData, searchTerm, filters, sortBy]);

  // Get current category name
  const categoryName = params?.slug === "all" 
    ? "All Products" 
    : categoryData?.category.name || "Category";

  // Loading state
  if (params?.slug !== "all" && categoryLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 w-1/3 bg-gray-300 animate-pulse rounded mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
              <div className="w-full h-64 bg-gray-300 animate-pulse"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Filter button for mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2" size={16} />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down products based on your preferences
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider 
                      defaultValue={filters.priceRange} 
                      max={1000}
                      step={10}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* Brands */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Brands</h3>
                  <div className="space-y-2">
                    {uniqueBrands.map(brand => brand && (
                      <div key={brand} className="flex items-center">
                        <Checkbox 
                          id={`brand-${brand}`}
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={() => toggleBrandFilter(brand)}
                        />
                        <label 
                          htmlFor={`brand-${brand}`}
                          className="ml-2 text-sm font-medium leading-none cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* On Sale */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <Checkbox 
                      id="on-sale"
                      checked={filters.onSale}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, onSale: !!checked }))
                      }
                    />
                    <label 
                      htmlFor="on-sale"
                      className="ml-2 text-sm font-medium leading-none cursor-pointer"
                    >
                      On Sale
                    </label>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                <Button onClick={() => applyFilters()}>Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Search Bar */}
        <div className="flex-grow">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            {searchTerm && (
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-gray-500"
                onClick={() => setSearchTerm("")}
              >
                <X size={18} />
              </button>
            )}
          </form>
        </div>
        
        {/* Sort Dropdown */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px]">
                <SortAsc className="mr-2" size={16} />
                Sort By: {sortOptions.find(o => o.value === sortBy)?.label}
                <ChevronDown className="ml-2" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value} 
                  onClick={() => setSortBy(option.value)}
                  className="flex items-center"
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                  {sortBy === option.value && (
                    <Check className="ml-2" size={16} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <Accordion type="single" collapsible className="w-full">
              {/* Price Range */}
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="px-2">
                    <Slider 
                      defaultValue={filters.priceRange} 
                      max={1000}
                      step={10}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Brands */}
              <AccordionItem value="brands">
                <AccordionTrigger>Brands</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {uniqueBrands.map(brand => brand && (
                      <div key={brand} className="flex items-center">
                        <Checkbox 
                          id={`brand-${brand}`}
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={() => toggleBrandFilter(brand)}
                        />
                        <label 
                          htmlFor={`brand-${brand}`}
                          className="ml-2 text-sm font-medium leading-none cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Sale */}
              <AccordionItem value="sale">
                <AccordionTrigger>Sales & Offers</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center">
                    <Checkbox 
                      id="on-sale"
                      checked={filters.onSale}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, onSale: !!checked }))
                      }
                    />
                    <label 
                      htmlFor="on-sale"
                      className="ml-2 text-sm font-medium leading-none cursor-pointer"
                    >
                      On Sale
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
          
          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/category/all" 
                  className={`block py-1 hover:text-primary transition duration-150 ${params?.slug === 'all' ? 'text-primary font-medium' : ''}`}
                >
                  All Products
                </a>
              </li>
              {categoriesData?.categories.map(category => (
                <li key={category.id}>
                  <a 
                    href={`/category/${category.slug}`}
                    className={`block py-1 hover:text-primary transition duration-150 ${params?.slug === category.slug ? 'text-primary font-medium' : ''}`}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-grow">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-full h-64 bg-gray-300 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Cart and Quick View Modal */}
      <ShoppingCart />
      <QuickViewModal />
    </div>
  );
}
