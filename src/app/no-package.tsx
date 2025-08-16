"use client";

import { Button } from "./_components/ui/button";
import Link from "next/link";

export default function NoPackagePage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Tidak Ada Paket yang Tersedia</h1>
            <p className="text-gray-600">Silakan beli paket yang tersedia.</p>
            <Button variant="default" className="mt-4">
                <Link href="/beli-paket">Beli Paket</Link>
            </Button>
        </div>
    )
}
