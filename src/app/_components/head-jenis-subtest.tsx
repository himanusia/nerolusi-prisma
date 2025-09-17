import { HiMiniVideoCamera } from "react-icons/hi2";
import { Button } from "./ui/button";
import { SubtestType } from "@prisma/client";
import { GiOpenBook } from "react-icons/gi";

interface HeadJenisSubtestProps {
  title: string;
  type: "modul" | "rekaman";
  isTka: boolean;
}

export default function HeadJenisSubtest({
  title,
  type,
  isTka,
}: HeadJenisSubtestProps) {
  return (
    <div className="flex items-center rounded-lg ">
      <div className="hidden w-full items-center sm:flex">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#2B8057]">
          {type === "rekaman" ? (
            <HiMiniVideoCamera className="size-10 text-white" />
          ) : (
            <GiOpenBook className="size-10 text-white" />
          )}
        </div>
        <div className="ml-4 flex w-full flex-col justify-between gap-4">
          <h2 className="font-bold text-[#2B8057] text-3xl">
            {title}
          </h2>
          {/* {!isTka && (
            <div className="flex w-full max-w-4xl flex-wrap justify-evenly gap-2">
              {Object.values(SubtestType).map((type) => (
                <Button key={type} className="flex-1 text-xs text-white">
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          )} */}
          
        </div>
      </div>
      <div className="flex w-full flex-col justify-center gap-4 sm:hidden">
        <div className="flex items-center w-full justify-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#2B8057]">
            {type === "rekaman" ? (
              <HiMiniVideoCamera className="size-6 text-white" />
            ) : (
              <GiOpenBook className="size-6 text-white" />
            )}
          </div>
          <h2 className="ml-4 text-xl font-bold text-[#2B8057]">{title}</h2>
        </div>
        {/* {!isTka && (
          <div className="flex w-full max-w-4xl flex-wrap justify-evenly gap-2">
            {Object.values(SubtestType).map((type) => (
              <Button key={type} className="flex-1 text-xs text-white">
                {type.toUpperCase()}
              </Button>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
