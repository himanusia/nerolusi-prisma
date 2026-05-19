import { Button } from "./_components/ui/button";
import Link from "next/link";

export default function NoClassPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Anda tidak terdaftar pada kelas apapun</h1>
      <p className="text-gray-600">Silakan kontak admin jika ini adalah kesalahan.</p>
      <Button variant="default" className="mt-4">
        <Link href="https://wa.me/6285591402079">Kontak Admin</Link>
      </Button>
    </div>
  );
}
