import { DataTable } from "~/app/_components/table/data-table";
import { api } from "~/trpc/server";
import { columns } from "./user-columns";
import CreateClassDialog from "./create-class-dialog";

export default async function Page() {
  const users = await api.user.getAllUsers();
  return (
    <div>
      <CreateClassDialog />
      <DataTable columns={columns} data={users} />
    </div>
  );
}
