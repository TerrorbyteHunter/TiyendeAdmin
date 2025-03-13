import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVendorSchema, type InsertVendor, type Vendor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VendorFormProps {
  vendor?: Vendor;
  onSuccess?: (vendor: Vendor) => void;
  onCancel?: () => void;
}

export function VendorForm({ vendor, onSuccess, onCancel }: VendorFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!vendor;
  
  const form = useForm<InsertVendor>({
    resolver: zodResolver(insertVendorSchema),
    defaultValues: {
      name: vendor?.name || "",
      contactPerson: vendor?.contactPerson || "",
      email: vendor?.email || "",
      phone: vendor?.phone || "",
      address: vendor?.address || "",
      status: vendor?.status || "active",
      logo: vendor?.logo || "",
    },
  });
  
  async function onSubmit(data: InsertVendor) {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = isEditing ? `/api/vendors/${vendor.id}` : "/api/vendors";
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await apiRequest(method, url, data);
      const savedVendor = await response.json();
      
      toast({
        title: `Vendor ${isEditing ? "updated" : "created"} successfully`,
        description: `${savedVendor.name} has been ${isEditing ? "updated" : "added"} to the system.`,
      });
      
      if (onSuccess) {
        onSuccess(savedVendor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vendor");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? "Edit Vendor" : "Add New Vendor"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? "Update the vendor information below"
            : "Fill in the details below to add a new vendor"}
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mazhandu Bus Services" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="John Mazhandu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="info@mazhandubus.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+260 97 1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="123 Cairo Road, Lusaka, Zambia" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/logo.png" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Vendor" : "Create Vendor")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Vendor, InsertVendor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save, ArrowLeft } from "lucide-react";

interface VendorFormProps {
  vendor?: Vendor | null;
  onClose: () => void;
}

// Create a schema for vendor form validation
const vendorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  contactPerson: z.string().min(3, "Contact person must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  logo: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export function VendorForm({ vendor, onClose }: VendorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!vendor;
  
  const defaultValues: Partial<VendorFormValues> = {
    name: vendor?.name || "",
    contactPerson: vendor?.contactPerson || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    address: vendor?.address || "",
    status: vendor?.status || "active",
    logo: vendor?.logo || "",
  };
  
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: VendorFormValues) => {
    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/vendors/${vendor.id}`, data);
        toast({
          title: "Vendor updated",
          description: "The vendor has been successfully updated.",
        });
      } else {
        await apiRequest("POST", "/api/vendors", data);
        toast({
          title: "Vendor created",
          description: "The vendor has been successfully created.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vendor. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? "Edit Vendor" : "Add Vendor"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Transport" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@abctransport.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+260 97 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Lusaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Vendor
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
