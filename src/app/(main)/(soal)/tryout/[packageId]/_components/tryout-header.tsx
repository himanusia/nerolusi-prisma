"use client";

interface TryoutHeaderProps {
  packageName: string;
  startDate: Date | string;
  endDate: Date | string;
  onBack: () => void;
}

export function TryoutHeader({
  packageName,
  startDate,
  endDate,
  onBack,
}: TryoutHeaderProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onBack}
        className="mb-5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        ← Kembali
      </button>

      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          {packageName}
        </h1>

        <div className="flex w-fit items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-bold">
            {new Date(startDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
            })}{" "}
            -{" "}
            {new Date(endDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
