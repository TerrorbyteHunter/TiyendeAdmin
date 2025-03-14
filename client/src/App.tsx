import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Vendors from "@/pages/vendors";
import Routes from "@/pages/routes";
import Tickets from "@/pages/tickets";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import { AuthProvider, useAuth } from "@/lib/auth.tsx";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";
import { useState, useEffect } from "react";
import { SessionTimeout } from "@/components/shared/session-timeout";
import Management from "@/pages/management";
import Users from "@/pages/users"; // Added import


function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : null;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated || location === "/login" || location === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="bg-gray-50 h-screen flex overflow-hidden">
      <Sidebar />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 custom-scrollbar">
          {children}
          <SessionTimeout />
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth" component={Login} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/vendors">
        <ProtectedRoute component={Vendors} />
      </Route>
      <Route path="/routes">
        <ProtectedRoute component={Routes} />
      </Route>
      <Route path="/tickets">
        <ProtectedRoute component={Tickets} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={Users} />
      </Route> {/* Added Users route */}
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;