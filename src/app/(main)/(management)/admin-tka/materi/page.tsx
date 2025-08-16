"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Video,
  Clock,
  Target,
} from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Label } from "~/app/_components/ui/label";
import { Textarea } from "~/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";

type Subject = {
  id?: number;
  name?: string;
  type?: "wajib" | "saintek" | "soshum";
  createdAt?: string;
};

type Topic = {
  id?: number;
  index?: number;
  name?: string;
  materialId?: number;
  videoId?: string;
  subtestId?: string;
  createdAt?: string;
  video?: {
    id?: string;
    title?: string;
    url?: string;
    duration?: number;
  };
  subtest?: {
    id?: string;
    type?: string;
    duration?: number;
    questions?: Array<{
      id?: number;
      content?: string;
    }>;
  };
};

type Material = {
  id?: number;
  index?: number;
  name?: string;
  subjectId?: number;
  createdAt?: string;
  topics?: Topic[];
};

export default function AdminMateriPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(
    new Set(),
  );
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedMaterialForTopic, setSelectedMaterialForTopic] = useState<
    number | null
  >(null);

  const [materialForm, setMaterialForm] = useState({
    name: "",
    index: 0,
  });

  const [topicForm, setTopicForm] = useState({
    name: "",
    index: 0,
    videoTitle: "",
    videoUrl: "",
    videoDuration: 0,
  });

  // API queries
  const { data: subjects } = api.admin.getSubjects.useQuery();
  const { data: materials, refetch: refetchMaterials } =
    api.admin.getMaterialsBySubject.useQuery(
      { subjectId: selectedSubject?.id || 0 },
      { enabled: !!selectedSubject },
    );

  // API mutations
  const router = useRouter();
  const createMaterialMutation = api.admin.createMaterial.useMutation();
  const updateMaterialMutation = api.admin.updateMaterial.useMutation();
  const deleteMaterialMutation = api.admin.deleteMaterial.useMutation();
  const createTopicMutation = api.admin.createTopic.useMutation();
  const updateTopicMutation = api.admin.updateTopic.useMutation();
  const deleteTopicMutation = api.admin.deleteTopic.useMutation();
  const createTopicDrillMutation = api.admin.createTopicDrill.useMutation();

  // Utility functions
  const getNextMaterialIndex = () => {
    if (!materials || materials.length === 0) return 1;
    const maxIndex = Math.max(...materials.map((m) => m.index || 0));
    return maxIndex + 1;
  };

  const getNextTopicIndex = (materialId?: number) => {
    if (!materials || !materialId) return 1;
    const material = materials.find((m) => m.id === materialId);
    if (!material || !material.topics || material.topics.length === 0) return 1;
    const maxIndex = Math.max(...material.topics.map((t) => t.index || 0));
    return maxIndex + 1;
  };

  const isMaterialIndexTaken = (index: number, excludeId?: number) => {
    if (!materials) return false;
    return materials.some((m) => m.index === index && m.id !== excludeId);
  };

  // Form validation functions
  const isMaterialFormValid = () => {
    return (
      materialForm.name.trim() !== "" &&
      materialForm.index > 0 &&
      !isMaterialIndexTaken(materialForm.index, editingMaterial?.id)
    );
  };

  const isTopicFormValid = () => {
    return (
      topicForm.name.trim() !== "" &&
      topicForm.index > 0 &&
      topicForm.videoTitle.trim() !== "" &&
      topicForm.videoUrl.trim() !== "" &&
      topicForm.videoDuration > 0 &&
      !(
        selectedMaterialForTopic &&
        isTopicIndexTaken(
          selectedMaterialForTopic,
          topicForm.index,
          editingTopic?.id,
        )
      )
    );
  };

  const isTopicIndexTaken = (
    materialId: number,
    index: number,
    excludeId?: number,
  ) => {
    if (!materials) return false;
    const material = materials.find((m) => m.id === materialId);
    if (!material || !material.topics) return false;
    return material.topics.some((t) => t.index === index && t.id !== excludeId);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setExpandedMaterials(new Set());
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setExpandedMaterials(new Set());
  };

  const toggleMaterialExpanded = (materialId: number) => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedMaterials(newExpanded);
  };

  const handleCreateMaterial = async () => {
    if (!selectedSubject) return;

    try {
      await createMaterialMutation.mutateAsync({
        subjectId: selectedSubject.id,
        name: materialForm.name,
        index: materialForm.index,
      });
      toast.success("Material created successfully!");
      setIsMaterialDialogOpen(false);
      setMaterialForm({ name: "", index: 0 });
      await refetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to create material");
    }
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial?.id) return;

    try {
      await updateMaterialMutation.mutateAsync({
        id: editingMaterial.id,
        name: materialForm.name,
        index: materialForm.index,
      });
      toast.success("Material updated successfully!");
      setIsMaterialDialogOpen(false);
      setEditingMaterial(null);
      setMaterialForm({ name: "", index: 0 });
      await refetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to update material");
    }
  };

  const handleDeleteMaterial = async (materialId?: number) => {
    if (!materialId) return;
    if (
      !confirm(
        "Are you sure you want to delete this material? This will also delete all topics in this material.",
      )
    )
      return;

    try {
      await deleteMaterialMutation.mutateAsync({ id: materialId });
      toast.success("Material deleted successfully!");
      await refetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete material");
    }
  };

  const handleCreateTopic = async () => {
    if (!selectedMaterialForTopic) return;

    try {
      await createTopicMutation.mutateAsync({
        materialId: selectedMaterialForTopic,
        name: topicForm.name,
        index: topicForm.index,
        videoTitle: topicForm.videoTitle,
        videoUrl: topicForm.videoUrl,
        videoDuration: topicForm.videoDuration,
      });
      toast.success("Topic created successfully!");
      setIsTopicDialogOpen(false);
      setSelectedMaterialForTopic(null);
      setTopicForm({
        name: "",
        index: 0,
        videoTitle: "",
        videoUrl: "",
        videoDuration: 0,
      });
      await refetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to create topic");
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic?.id) return;

    try {
      await updateTopicMutation.mutateAsync({
        id: editingTopic.id,
        name: topicForm.name,
        index: topicForm.index,
        videoTitle: topicForm.videoTitle,
        videoUrl: topicForm.videoUrl,
        videoDuration: topicForm.videoDuration,
      });
      toast.success("Topic updated successfully!");
      setIsTopicDialogOpen(false);
      setEditingTopic(null);
      setTopicForm({
        name: "",
        index: 0,
        videoTitle: "",
        videoUrl: "",
        videoDuration: 0,
      });
      await refetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to update topic");
    }
  };

  const handleDeleteTopic = async (topicId?: number) => {
    if (!topicId) return;
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await deleteTopicMutation.mutateAsync({ id: topicId });
      toast.success("Topic deleted successfully!");
      await refetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete topic");
    }
  };

  const handleCreateDrill = async (topic: Topic) => {
    if (!topic.id || !topic.name) return;

    // Check if drill already exists (has questions)
    const hasDrill =
      topic.subtest?.questions && topic.subtest.questions.length > 0;

    if (hasDrill && topic.subtest?.id) {
      // Navigate to edit existing drill
      router.push(`/admin/quiz-edit/${topic.subtest.id}`);
      return;
    }

    // Create new drill
    try {
      const drill = await createTopicDrillMutation.mutateAsync({
        topicId: topic.id,
        topicName: topic.name,
      });
      toast.success("Drill created successfully!");
      // Navigate to the subtest edit page
      router.push(`/admin/quiz-edit/${drill.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create drill");
    }
  };

  const getDrillButtonText = (topic: Topic) => {
    const hasDrill =
      topic.subtest?.questions && topic.subtest.questions.length > 0;
    return hasDrill ? "Edit Drill" : "Create Drill";
  };

  const openEditMaterialDialog = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name || "",
      index: material.index || 0,
    });
    setIsMaterialDialogOpen(true);
  };

  const openEditTopicDialog = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({
      name: topic.name || "",
      index: topic.index || 0,
      videoTitle: topic.video?.title || "",
      videoUrl: topic.video?.url || "",
      videoDuration: topic.video?.duration || 0,
    });
    setIsTopicDialogOpen(true);
  };

  const openCreateTopicDialog = (materialId?: number) => {
    if (!materialId) return;
    setSelectedMaterialForTopic(materialId);
    setEditingTopic(null);
    setTopicForm({
      name: "",
      index: getNextTopicIndex(materialId),
      videoTitle: "",
      videoUrl: "",
      videoDuration: 0,
    });
    setIsTopicDialogOpen(true);
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

  if (!selectedSubject) {
    // Show subjects selection
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

  // Show materials for selected subject
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBackToSubjects}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedSubject.name} - Materials
          </h1>
          <p className="text-gray-600">
            Manage materials and topics for {selectedSubject.name}
          </p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            setEditingMaterial(null);
            setMaterialForm({ name: "", index: getNextMaterialIndex() });
            setIsMaterialDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {materials?.map((material) => (
          <Card key={material.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => material.id && toggleMaterialExpanded(material.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {material.id && expandedMaterials.has(material.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {material.index}. {material.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {material.topics?.length || 0} topics
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateTopicDialog(material.id);
                    }}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Topic
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditMaterialDialog(material);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMaterial(material.id);
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {material.id && expandedMaterials.has(material.id) && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {material.topics?.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {topic.index}. {topic.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            Video & Quiz available
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateDrill(topic)}
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          title={getDrillButtonText(topic)}
                        >
                          <Target className="h-4 w-4" />
                          <span className="ml-1 text-xs">
                            {getDrillButtonText(topic)}
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditTopicDialog(topic)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!material.topics || material.topics.length === 0) && (
                    <div className="py-8 text-center text-gray-500">
                      <Video className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No topics yet. Add your first topic to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {(!materials || materials.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="mb-2 text-lg font-medium">No materials found</h3>
                <p>Add your first material to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Material Dialog */}
      <Dialog
        open={isMaterialDialogOpen}
        onOpenChange={setIsMaterialDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? "Edit Material" : "Add New Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Material Name *</Label>
              <Input
                value={materialForm.name}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, name: e.target.value })
                }
                placeholder="Enter material name"
                required
                className={
                  materialForm.name.trim() === "" ? "border-red-500" : ""
                }
              />
              {materialForm.name.trim() === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Material name is required
                </p>
              )}
            </div>
            <div>
              <Label>Index (Order) *</Label>
              <Input
                type="number"
                value={materialForm.index}
                onChange={(e) =>
                  setMaterialForm({
                    ...materialForm,
                    index: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter order index"
                required
                min="1"
                className={
                  isMaterialIndexTaken(
                    materialForm.index,
                    editingMaterial?.id,
                  ) || materialForm.index <= 0
                    ? "border-red-500"
                    : ""
                }
              />
              {materialForm.index <= 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Index must be greater than 0
                </p>
              )}
              {materialForm.index > 0 &&
                isMaterialIndexTaken(
                  materialForm.index,
                  editingMaterial?.id,
                ) && (
                  <p className="mt-1 text-sm text-red-500">
                    Index {materialForm.index} is already taken. Next available:{" "}
                    {getNextMaterialIndex()}
                  </p>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={
                editingMaterial ? handleUpdateMaterial : handleCreateMaterial
              }
              disabled={
                createMaterialMutation.isPending ||
                updateMaterialMutation.isPending ||
                !isMaterialFormValid()
              }
            >
              {editingMaterial ? "Update Material" : "Add Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? "Edit Topic" : "Add New Topic"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Topic Name *</Label>
              <Input
                value={topicForm.name}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, name: e.target.value })
                }
                placeholder="Enter topic name"
                required
                className={topicForm.name.trim() === "" ? "border-red-500" : ""}
              />
              {topicForm.name.trim() === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Topic name is required
                </p>
              )}
            </div>
            <div>
              <Label>Index (Order) *</Label>
              <Input
                type="number"
                value={topicForm.index}
                onChange={(e) =>
                  setTopicForm({
                    ...topicForm,
                    index: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter order index"
                required
                min="1"
                className={
                  (selectedMaterialForTopic &&
                    isTopicIndexTaken(
                      selectedMaterialForTopic,
                      topicForm.index,
                      editingTopic?.id,
                    )) ||
                  topicForm.index <= 0
                    ? "border-red-500"
                    : ""
                }
              />
              {topicForm.index <= 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Index must be greater than 0
                </p>
              )}
              {topicForm.index > 0 &&
                selectedMaterialForTopic &&
                isTopicIndexTaken(
                  selectedMaterialForTopic,
                  topicForm.index,
                  editingTopic?.id,
                ) && (
                  <p className="mt-1 text-sm text-red-500">
                    Index {topicForm.index} is already taken. Next available:{" "}
                    {getNextTopicIndex(selectedMaterialForTopic)}
                  </p>
                )}
            </div>

            <div>
              <Label>Video Title *</Label>
              <Input
                value={topicForm.videoTitle}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, videoTitle: e.target.value })
                }
                placeholder="Enter video title"
                required
                className={
                  topicForm.videoTitle.trim() === "" ? "border-red-500" : ""
                }
              />
              {topicForm.videoTitle.trim() === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Video title is required
                </p>
              )}
            </div>
            <div>
              <Label>Video URL *</Label>
              <Input
                value={topicForm.videoUrl}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, videoUrl: e.target.value })
                }
                placeholder="Enter YouTube URL or video ID"
                required
                className={
                  topicForm.videoUrl.trim() === "" ? "border-red-500" : ""
                }
              />
              {topicForm.videoUrl.trim() === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Video URL is required
                </p>
              )}
            </div>
            <div>
              <Label>Video Duration (seconds) *</Label>
              <Input
                type="number"
                value={topicForm.videoDuration}
                onChange={(e) =>
                  setTopicForm({
                    ...topicForm,
                    videoDuration: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter duration in seconds"
                required
                min="1"
                className={topicForm.videoDuration <= 0 ? "border-red-500" : ""}
              />
              {topicForm.videoDuration <= 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Video duration must be greater than 0 seconds
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}
              disabled={
                createTopicMutation.isPending ||
                updateTopicMutation.isPending ||
                !isTopicFormValid()
              }
            >
              {editingTopic ? "Update Topic" : "Add Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
