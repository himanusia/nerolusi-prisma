import Link from "next/link";
import { Button } from "~/app/_components/ui/button";

export default function Page({
  params: { paket, nomor },
}: {
  params: { paket: string; nomor: string };
}) {
  return (
    <div className="m-6 flex w-full">
      <div className="w-full">
        Soal tryout paket {`${paket}`} nomor {`${nomor}`}
      </div>
      <div className="flex w-1/4">
        <ul className="flex flex-auto gap-3">
          <li>
            <Button asChild>
              <Link href={`/tryout/${paket}/1`}>1</Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <Link href={`/tryout/${paket}/2`}>2</Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <Link href={`/tryout/${paket}/3`}>3</Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <Link href={`/tryout/${paket}/4`}>4</Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <Link href={`/tryout/${paket}/5`}>5</Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <Link href={`/tryout/${paket}/6`}>6</Link>
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}
