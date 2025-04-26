import { Route, Switch } from 'wouter';
import StorefrontLayout from './customer/StorefrontLayout';
import Home from './customer/Home';
import ProductPage from './customer/ProductPage';
import NotFound from './NotFound';

export default function StoreFront() {
  return (
    <StorefrontLayout>
      <Switch>
        <Route path="/store" component={Home} />
        <Route path="/store/product/:productId" component={ProductPage} />
        <Route component={NotFound} />
      </Switch>
    </StorefrontLayout>
  );
}