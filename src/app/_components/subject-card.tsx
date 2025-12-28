import Image from "next/image";
import Link from "next/link";

interface SubjectCardProps {
  href: string;
  imageSrc: string;
  title: string;
}

const SubjectCard = ({ href, imageSrc, title }: SubjectCardProps) => {
  return (
    <Link
      href={href}
      className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border border-[#2b8057] bg-white px-1 py-2 transition-all duration-200 hover:scale-105 hover:shadow-lg md:p-3"
    >
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-[9px] bg-[#2b8057] p-2 shadow-sm">
        <Image
          src={imageSrc}
          alt={title}
          width={50}
          height={50}
          className="object-cover"
        />
      </div>
      <h3 className="text-center text-[11px] font-medium leading-tight text-[#545454] md:text-sm">
        {title}
      </h3>
    </Link>
  );
};

export default SubjectCard;
