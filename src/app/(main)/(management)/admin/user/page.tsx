import { api } from "~/trpc/server";
import CreateClassDialog from "./CreateClassDialog";
import UserTable from "./UserTable";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function UserManagementPage() {
  const users = await api.user.getAllUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and class assignments</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <CreateClassDialog />
      </div>

      {/* User Table */}
      <UserTable userData={users} />
    </div>
  );
}
