import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import ApiGatewayPage from "@/pages/ApiGatewayPage";
import OndcPage from "@/pages/OndcPage";
import MonitoringPage from "@/pages/MonitoringPage";
import DocumentationPage from "@/pages/DocumentationPage";
import ServiceDetail from "@/pages/ServiceDetail";
import GitHubLoaderPage from "@/pages/GitHubLoaderPage";
import SupabaseImportPage from "@/pages/SupabaseImportPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/services" component={Services} />
      <Route path="/services/:serviceId" component={ServiceDetail} />
      <Route path="/api-gateway" component={ApiGatewayPage} />
      <Route path="/ondc" component={OndcPage} />
      <Route path="/monitoring" component={MonitoringPage} />
      <Route path="/docs" component={DocumentationPage} />
      <Route path="/integrations/github" component={GitHubLoaderPage} />
      <Route path="/integrations/supabase" component={SupabaseImportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
