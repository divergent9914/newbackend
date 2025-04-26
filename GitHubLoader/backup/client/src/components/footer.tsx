import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export default function Footer() {
  const { toast } = useToast();
  
  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['/api/categories'],
  });
  
  const categories = categoriesData?.categories || [];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    
    if (email) {
      toast({
        title: "Subscribed!",
        description: "You've been subscribed to our newsletter.",
      });
      form.reset();
    }
  };

  return (
    <footer className="bg-gray-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ShopHub</h3>
            <p className="text-gray-300 mb-4">Your one-stop shop for all your needs. Quality products, competitive prices, and exceptional service.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition duration-150">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition duration-150">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition duration-150">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop Categories</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map(category => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`}>
                    <a className="text-gray-300 hover:text-white transition duration-150">
                      {category.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition duration-150">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition duration-150">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition duration-150">Shipping & Returns</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition duration-150">Track Order</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition duration-150">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form onSubmit={handleSubscribe} className="flex">
              <Input 
                type="email" 
                name="email"
                placeholder="Your email address" 
                className="px-4 py-2 rounded-l-lg flex-grow text-gray-dark focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Button type="submit" className="rounded-l-none">
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
