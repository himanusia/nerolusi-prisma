"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { toast } from "sonner";
import { FiEdit2, FiSearch } from "react-icons/fi";
import { HiUser } from "react-icons/hi";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/app/_components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import { signOut } from "next-auth/react";

export default function ProfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Major choices state
  const [majorChoices, setMajorChoices] = useState<
    Array<{
      choiceNumber: number;
      universityId: number | null;
      majorId: number | null;
      universityName: string;
      majorName: string;
    }>
  >([
    { choiceNumber: 1, universityId: null, majorId: null, universityName: "", majorName: "" },
    { choiceNumber: 2, universityId: null, majorId: null, universityName: "", majorName: "" },
    { choiceNumber: 3, universityId: null, majorId: null, universityName: "", majorName: "" },
    { choiceNumber: 4, universityId: null, majorId: null, universityName: "", majorName: "" },
  ]);

  const [searchUniversity, setSearchUniversity] = useState<string[]>(["", "", "", ""]);
  const [searchMajor, setSearchMajor] = useState<string[]>(["", "", "", ""]);
  const [openUniversity, setOpenUniversity] = useState<boolean[]>([false, false, false, false]);
  const [openMajor, setOpenMajor] = useState<boolean[]>([false, false, false, false]);

  // Queries
  const { data: profileData, refetch: refetchProfile } = api.user.getProfile.useQuery();
  const { data: universities } = api.user.getAllUniversities.useQuery({
    search: undefined,
  });

  // Mutations
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil berhasil diupdate");
      refetchProfile();
      setIsEditingName(false);
      setIsEditingSchool(false);
      setIsEditingBirthDate(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMajorChoices = api.user.updateMajorChoices.useMutation({
    onSuccess: () => {
      toast.success("Pilihan jurusan berhasil disimpan");
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get majors by university
  const getMajorsQuery = (universityId: number | null) => {
    return api.user.getMajorsByUniversity.useQuery(
      { universityId: universityId!, search: undefined },
      { enabled: !!universityId }
    );
  };

  const majorsData = [
    getMajorsQuery(majorChoices[0]?.universityId),
    getMajorsQuery(majorChoices[1]?.universityId),
    getMajorsQuery(majorChoices[2]?.universityId),
    getMajorsQuery(majorChoices[3]?.universityId),
  ];

  // Initialize profile data
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || "");
      setSchool(profileData.school || "");
      setBirthDate(
        profileData.birthDate
          ? new Date(profileData.birthDate).toISOString().split("T")[0]!
          : ""
      );

      // Initialize major choices
      const existingChoices = profileData.majorChoices;
      const newMajorChoices = [1, 2, 3, 4].map((choiceNum) => {
        const existing = existingChoices.find((c) => c.choiceNumber === choiceNum);
        if (existing) {
          return {
            choiceNumber: choiceNum,
            universityId: existing.major.universityId,
            majorId: existing.majorId,
            universityName: existing.major.university.name,
            majorName: existing.major.name,
          };
        }
        return {
          choiceNumber: choiceNum,
          universityId: null,
          majorId: null,
          universityName: "",
          majorName: "",
        };
      });
      setMajorChoices(newMajorChoices);
    }
  }, [profileData]);

  const handleUpdateProfile = (field: "name" | "school" | "birthDate") => {
    const data: any = {};
    if (field === "name") data.name = name;
    if (field === "school") data.school = school;
    if (field === "birthDate") data.birthDate = new Date(birthDate);

    updateProfile.mutate(data);
  };

  const handleSaveMajorChoices = () => {
    const choices = majorChoices
      .filter((choice) => choice.majorId !== null)
      .map((choice) => ({
        choiceNumber: choice.choiceNumber,
        majorId: choice.majorId!,
      }));

    updateMajorChoices.mutate({ choices });
  };

  const handleUniversitySelect = (index: number, universityId: number, universityName: string) => {
    const newChoices = [...majorChoices];
    newChoices[index] = {
      ...newChoices[index]!,
      universityId,
      universityName,
      majorId: null,
      majorName: "",
    };
    setMajorChoices(newChoices);
    
    const newOpen = [...openUniversity];
    newOpen[index] = false;
    setOpenUniversity(newOpen);
  };

  const handleMajorSelect = (index: number, majorId: number, majorName: string) => {
    const newChoices = [...majorChoices];
    newChoices[index] = {
      ...newChoices[index]!,
      majorId,
      majorName,
    };
    setMajorChoices(newChoices);
    
    const newOpen = [...openMajor];
    newOpen[index] = false;
    setOpenMajor(newOpen);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (!session) {
    return null;
  }
  return (
    <div className="min-h-screen relative left-1/2 -ml-[50vw] md:-ml-[50.6vw] -mt-[1vw] w-screen bg-gradient-to-b from-[#4fe99f] via-white to-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-10 justify-between w-full">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-700 hover:text-gray-900 border border-gray-300 bg-white"
          >
            ← Kembali
          </Button>
          <div className="w-full bg-white rounded-md py-1.5 px-4 border border-gray-300 flex flex-row items-center gap-2">
            <HiUser className="h-4 w-4" />
            <h1 className="text-lg text-gray-800">Profil</h1>
          </div>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Card - Profile Info */}
          <div className="space-y-4 bg-white rounded-lg p-10 border border-gray-300">
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={profileData?.image || ""} />
                <AvatarFallback className="text-4xl bg-gray-200">
                  {profileData?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Email (read-only) */}
            <p className="text-center text-md text-gray-600 mb-6 font-bold">{profileData?.email}</p>

            {/* Name Card */}
            <div className="rounded-2xl border-2 border-gray-300 bg-white overflow-hidden">
              <div className="flex items-center">
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="p-4">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-center text-2xl font-semibold border-2"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => handleUpdateProfile("name")}
                          disabled={updateProfile.isPending}
                          className="flex-1s"
                          size="sm"
                        >
                          Simpan
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingName(false);
                            setName(profileData?.name || "");
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-center text-2xl font-semibold text-gray-900">
                      {profileData?.name || "-"}
                    </div>
                  )}
                </div>
                {!isEditingName && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="px-6 py-6 hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit2 className="h-6 w-6 text-gray-700" />
                  </button>
                )}
              </div>
            </div>

            {/* School Card */}
            <div className="rounded-2xl border-2 border-gray-300 bg-white overflow-hidden flex flex-row">
              <div className="flex flex-col items-center justify-center w-full flex-1 border border-gray-300 rounded-xl">
                <div className="bg-gray-500 px-6 py-3 w-full rounded-lg">
                  <h3 className="text-center text-lg font-bold text-white">Asal Sekolah</h3>
                </div>
                <div className="flex-1 w-full">
                  {isEditingSchool ? (
                    <div className="p-4">
                      <Input
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="text-center text-xl border-2"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => handleUpdateProfile("school")}
                          disabled={updateProfile.isPending}
                          className="flex-1"
                          size="sm"
                        >
                          Simpan
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingSchool(false);
                            setSchool(profileData?.school || "");
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-center text-xl text-gray-900">
                      {profileData?.school || "-"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                
                {!isEditingSchool && (
                  <button
                    onClick={() => setIsEditingSchool(true)}
                    className="px-6 py-6 hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit2 className="h-6 w-6 text-gray-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Birth Date Card */}
            <div className="rounded-2xl border-2 border-gray-300 bg-white overflow-hidden flex flex-row">
              <div className="flex flex-col items-center justify-center w-full flex-1 border border-gray-300 rounded-xl">
                <div className="bg-gray-500 px-6 py-3 w-full rounded-lg">
                  <h3 className="text-center text-lg font-bold text-white">Tanggal Lahir</h3>
                </div>
                <div className="flex-1 w-full">
                  {isEditingBirthDate ? (
                    <div className="p-4">
                      <Input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="text-center text-xl border-2"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => handleUpdateProfile("birthDate")}
                          disabled={updateProfile.isPending}
                          className="flex-1"
                          size="sm"
                        >
                          Simpan
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingBirthDate(false);
                            setBirthDate(
                              profileData?.birthDate
                                ? new Date(profileData.birthDate).toISOString().split("T")[0]!
                                : ""
                            );
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-center text-xl text-gray-900">
                      {birthDate
                        ? new Date(birthDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                
                {!isEditingBirthDate && (
                  <button
                    onClick={() => setIsEditingBirthDate(true)}
                    className="px-6 py-6 hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit2 className="h-6 w-6 text-gray-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full py-6 text-lg font-bold"
            >
              Logout
            </Button>
          </div>

          {/* Right Card - Dream Majors */}
          <div className="rounded-lg bg-white p-8 border border-gray-300">
            <h2 className="mb-8 text-center text-4xl font-bold text-gray-900">
              Jurusan Impian
            </h2>

            <div className="rounded-3xl bg-gradient-to-b from-[#223a67] to-[#2d69db] p-6">
              <div className="space-y-4">
                {majorChoices.map((choice, index) => (
                  <div key={choice.choiceNumber} className="flex items-center rounded-xl bg-gradient-to-b from-[#2b8057] to-[#32b274]">
                    {/* Vertical Text */}
                    <div className="flex w-16 flex-shrink-0 items-center justify-center text-white">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl font-bold" style={{ writingMode: 'sideways-lr', textOrientation: 'mixed' }}>{choice.choiceNumber}</span>

                        <span className="text-2xl font-bold tracking-wide" style={{ writingMode: 'sideways-lr', textOrientation: 'mixed' }}>
                          Pil
                        </span>
                      </div>
                    </div>

                    {/* Input Fields Container - Stacked Vertically */}
                    <div className="flex flex-1 flex-col gap-2">
                      {/* University Selector */}
                      <Popover
                        open={openUniversity[index]}
                        onOpenChange={(open) => {
                          const newOpen = [...openUniversity];
                          newOpen[index] = open;
                          setOpenUniversity(newOpen);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                            <span className={choice.universityName ? "text-gray-900 font-medium text-base" : "text-gray-400 text-base"}>
                              {choice.universityName || "Pilih Universitas"}
                            </span>
                            <FiSearch className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Cari universitas..." />
                            <CommandList>
                              <CommandEmpty>Tidak ada universitas ditemukan</CommandEmpty>
                              <CommandGroup>
                                {universities?.map((uni) => (
                                  <CommandItem
                                    key={uni.id}
                                    onSelect={() =>
                                      handleUniversitySelect(index, uni.id, uni.name)
                                    }
                                  >
                                    {uni.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Major Selector */}
                      <Popover
                        open={openMajor[index]}
                        onOpenChange={(open) => {
                          const newOpen = [...openMajor];
                          newOpen[index] = open;
                          setOpenMajor(newOpen);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={!choice.universityId}
                          >
                            <span className={choice.majorName ? "text-gray-900 font-medium text-base" : "text-gray-400 text-base"}>
                              {choice.majorName || "Pilih Jurusan"}
                            </span>
                            <FiSearch className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Cari jurusan..." />
                            <CommandList>
                              <CommandEmpty>Tidak ada jurusan ditemukan</CommandEmpty>
                              <CommandGroup>
                                {majorsData[index]?.data?.map((major) => (
                                  <CommandItem
                                    key={major.id}
                                    onSelect={() =>
                                      handleMajorSelect(index, major.id, major.name)
                                    }
                                  >
                                    {major.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveMajorChoices}
              disabled={updateMajorChoices.isPending}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-6 rounded-xl"
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
