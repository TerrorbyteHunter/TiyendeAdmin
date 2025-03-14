
import { UsersManagement } from "@/components/users/users-management";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex">
          <Users className="mr-2 h-4 w-4" />
          Export Users
        </Button>
      </div>
      <UsersManagement />
    </div>
  );
}
