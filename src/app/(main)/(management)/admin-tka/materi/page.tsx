"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

type Subject = {
  id?: number;
  name?: string;
  type?: "wajib" | "saintek" | "soshum" | "utbk" | "modul_nerolusi";
  createdAt?: string;
};

export default function AdminMateriPage() {
  const { data: subjects } = api.admin.getAllSubjects.useQuery();
  const router = useRouter();

  const handleSubjectSelect = (subject: Subject) => {
    if (subject.name) {
      router.push(`/admin-tka/materi/${encodeURIComponent(subject.name)}`);
    }
  };

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case "wajib":
        return "bg-blue-500";
      case "saintek":
        return "bg-green-500";
      case "soshum":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSubjectTypeLabel = (type: string) => {
    switch (type) {
      case "wajib":
        return "Wajib";
      case "saintek":
        return "Saintek";
      case "soshum":
        return "Soshum";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin-tka">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TKA
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Material Management
          </h1>
          <p className="text-gray-600">
            Select a subject to manage materials and topics
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects?.map((subject) => (
          <Card
            key={subject.id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => subject.id && handleSubjectSelect(subject)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <Badge
                  className={`text-white ${getSubjectTypeColor(subject.type || "")}`}
                >
                  {getSubjectTypeLabel(subject.type || "")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                Click to manage materials
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!subjects || subjects.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No subjects found</h3>
              <p>No subjects are available in the system.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
