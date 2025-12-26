import React from "react";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Calendar } from "lucide-react";

interface EmptyStateProps {
  mode: string;
}

export function EmptyState({ mode }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="text-gray-500">
          <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="mb-2 text-lg font-medium">
            No {mode.toUpperCase()} tryouts found
          </h3>
          <p>Create your first tryout to get started.</p>
        </div>
      </CardContent>
    </Card>
  );
}
