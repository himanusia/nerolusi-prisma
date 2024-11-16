import { Button } from "~/app/_components/ui/button";
import Link from "next/link";

export default function Page({
  params: { subtes },
}: {
  params: { subtes: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      Subtes {`${subtes}`} <br />
      pilih paket:
      <ul className="flex flex-wrap gap-3">
        <li>
          <Button asChild>
            <Link href={`/drill/${subtes}/1`}>1</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/${subtes}/2`}>2</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/${subtes}/3`}>3</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/${subtes}/4`}>4</Link>
          </Button>
        </li>
      </ul>
    </div>
  );
}
