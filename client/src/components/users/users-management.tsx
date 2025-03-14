
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserList } from "./user-list";
import { UserForm } from "./user-form";
import type { User } from "@shared/schema";

export function UsersManagement() {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleUserEdit = (user: User) => {
    setEditingUser(user);
    setIsAddingUser(true);
  };

  const handleUserFormClose = () => {
    setIsAddingUser(false);
    setEditingUser(null);
  };

  return (
    <>
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
    </>
  );
}
