
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

// Create a schema for user form validation
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["admin", "staff"]),
  active: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserForm({ user, onClose }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!user;
  
  const defaultValues: Partial<UserFormValues> = {
    username: user?.username || "",
    email: user?.email || "",
    fullName: user?.fullName || "",
    password: "",
    role: user?.role || "staff",
    active: user?.active ?? true,
  };
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: UserFormValues) => {
    try {
      // If editing, remove password if it's empty
      if (isEditing && !data.password) {
        delete data.password;
      }
      
      if (isEditing) {
        await apiRequest("PATCH", `/api/users/${user.id}`, data);
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        });
      } else {
        await apiRequest("POST", "/api/users", data);
        toast({
          title: "User created",
          description: "The user has been successfully created.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? "Edit User" : "Add User"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
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
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Password (leave empty to keep current)" : "Password"}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                <Save className="mr-2 h-4 w-4" /> Save User
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
