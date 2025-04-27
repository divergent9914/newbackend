import { useParams } from 'wouter';
import ProductDetail from '@/components/customer/ProductDetail';
import StorefrontLayout from './StorefrontLayout';

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId;
  
  if (!productId) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/store" 
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition"
          >
            Continue Shopping
          </a>
        </div>
      </StorefrontLayout>
    );
  }
  
  return (
    <StorefrontLayout>
      <ProductDetail productId={productId} />
    </StorefrontLayout>
  );
}