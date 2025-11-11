import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database,
  Activity,
  Clock,
  Users,
  Package,
  ShoppingCart,
  Server,
  Zap
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SystemHealth {
  status: string;
  uptime: number;
  timestamp: string;
}

interface DatabaseStats {
  totalUsers: number;
  totalProducts: number;
  totalVariants: number;
  totalOrders: number;
  totalCartItems: number;
}

interface ApiLog {
  method: string;
  path: string;
  status: number;
  duration: number;
  timestamp: string;
}

export default function DeveloperDashboard() {
  const { data: health } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/health'],
    refetchInterval: 10000, // Refresh every 10s
  });

  const { data: dbStats } = useQuery<DatabaseStats>({
    queryKey: ['/api/admin/db-stats'],
  });

  const { data: logs = [] } = useQuery<ApiLog[]>({
    queryKey: ['/api/admin/logs'],
    refetchInterval: 5000, // Refresh every 5s
  });

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return "default";
    if (status >= 400 && status < 500) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-7xl py-6 space-y-6">
        {/* System Health */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">System Health</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold capitalize">{health?.status || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold">{health ? formatUptime(health.uptime) : '0h 0m 0s'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-sm font-medium">
                  {health ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Database Statistics */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">Database Statistics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Users</span>
              </div>
              <p className="text-2xl font-bold" data-testid="stat-users">
                {dbStats?.totalUsers || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-sm">Products</span>
              </div>
              <p className="text-2xl font-bold" data-testid="stat-products">
                {dbStats?.totalProducts || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-sm">Variants</span>
              </div>
              <p className="text-2xl font-bold" data-testid="stat-variants">
                {dbStats?.totalVariants || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Orders</span>
              </div>
              <p className="text-2xl font-bold" data-testid="stat-orders">
                {dbStats?.totalOrders || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Cart Items</span>
              </div>
              <p className="text-2xl font-bold" data-testid="stat-cart-items">
                {dbStats?.totalCartItems || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* API Request Logs */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">Recent API Requests</h2>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No recent API requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 20).map((log, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border hover-elevate">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.method}
                    </Badge>
                    <span className="text-sm font-mono truncate">{log.path}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant={getStatusBadge(log.status)}>
                      {log.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {log.duration}ms
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Environment Info */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">Environment</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Node Environment</span>
              <Badge variant="secondary">{import.meta.env.MODE}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Database</span>
              <Badge variant="default">PostgreSQL</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Auth Provider</span>
              <Badge variant="default">Replit OIDC</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
