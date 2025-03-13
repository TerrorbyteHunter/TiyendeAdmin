
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, TruckIcon } from "lucide-react";
import { VendorList } from "@/components/vendors/vendor-list";
import { UserList } from "@/components/users/user-list";
import { UserForm } from "@/components/users/user-form";
import { VendorForm } from "@/components/vendors/vendor-form";
import type { User, Vendor } from "@shared/schema";

export default function Management() {
  const [activeTab, setActiveTab] = useState<"users" | "vendors">("users");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const handleUserEdit = (user: User) => {
    setEditingUser(user);
    setIsAddingUser(true);
  };

  const handleVendorEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsAddingVendor(true);
  };

  const handleUserFormClose = () => {
    setIsAddingUser(false);
    setEditingUser(null);
  };

  const handleVendorFormClose = () => {
    setIsAddingVendor(false);
    setEditingVendor(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Management</h2>
        <p className="mt-1 text-sm text-gray-500">Manage users and vendors.</p>
      </div>

      <Tabs 
        defaultValue="users" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "users" | "vendors")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            Vendors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {isAddingUser ? (
            <UserForm 
              user={editingUser} 
              onClose={handleUserFormClose} 
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Users</CardTitle>
                <Button onClick={() => setIsAddingUser(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </CardHeader>
              <CardContent>
                <UserList onEdit={handleUserEdit} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          {isAddingVendor ? (
            <VendorForm 
              vendor={editingVendor} 
              onClose={handleVendorFormClose} 
            />
          ) : (
            <VendorList onEdit={handleVendorEdit} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
