import { Route, Switch, useLocation } from 'wouter';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GitHubLoaderPage from './pages/GitHubLoaderPage';
import SupabaseImportPage from './pages/SupabaseImportPage';
import OndcPage from './pages/OndcPage';
import StoreFront from './pages/StoreFront';
import NotFound from './pages/NotFound';
import TestPage from './pages/TestPage';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import Cart from './components/customer/Cart';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import './styles/layout.css';

function App() {
  const [location] = useLocation();
  
  // Check if current route is a customer-facing route
  const isCustomerRoute = location === '/' || 
                         location === '/cart' || 
                         location === '/checkout' || 
                         location === '/order-success' ||
                         location.startsWith('/product/') ||
                         location.startsWith('/category/');
  
  const isStoreRoute = location === '/store' || location.startsWith('/store/');
  
  // Determine if we should show the cart component (on customer routes except checkout and order success)
  const showCart = isCustomerRoute && location !== '/checkout' && location !== '/order-success';

  // Render Customer-facing routes
  if (isCustomerRoute) {
    return (
      <>
        <Switch>
          <Route path="/" component={StoreFront} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-success" component={OrderSuccess} />
          <Route path="/product/:id">
            {(params) => <StoreFront productId={params.id} />}
          </Route>
          <Route path="/category/:slug">
            {(params) => <StoreFront categorySlug={params.slug} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
        {showCart && <Cart />}
        <Toaster />
      </>
    );
  }
  
  // Render StoreFront for legacy store routes
  if (isStoreRoute) {
    return (
      <>
        <StoreFront />
        <Cart />
        <Toaster />
      </>
    );
  }

  // Render Admin Panel for admin routes
  return (
    <div className="app-wrapper">
      <Sidebar />
      
      <main className="main-content">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/github-loader" component={GitHubLoaderPage} />
          <Route path="/supabase-import" component={SupabaseImportPage} />
          <Route path="/ondc" component={OndcPage} />
          <Route path="/test" component={TestPage} />
          <Route path="/api-gateway" component={() => <h1>API Gateway (Coming Soon)</h1>} />
          <Route path="/monitoring" component={() => <h1>Monitoring (Coming Soon)</h1>} />
          <Route path="/documentation" component={() => <h1>Documentation (Coming Soon)</h1>} />
          <Route path="/services" component={() => <h1>Services (Coming Soon)</h1>} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;