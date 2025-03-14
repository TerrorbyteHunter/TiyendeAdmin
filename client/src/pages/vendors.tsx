import { useState } from "react";
import { useLocation } from "wouter";
import { VendorsManagement } from "@/components/vendors/vendors-management";
import { Button } from "@/components/ui/button";
import { TruckIcon } from "lucide-react";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Vendors</h2>
          <p className="mt-1 text-sm text-gray-500">Manage vendor partnerships and details.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex">
          <TruckIcon className="mr-2 h-4 w-4" />
          Export Vendors
        </Button>
      </div>
      <VendorsManagement />
    </div>
  );
}