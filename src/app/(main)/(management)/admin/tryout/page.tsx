"use client";

import React, { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/app/_components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import LoadingPage from "~/app/loading";
import ErrorPage from "~/app/error";
import { TryoutDialog } from "./tryout-dialog";
import { TryoutCard } from "./tryout-card";
import { TryoutFilters } from "./tryout-filters";
import { EmptyState } from "./empty-state";

export default function TryoutPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMode, setActiveMode] = useState<"tka" | "utbk">("tka");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: 120,
    maxParticipants: 100,
    mode: "tka" as "tka" | "utbk",
  });

  const {
    data: tryouts,
    refetch,
    isLoading,
    isError,
  } = api.admin.getTryouts.useQuery();
  const createTryoutMutation = api.admin.createTryout.useMutation();
  const deleteTryoutMutation = api.admin.deleteTryout.useMutation();

  // Filter tryouts by active mode
  const modeFilteredTryouts = tryouts?.filter(
    (tryout) => tryout.mode === activeMode,
  );

  const filteredTryouts = modeFilteredTryouts?.filter((tryout) =>
    tryout.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateTryout = async () => {
    // Validate form
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.startDate ||
      !formData.endDate ||
      formData.duration <= 0 ||
      formData.maxParticipants <= 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await createTryoutMutation.mutateAsync(formData);
      toast.success("Tryout created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: 120,
        maxParticipants: 100,
        mode: activeMode,
      });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create tryout");
    }
  };

  const handleDeleteTryout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tryout?")) return;

    try {
      await deleteTryoutMutation.mutateAsync({ id });
      toast.success("Tryout deleted successfully!");
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tryout");
    }
  };

  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Tryout Management
          </h1>
          <p className="text-gray-600">
            Create and manage TKA and UTBK tryout packages
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => {
            setFormData((prev) => ({ ...prev, mode: activeMode }));
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Tryout
        </Button>
      </div>

      {/* Create Tryout Dialog */}
      <TryoutDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateTryout}
        isPending={createTryoutMutation.isPending}
        activeMode={activeMode}
      />

      {/* Tabs and Content */}
      <Tabs
        value={activeMode}
        onValueChange={(value: any) => setActiveMode(value)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tka">TKA Tryouts</TabsTrigger>
          <TabsTrigger value="utbk">UTBK Tryouts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeMode} className="space-y-6">
          {/* Search */}
          <TryoutFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Tryouts Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTryouts?.map((tryout) => (
              <TryoutCard
                key={tryout.id}
                tryout={{
                  ...tryout,
                  startDate: tryout.startDate ? new Date(tryout.startDate) : undefined,
                  endDate: tryout.endDate ? new Date(tryout.endDate) : undefined,
                }}
                onDelete={handleDeleteTryout}
              />
            ))}
          </div>

          {filteredTryouts?.length === 0 && <EmptyState mode={activeMode} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
