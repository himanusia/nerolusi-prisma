import React from "react";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Play } from "lucide-react";

interface EmptyStateProps {
  mode: string;
}

export function EmptyState({ mode }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="text-gray-500">
          <Play className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="mb-2 text-lg font-medium">
            No {mode.toUpperCase()} videos found
          </h3>
          <p>Add your first video to get started.</p>
        </div>
      </CardContent>
    </Card>
  );
}
