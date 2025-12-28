import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Badge } from "~/app/_components/ui/badge";
import { Edit, Trash2, Calendar, Users } from "lucide-react";
import Link from "next/link";

interface TryoutCardProps {
  tryout: {
    id?: string;
    name?: string;
    description?: string | null;
    startDate?: Date;
    endDate?: Date;
    duration?: number;
    maxParticipants?: number;
    participants?: number;
    isActive?: boolean;
    mode?: "tka" | "utbk" | null;
  };
  onDelete: (id: string) => void;
}

export function TryoutCard({ tryout, onDelete }: TryoutCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{tryout.name}</CardTitle>
            <p className="mt-1 text-sm text-gray-600">{tryout.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={tryout.isActive ? "default" : "secondary"}>
              {tryout.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{tryout.mode?.toUpperCase()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {new Date(tryout.startDate).toLocaleDateString()} -{" "}
            {new Date(tryout.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {tryout.participants}/{tryout.maxParticipants} participants
          </div>
          <div className="text-sm text-gray-600">
            Duration: {tryout.duration} minutes
          </div>

          <div className="flex gap-2 pt-3">
            <Link href={`/admin/tryout/${tryout.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(tryout.id)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
