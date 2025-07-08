interface ModulCardProps {
  namaModul: string;
  imageSrc: string;
}

export default function ModulCard({ namaModul, imageSrc }: ModulCardProps) {
  return (
    <div className="flex h-32 w-36 flex-col items-center justify-center border border-green-700 p-2 rounded-lg gap-2">
      <div className="flex size-16 items-center justify-center rounded-lg bg-green-700 p-2">
        <img src={imageSrc} alt={namaModul} className="object-cover" />
      </div>
      <h3 className="text-gray-500">{namaModul}</h3>
    </div>
  );
}
