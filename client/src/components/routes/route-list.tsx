import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  CheckCircle, 
  XCircle,
  Clock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface RouteListProps {
  onEdit: (route: Route) => void;
}

const RouteStatusBadge = ({ status }: { status: Route["status"] }) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" /> Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" /> Inactive
        </Badge>
      );
    default:
      return null;
  }
};

export function RouteList({ onEdit }: RouteListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteRouteId, setDeleteRouteId] = useState<number | null>(null);
  
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['/api/routes'],
  });
  
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  const routeToDelete = routes.find(r => r.id === deleteRouteId);
  
  const filteredRoutes = searchTerm 
    ? routes.filter((route: Route) => 
        route.departure.toLowerCase().includes(searchTerm.toLowerCase()) || 
        route.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : routes;
  
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : `Vendor #${vendorId}`;
  };
  
  const handleDelete = async () => {
    if (!deleteRouteId) return;
    
    try {
      await apiRequest("DELETE", `/api/routes/${deleteRouteId}`);
      
      toast({
        title: "Route deleted",
        description: "The route has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setDeleteRouteId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No routes found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoutes.map((route: Route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">
                      {route.departure} → {route.destination}
                    </TableCell>
                    <TableCell>{getVendorName(route.vendorId)}</TableCell>
                    <TableCell>
                      <div>Departs: {route.departureTime}</div>
                      <div className="text-sm text-muted-foreground">
                        {route.daysOfWeek.slice(0, 3).join(", ")}
                        {route.daysOfWeek.length > 3 && "..."}
                      </div>
                    </TableCell>
                    <TableCell>K{route.fare}</TableCell>
                    <TableCell>
                      <RouteStatusBadge status={route.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(route)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteRouteId(route.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={deleteRouteId !== null} 
          onOpenChange={(open) => !open && setDeleteRouteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the route "
                {routeToDelete?.departure} → {routeToDelete?.destination}". 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
