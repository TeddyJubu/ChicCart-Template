import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import OwnerDashboard from "@/pages/OwnerDashboard";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import { Button } from "@/components/ui/button";
import { Store, Code2 } from "lucide-react";

export default function AdminPanel() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user && !(user as any).isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin access",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || (user && !(user as any).isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const isOwner = location === "/admin" || location === "/admin/owner";
  const isDev = location === "/admin/developer";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold" data-testid="text-admin-title">Admin</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isOwner ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocation("/admin/owner")}
              data-testid="button-nav-owner"
              className="gap-2"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Owner</span>
            </Button>
            <Button
              variant={isDev ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocation("/admin/developer")}
              data-testid="button-nav-developer"
              className="gap-2"
            >
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Developer</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Switch>
        <Route path="/admin" component={OwnerDashboard} />
        <Route path="/admin/owner" component={OwnerDashboard} />
        <Route path="/admin/developer" component={DeveloperDashboard} />
      </Switch>
    </div>
  );
}
