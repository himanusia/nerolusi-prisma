"use client";

import { type user } from "~/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/app/_components/table/data-table-column-header";
import { DataTableRowActions } from "~/app/_components/table/data-table-row-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { api } from "~/trpc/react";

export const columns: ColumnDef<user>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <span>{row.getValue("email")}</span>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const changeRoleApi = api.user.updateRole.useMutation();

      return (
        <Select
          value={row.getValue("role")}
          onValueChange={(value: "user" | "teacher" | "admin") => {
            changeRoleApi.mutate({ id: row.original.id, role: value });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
