import { useState } from "react";
import { useLocation } from "wouter";
import { RouteList } from "@/components/routes/route-list";
import { RouteForm } from "@/components/routes/route-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "@shared/schema";

export default function Routes() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(location.includes("?action=new"));
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  
  // Handle route form submission success
  const handleSuccess = () => {
    setShowAddForm(false);
    setEditRoute(null);
    queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
    
    // Remove ?action=new from URL if present
    if (location.includes("?action=new")) {
      setLocation("/routes");
    }
  };
  
  const handleEdit = (route: Route) => {
    setEditRoute(route);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Bus Routes</h2>
          <p className="mt-1 text-sm text-gray-500">Manage routes and schedules for all vendors.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New Route
        </Button>
      </div>
      
      <RouteList onEdit={handleEdit} />
      
      {/* Add Route Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new bus route.
            </DialogDescription>
          </DialogHeader>
          <RouteForm onSuccess={handleSuccess} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Route Dialog */}
      <Dialog open={editRoute !== null} onOpenChange={(open) => !open && setEditRoute(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update the route information below.
            </DialogDescription>
          </DialogHeader>
          {editRoute && (
            <RouteForm 
              route={editRoute} 
              onSuccess={handleSuccess} 
              onCancel={() => setEditRoute(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
