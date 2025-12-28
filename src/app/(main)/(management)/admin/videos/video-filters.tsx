import React from "react";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Search } from "lucide-react";

interface VideoFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function VideoFilters({
  searchQuery,
  onSearchChange,
}: VideoFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
