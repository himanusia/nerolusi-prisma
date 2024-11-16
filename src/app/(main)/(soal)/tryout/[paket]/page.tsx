import { Button } from "~/app/_components/ui/button";
import Link from "next/link";

export default function Page({
  params: { paket },
}: {
  params: { paket: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div>Soal UTBK {`${paket}`}</div>
      <div>waktu: 3 jam </div>
      <Button asChild>
        <Link href={`/tryout/${paket}/1`}>Start</Link>
      </Button>
    </div>
  );
}
