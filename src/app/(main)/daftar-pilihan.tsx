import { Button } from "../_components/ui/button";

// Dummy data for school choices
const dummyChoices = [
  {
    id: 1,
    choice: "Pilihan 1",
    school: "Institut Teknologi Bandung",
    program: "Sekolah Teknik Elektro dan Informatika - Komputasi (STEI-K)",
    passingGrade: 700,
  },
  {
    id: 2,
    choice: "Pilihan 2",
    school: "Universitas Indonesia",
    program: "Teknik Sipil",
    passingGrade: 650,
  },
  {
    id: 3,
    choice: "Pilihan 3",
    school: "Universitas Udayana",
    program: "Teknik Sipil",
    passingGrade: 620,
  },
  {
    id: 4,
    choice: "Pilihan 4",
    score: 605,
    school: "Sekolah Vokasi IPB",
    program: "Teknik Komputer (D4)",
    passingGrade: 580,
  },
];

export default function DaftarPilihan() {
  return (
    <div className="container mx-auto w-fit flex-1 py-2">
      <div className="">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Keep TRACK of your Score!
        </h1>
        <p className="text-muted-foreground">Passing Grade:</p>
      </div>

      <div className="mb-2 h-fit space-y-1">
        {dummyChoices.map((choice) => (
          <div
            key={choice.id}
            className="flex h-fit items-center justify-between gap-4 border-0 py-1"
          >
            {/* Score Circle */}
            <div className="flex h-16 w-28 items-center justify-center rounded-xl border-2 border-gray-300">
              <span className="text-3xl font-bold">{choice.passingGrade}</span>
            </div>

            {/* Choice Info */}
            <div className="flex-1 border-l-[6px] border-green-600 pl-4">
              <h3 className="text-lg font-semibold">{choice.choice}</h3>
              <p className="text-sm font-medium text-gray-900">
                {choice.school}
              </p>
              <p className="text-xs text-gray-600">{choice.program}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          Ganti Pilihan
        </Button>
      </div>
    </div>
  );
}
