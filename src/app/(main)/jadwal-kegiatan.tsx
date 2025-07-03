"use client";

import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import { Badge } from "../_components/ui/badge";
import { CalendarIcon, ChevronRight } from "lucide-react";

// Dummy data for schedule activities
const dummyActivities = [
  {
    id: 1,
    type: "class",
    title: "Kelas Reguler",
    subtitle: "Kelas Penalaran Kuantitatif (PK)",
    status: "ongoing",
    date: "19 November 2025",
    time: "19:30 WIB",
  },
  {
    id: 2,
    type: "tryout",
    title: "Try Out",
    subtitle: "Try out 3 SNBT",
    status: "upcoming",
    dateRange: "23 November - 30 November 2025",
  },
  {
    id: 3,
    type: "class",
    title: "Kelas Reguler",
    subtitle: "Kelas Literasi Bahasa Indonesia (LBI)",
    status: "ongoing",
    date: "20 November 2025",
    time: "14:00 WIB",
  },
  {
    id: 4,
    type: "tryout",
    title: "Try Out",
    subtitle: "Try out Penalaran Matematika",
    status: "finished",
    date: "15 November 2025",
  },
];

export default function JadwalKegiatan() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return {
          label: "Sedang Berlangsung",
          variant: "default" as const,
          className:
            "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
        };
      case "upcoming":
        return {
          label: "Akan Berlangsung",
          variant: "secondary" as const,
          className:
            "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
        };
      case "finished":
        return {
          label: "Selesai",
          variant: "outline" as const,
          className:
            "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
        };
      default:
        return {
          label: "Tidak Diketahui",
          variant: "outline" as const,
          className:
            "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
        };
    }
  };

  const getActionButton = (activity: any) => {
    if (activity.type === "tryout") {
      if (activity.status === "upcoming") {
        return { label: "Pelajari", disabled: false };
      } else if (activity.status === "ongoing") {
        return { label: "Join", disabled: false };
      } else {
        return { label: "Lihat Hasil", disabled: false };
      }
    } else {
      return { label: "Join", disabled: false };
    }
  };

  const formatDateTime = (activity: any) => {
    if (activity.dateRange) {
      return activity.dateRange;
    } else if (activity.date && activity.time) {
      return `${activity.date}\n${activity.time}`;
    } else if (activity.date) {
      return activity.date;
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Jadwal Kegiatan</h3>
          <p className="text-gray-600">
            Jangan lupa, berikut adalah kegiatan kamu!
          </p>
        </div>
        <Button variant="outline" size="sm">
          Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {dummyActivities.slice(0, 4).map((activity) => {
          const status = getStatusBadge(activity.status);
          const actionButton = getActionButton(activity);

          return (
            <Card
              key={activity.id}
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
                              {activity.title}
                            </h4>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.subtitle}
                          </p>
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
                        <span className="whitespace-pre-line">
                          {formatDateTime(activity)}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          disabled={actionButton.disabled}
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

      {dummyActivities.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada kegiatan yang dijadwalkan
        </div>
      )}
    </div>
  );
}
