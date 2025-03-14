
import { useState } from "react";
import { VendorList } from "./vendor-list";
import { VendorForm } from "./vendor-form";
import type { Vendor } from "@shared/schema";

export function VendorsManagement() {
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const handleVendorEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsAddingVendor(true);
  };

  const handleVendorFormClose = () => {
    setIsAddingVendor(false);
    setEditingVendor(null);
  };

  return (
    <>
      {isAddingVendor ? (
        <VendorForm 
          vendor={editingVendor} 
          onClose={handleVendorFormClose} 
        />
      ) : (
        <VendorList onEdit={handleVendorEdit} />
      )}
    </>
  );
}
