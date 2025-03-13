import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { Vendor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

interface VendorFormProps {
  vendor?: Vendor | null;
  onSuccess?: (vendor: Vendor) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export function VendorForm({ vendor, onSuccess, onCancel, onClose }: VendorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function onSubmit(data: VendorFormValues) {
    setIsLoading(true);
    setError(null);

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

      if (onSuccess) {
        onSuccess(data as unknown as Vendor);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save vendor");
      toast({
        title: "Error",
        description: "Failed to save vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
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
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
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
                      <Input placeholder="contact@mazhandu.com" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+260 211 123456" {...field} />
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
                    <Textarea placeholder="Plot 123, Great East Road, Lusaka" {...field} />
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
                    <Input placeholder="https://example.com/logo.png" {...field} />
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
      </CardContent>
    </Card>
  );
}