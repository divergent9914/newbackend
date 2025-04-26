import { Route, Switch } from 'wouter';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GitHubLoaderPage from './pages/GitHubLoaderPage';
import SupabaseImportPage from './pages/SupabaseImportPage';
import OndcPage from './pages/OndcPage';
import NotFound from './pages/NotFound';
import './App.css';
import './styles/layout.css';

function App() {
  return (
    <div className="app-wrapper">
      <Sidebar />
      
      <main className="main-content">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/github-loader" component={GitHubLoaderPage} />
          <Route path="/supabase-import" component={SupabaseImportPage} />
          <Route path="/ondc" component={OndcPage} />
          <Route path="/api-gateway" component={() => <h1>API Gateway (Coming Soon)</h1>} />
          <Route path="/monitoring" component={() => <h1>Monitoring (Coming Soon)</h1>} />
          <Route path="/documentation" component={() => <h1>Documentation (Coming Soon)</h1>} />
          <Route path="/services" component={() => <h1>Services (Coming Soon)</h1>} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

export default App;