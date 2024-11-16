import Link from "next/link";
import { Button } from "~/app/_components/ui/button";

export default function Page() {
  return (
    <div className="flex items-center justify-center">
      Pilih Subtes
      <ul>
        <li>
          <Button asChild>
            <Link href={`/drill/PU`}>PU</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/PBM`}>PBM</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/LB`}>LB</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/PPU`}>PPU</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/PK`}>PK</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/drill/PM`}>PM</Link>
          </Button>
        </li>
      </ul>
    </div>
  );
}
