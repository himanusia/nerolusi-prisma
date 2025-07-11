import Link from "next/link";

interface ModulCardProps {
  namaModul: string;
  imageSrc: string;
}

export default function ModulCard({ namaModul, imageSrc }: ModulCardProps) {
  return (
    <Link
      href={`/modul/${namaModul}`}
      className="flex h-32 w-36 flex-col items-center justify-center gap-2 rounded-lg border border-green-700 p-2 hover:cursor-pointer"
    >
      <div className="flex size-16 items-center justify-center rounded-lg bg-green-700 p-2">
        <img src={imageSrc} alt={namaModul} className="object-cover" />
      </div>
      <h3 className="text-gray-500">Modul {namaModul}</h3>
    </Link>
  );
}
