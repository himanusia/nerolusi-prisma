"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { HiCheckCircle, HiClock, HiXCircle } from "react-icons/hi";
import LoadingPage from "~/app/loading";

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoice = searchParams.get("invoice");
  const [shouldPoll, setShouldPoll] = useState(true);

  // Poll the database for the status of this invoice
  const { data: payment, isLoading } = api.payment.getOrderByInvoice.useQuery(
    { invoice: invoice as string },
    {
      enabled: !!invoice,
      refetchInterval: shouldPoll ? 3000 : false,
    },
  );

  useEffect(() => {
    if (payment && payment.status !== "PENDING") {
      setShouldPoll(false);
    }
  }, [payment]);

  if (isLoading) return <LoadingPage />;

  if (!invoice) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[10px] bg-[#e9e6ef] p-4">
          <div className="flex items-center gap-4">
            <HiXCircle className="h-16 w-16 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-red-600">Error</h1>
              <p className="mt-1 text-gray-600">No invoice ID provided</p>
            </div>
          </div>
        </div>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <p className="text-gray-600">
                Silakan kembali ke halaman pembelian paket.
              </p>
              <Button
                onClick={() => router.push("/beli-paket")}
                className="w-full max-w-xs"
              >
                Kembali ke Beli Paket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (payment?.status === "SUCCESS") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[10px] bg-[#e9e6ef] p-4">
          <div className="flex items-center gap-4">
            <HiCheckCircle className="h-16 w-16 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-green-600">
                Pembayaran Berhasil!
              </h1>
              <p className="mt-1 text-gray-600">
                Transaksi Anda telah dikonfirmasi
              </p>
            </div>
          </div>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <HiCheckCircle className="h-24 w-24 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Terima Kasih!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-center text-gray-700">
                Paket Anda telah berhasil diaktifkan dan siap digunakan.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice:</span>
                <span className="font-semibold text-gray-900">{invoice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumlah:</span>
                <span className="font-semibold text-gray-900">
                  Rp {payment.amount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tipe Paket:</span>
                <span className="font-semibold uppercase text-gray-900">
                  {payment.type}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => router.push("/")} className="w-full">
                Kembali ke Dashboard
              </Button>
              <Button
                onClick={() => router.push("/beli-paket")}
                variant="outline"
                className="w-full"
              >
                Beli Paket Lainnya
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (payment?.status === "FAILED") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[10px] bg-[#e9e6ef] p-4">
          <div className="flex items-center gap-4">
            <HiXCircle className="h-16 w-16 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-red-600">
                Pembayaran Gagal
              </h1>
              <p className="mt-1 text-gray-600">
                Transaksi tidak dapat diselesaikan
              </p>
            </div>
          </div>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <HiXCircle className="h-24 w-24 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Oops! Terjadi Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-center text-gray-700">
                Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau
                hubungi customer service jika masalah berlanjut.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice:</span>
                <span className="font-semibold text-gray-900">{invoice}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/beli-paket")}
                className="w-full"
              >
                Coba Lagi
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[10px] bg-[#e9e6ef] p-4">
        <div className="flex items-center gap-4">
          <HiClock className="h-16 w-16 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-orange-600">
              Menunggu Pembayaran
            </h1>
            <p className="mt-1 text-gray-600">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin">
              <HiClock className="h-24 w-24 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Memproses Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-center text-gray-700">
              Kami sedang menunggu konfirmasi pembayaran Anda. Proses ini
              mungkin membutuhkan beberapa saat. Mohon jangan tutup halaman ini.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invoice:</span>
              <span className="font-semibold text-gray-900">{invoice}</span>
            </div>
            {payment?.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumlah:</span>
                <span className="font-semibold text-gray-900">
                  Rp {payment.amount.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Halaman ini akan otomatis diperbarui saat pembayaran terkonfirmasi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
