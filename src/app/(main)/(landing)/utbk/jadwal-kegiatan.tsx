"use client";

import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function JadwalKegiatan() {
  const { data: events, isLoading } = api.event.getAllEvents.useQuery({
    limit: 4,
  });
  const getStatusBadge = (event: any) => {
    const now = new Date();
    const startTime = event.startTime ? new Date(event.startTime) : null;
    const endTime = event.endTime ? new Date(event.endTime) : null;

    // If event has ended
    if (endTime && endTime < now) {
      return {
        label: "Selesai",
        variant: "outline" as const,
        className:
          "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
      };
    }

    // If event is ongoing (started but not ended, or no end time)
    if (startTime && startTime <= now && (!endTime || endTime >= now)) {
      return {
        label: "Sedang Berlangsung",
        variant: "default" as const,
        className:
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
      };
    }

    // If event hasn't started yet
    if (startTime && startTime > now) {
      return {
        label: "Akan Berlangsung",
        variant: "secondary" as const,
        className:
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
      };
    }

    // Default case
    return {
      label: "Tidak Diketahui",
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
    };
  };

  const getActionButton = (event: any) => {
    const now = new Date();
    const startTime = event.startTime ? new Date(event.startTime) : null;
    const endTime = event.endTime ? new Date(event.endTime) : null;

    // Event has ended
    if (endTime && endTime < now) {
      return { label: "Lihat Detail", disabled: false };
    }

    // Event is ongoing
    if (startTime && startTime <= now && (!endTime || endTime >= now)) {
      return { label: "Join", disabled: false };
    }

    // Event hasn't started
    return { label: "Pelajari", disabled: false };
  };

  const formatDateTime = (event: any) => {
    const startTime = event.startTime ? new Date(event.startTime) : null;
    const endTime = event.endTime ? new Date(event.endTime) : null;

    // If both start and end times exist and they're different days
    if (startTime && endTime) {
      const startDate = format(startTime, "dd MMMM yyyy", { locale: localeId });
      const endDate = format(endTime, "dd MMMM yyyy", { locale: localeId });
      const startDateShort = format(startTime, "dd MMM yyyy", {
        locale: localeId,
      });
      const endDateShort = format(endTime, "dd MMM yyyy", { locale: localeId });

      if (startDate === endDate) {
        // Same day, show date and time range
        return {
          full: `${startDate}\n${format(startTime, "HH:mm", { locale: localeId })} - ${format(endTime, "HH:mm", { locale: localeId })} WIB`,
          short: `${startDateShort}\n${format(startTime, "HH:mm", { locale: localeId })} - ${format(endTime, "HH:mm", { locale: localeId })} WIB`,
        };
      } else {
        // Different days, show date range
        return {
          full: `${startDate} - ${endDate}`,
          short: `${startDateShort} - ${endDateShort}`,
        };
      }
    }

    // If only start time exists
    if (startTime) {
      const fullDate = format(startTime, "dd MMMM yyyy", { locale: localeId });
      const shortDate = format(startTime, "dd MMM yyyy", { locale: localeId });
      return {
        full: `${fullDate}\n${format(startTime, "HH:mm", { locale: localeId })} WIB`,
        short: `${shortDate}\n${format(startTime, "HH:mm", { locale: localeId })} WIB`,
      };
    }

    return {
      full: "Tanggal belum ditentukan",
      short: "Tanggal belum ditentukan",
    };
  };

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Jadwal Kegiatan</h3>
          <p className="text-gray-600">
            Jangan lupa, berikut adalah kegiatan kamu!
          </p>
        </div>
        {/* <Button variant="outline" size="sm">
          Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
        </Button> */}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          Memuat kegiatan...
        </div>
      ) : !events || events.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada kegiatan yang dijadwalkan
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const status = getStatusBadge(event);
            const actionButton = getActionButton(event);
            const dateTime = formatDateTime(event);

            return (
              <Card
                key={event.id}
                className="relative overflow-hidden border-0 bg-[#e9e6ef]"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                      <span className="text-lg">
                        <CalendarIcon className="text-white" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-green-700">
                                {event.title}
                              </h4>
                            </div>
                            {event.description && (
                              <p className="text-sm font-medium text-gray-900">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={status.variant}
                          className={`shrink-0 ${status.className}`}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="hidden whitespace-pre-line md:inline">
                            {dateTime.full}
                          </span>
                          <span className="whitespace-pre-line md:hidden">
                            {dateTime.short}
                          </span>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            disabled={actionButton.disabled}
                            onClick={() => {
                              if (event.url) {
                                window.open(event.url, "_blank");
                              }
                            }}
                          >
                            {actionButton.label}{" "}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
