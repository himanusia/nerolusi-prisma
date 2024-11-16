import { Button } from "~/app/_components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      pilih paket tryout:
      <ul className="flex gap-3">
        <li>
          <Button asChild>
            <Link href={`/tryout/1`}>1</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/tryout/2`}>2</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/tryout/3`}>3</Link>
          </Button>
        </li>
        <li>
          <Button asChild>
            <Link href={`/tryout/4`}>4</Link>
          </Button>
        </li>
      </ul>
    </div>
  );
}
