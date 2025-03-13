import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";
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
  Clock,
  Plus
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

interface VendorListProps {
  onEdit: (vendor: Vendor) => void;
}

const VendorStatusBadge = ({ status }: { status: Vendor["status"] }) => {
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
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    default:
      return null;
  }
};

export function VendorList({ onEdit }: VendorListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteVendorId, setDeleteVendorId] = useState<number | null>(null);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });

  const vendorToDelete = vendors.find(v => v.id === deleteVendorId);

  const filteredVendors = searchTerm 
    ? vendors.filter((vendor: Vendor) => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : vendors;

  const handleDelete = async () => {
    if (!deleteVendorId) return;

    try {
      await apiRequest("DELETE", `/api/vendors/${deleteVendorId}`);

      toast({
        title: "Vendor deleted",
        description: "The vendor has been successfully deleted.",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setDeleteVendorId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vendors</CardTitle>
        <Button onClick={() => onEdit(null)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor: Vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.contactPerson}</TableCell>
                      <TableCell>
                        <div>{vendor.email}</div>
                        <div className="text-sm text-muted-foreground">{vendor.phone}</div>
                      </TableCell>
                      <TableCell>
                        <VendorStatusBadge status={vendor.status} />
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
                            <DropdownMenuItem onClick={() => onEdit(vendor)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteVendorId(vendor.id)}
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
            open={deleteVendorId !== null} 
            onOpenChange={(open) => !open && setDeleteVendorId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the vendor "{vendorToDelete?.name}". 
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
        </div>
      </CardContent>
    </Card>
  );
}