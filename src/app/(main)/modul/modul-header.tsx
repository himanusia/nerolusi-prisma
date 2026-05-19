import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";

export default function ModulHeader() {

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-[#e4e1ed] p-6">
        <HeadJenisSubtest title="Materi dan Catatan" type="modul" />
      </div>
    </div>
  );
}
