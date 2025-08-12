import { Switch } from "~/app/_components/ui/switch";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Mode() {
  const router = useRouter();
  const pathname =usePathname();


  const [isUTBK, setIsUTBK] = useState(() => {
    return pathname === "/utbk" || pathname.startsWith("/utbk/");
  });

  useEffect(() => {
    setIsUTBK(pathname === "/utbk" || pathname.startsWith("/utbk/"));
  }, [pathname]);

  const handleModeChange = (checked: boolean) => {
    setIsUTBK(checked);
    if (checked) {
      router.push("/utbk");
    } else {
      router.push("/tka");
    }
  };
  return (
    <div className="flex flex-col border border-[#acaeba] rounded-[10px] p-1 items-center justify-center">
      <p className="text-xs text-center">Mode:</p>
      <Switch
        checked={isUTBK}
        onCheckedChange={handleModeChange}
        leftLabel="TKA"
        rightLabel="UTBK"
        // disabled={true}
      />
    </div>
  );
}
