"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { RiArrowLeftLine, RiUserFill } from "react-icons/ri";

export default function ClassUsersPage() {
  const params = useParams();
  const classId = parseInt(params.classId as string);

  const { data: classData, isLoading: classLoading } =
    api.admin.getClassById.useQuery({ id: classId });

  const { data: users, isLoading: usersLoading } =
    api.admin.getUsersByClass.useQuery({ classId });

  if (classLoading || usersLoading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    );
  }

  if (!classData) {
    return (
      <div className="flex h-64 items-center justify-center">
        Kelas tidak ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/admin/classes">
              <Button variant="outline" size="sm">
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Users - {classData.name}
              </h1>
              <p className="text-gray-600">
                Daftar user yang terdaftar di kelas ini
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <RiUserFill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Users terdaftar di kelas {classData.name}
          </p>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {user.name || "Unknown"}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500">
                    Role: {user.role}
                  </span>
                  {user.school && (
                    <span className="text-xs text-gray-500">
                      {user.school}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="text-gray-500">TKA</p>
                  <p className="font-semibold">
                    {user.enrolledTka ? "✓ Enrolled" : "✗ Not enrolled"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">UTBK</p>
                  <p className="font-semibold">
                    {user.enrolledUtbk ? "✓ Enrolled" : "✗ Not enrolled"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Token</p>
                  <p className="font-semibold">{user.token || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <RiUserFill className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                Belum ada user yang terdaftar di kelas ini
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
