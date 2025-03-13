import { useState } from "react";
import { useLocation } from "wouter";
import { VendorList } from "@/components/vendors/vendor-list";
import { VendorForm } from "@/components/vendors/vendor-form";
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
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(location.includes("?action=new"));
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  
  // Handle vendor form submission success
  const handleSuccess = () => {
    setShowAddForm(false);
    setEditVendor(null);
    queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    
    // Remove ?action=new from URL if present
    if (location.includes("?action=new")) {
      setLocation("/vendors");
    }
  };
  
  const handleEdit = (vendor: Vendor) => {
    setEditVendor(vendor);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Vendors</h2>
          <p className="mt-1 text-sm text-gray-500">Manage bus vendors on the Tiyende platform.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New Vendor
        </Button>
      </div>
      
      <VendorList onEdit={handleEdit} />
      
      {/* Add Vendor Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new vendor on the platform.
            </DialogDescription>
          </DialogHeader>
          <VendorForm onSuccess={handleSuccess} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Vendor Dialog */}
      <Dialog open={editVendor !== null} onOpenChange={(open) => !open && setEditVendor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the vendor information below.
            </DialogDescription>
          </DialogHeader>
          {editVendor && (
            <VendorForm 
              vendor={editVendor} 
              onSuccess={handleSuccess} 
              onCancel={() => setEditVendor(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
