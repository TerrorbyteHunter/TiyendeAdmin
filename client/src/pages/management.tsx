import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TruckIcon } from "lucide-react";
import { UsersManagement } from "@/components/users/users-management";
import { VendorsManagement } from "@/components/vendors/vendors-management";

export default function Management() {
  const [location, setLocation] = useLocation();
  const getSearchParams = () => {
    const url = new URL(location, 'http://example.com');
    return new URLSearchParams(url.search);
  };

  const searchParams = getSearchParams();
  const tabFromUrl = searchParams.get('tab') as "users" | "vendors" | null;
  const [activeTab, setActiveTab] = useState<"users" | "vendors">(tabFromUrl || "users");

  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === "users" || tabFromUrl === "vendors")) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value: "users" | "vendors") => {
    setActiveTab(value);
    const params = new URLSearchParams();
    params.set('tab', value);
    setLocation(`/management?${params.toString()}`);
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
        onValueChange={handleTabChange}
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
          <UsersManagement />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <VendorsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}