export default function DaysLeft() {
  return (
    <div className="flex items-center rounded-lg border border-gray-300 p-2">
      <div className="flex items-center justify-center rounded-lg bg-[#2b8057] px-4 py-2 text-center text-xl font-extrabold text-white md:text-3xl">
        {/* TODO: change to actual days left */}
        300
      </div>
      <div className="ml-3 flex flex-wrap items-center justify-start">
        <span className="sm:text-lg md:text-xl">
          <span className="font-bold">Hari</span> hingga{" "}
          <span className="font-bold">UTBK</span>
        </span>
      </div>
    </div>
  );
}
