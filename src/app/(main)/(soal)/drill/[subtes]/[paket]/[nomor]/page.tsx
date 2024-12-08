import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { Soal } from "./soal";

export default function Page({
  params: { subtes, paket, nomor },
}: {
  params: { subtes: string; paket: string; nomor: string };
}) {
  return (
    <div className="flex w-full gap-3">
      <div className="w-full rounded-md border p-3">
        Soal drill subtes {`${subtes}`} paket {`${paket}`} nomor {`${nomor}`}{" "}
        <br />
        <Soal />
      </div>
      <div className="w-fit rounded-md border p-3">
        <ul className="flex w-[256px] flex-wrap gap-1">
          <li>
            <Button className="w-12" asChild>
              <Link href={`/drill/${subtes}/${paket}/1`}>1</Link>
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}
