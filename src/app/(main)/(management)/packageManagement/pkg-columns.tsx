"use client";

import { type pkg } from "~/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/app/_components/ui/badge";
import { QuestionMarkCircledIcon, StopwatchIcon } from "@radix-ui/react-icons";
import { DataTableRowActions } from "~/app/_components/table/data-table-row-actions";
import { DataTableColumnHeader } from "~/app/_components/table/data-table-column-header";

const packageTypes = [
  {
    value: "drill",
    label: "Drill",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "tryout",
    label: "Try Out",
    icon: StopwatchIcon,
  },
];

export const columns: ColumnDef<pkg>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Package Name" />
    ),
    cell: ({ row }) => {
      const packageType = packageTypes.find(
        (type) => type.value === row.original.type,
      );

      return (
        <div>
          {packageType && <Badge variant="outline">{packageType.label}</Badge>}{" "}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "TOstart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => {
      const TOstart = row.getValue<Date | null>("TOstart");
      return TOstart ? new Date(TOstart).toLocaleString() : "N/A";
    },
  },
  {
    accessorKey: "TOend",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Time" />
    ),
    cell: ({ row }) => {
      const TOend = row.getValue<Date | null>("TOend");
      return TOend ? new Date(TOend).toLocaleString() : "N/A";
    },
  },
  {
    accessorKey: "TOduration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => row.getValue<string | null>("TOduration") ?? "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
