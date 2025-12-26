import React from "react";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Search } from "lucide-react";

interface TryoutFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function TryoutFilters({
  searchQuery,
  onSearchChange,
}: TryoutFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search tryouts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardContent>
    </Card>
  );
}
