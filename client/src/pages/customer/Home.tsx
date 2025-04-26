import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductGrid from '@/components/customer/ProductGrid';

// Mock categories - will be replaced with API data later

// Mock data for categories
const MOCK_CATEGORIES = [
  { id: 1, name: 'Poultry', slug: 'poultry', imageUrl: 'https://placehold.co/100x100' },
  { id: 2, name: 'Mutton', slug: 'mutton', imageUrl: 'https://placehold.co/100x100' },
  { id: 3, name: 'Seafood', slug: 'seafood', imageUrl: 'https://placehold.co/100x100' },
  { id: 4, name: 'Eggs', slug: 'eggs', imageUrl: 'https://placehold.co/100x100' }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Categories query - using mock data for now
  // Will connect to backend API later
  
  // Fetch categories - using mock data for now
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => Promise.resolve(MOCK_CATEGORIES)
  });
  
  // This filtering is now handled by the ProductGrid component
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90"></div>
        <div className="relative py-16 px-8 text-white z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Premium Quality Meat & Seafood</h1>
          <p className="text-lg md:text-xl mb-6 max-w-xl">Farm-fresh products delivered to your doorstep through the ONDC network</p>
          <button className="px-6 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>
      </div>
      
      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className={`border rounded-lg p-6 cursor-pointer transition hover:shadow-md ${
                  selectedCategory === category.slug ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.slug ? null : category.slug
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <img 
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Products Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory 
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` 
              : 'Featured Products'}
          </h2>
          
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          )}
        </div>
        
        <ProductGrid categorySlug={selectedCategory} />
      </div>
      
      {/* Features Section */}
      <div className="mb-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
            <p className="text-gray-600">Farm-fresh produce sourced directly from verified farmers and suppliers on the ONDC network</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quick Delivery</h3>
            <p className="text-gray-600">Express delivery through our network of delivery partners connected through ONDC</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">Competitive prices with no middlemen markup thanks to direct ONDC integration</p>
          </div>
        </div>
      </div>
      
      {/* ONDC Integration Highlight */}
      <div className="mb-12 border rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Powered by ONDC</h2>
            <p className="text-gray-600 mb-4">
              We're proud to be integrated with the Open Network for Digital Commerce (ONDC), 
              India's revolutionary initiative to democratize digital commerce.
            </p>
            <p className="text-gray-600 mb-6">
              Through ONDC, we connect directly with suppliers, logistics partners, and payment 
              gateways to provide you with a seamless shopping experience while supporting local businesses.
            </p>
            <button className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary/90 transition">
              Learn More
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">ONDC Logo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}