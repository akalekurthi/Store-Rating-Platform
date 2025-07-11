import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import StoreOwnerDashboard from "@/pages/store-owner-dashboard";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/register" component={RegisterPage} />
        <Route path="/" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  const userRole = (user as any)?.user?.role;
  
  return (
    <Switch>
      {userRole === "admin" && <Route path="/" component={AdminDashboard} />}
      {userRole === "user" && <Route path="/" component={UserDashboard} />}
      {userRole === "store_owner" && <Route path="/" component={StoreOwnerDashboard} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
