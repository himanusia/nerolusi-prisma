export default function TokenCard() {
  return (
    <div className="flex rounded-lg border border-gray-500 bg-gray-300">
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-white px-4 py-2 text-xs md:text-md">
        <h3 className="text-center">Token TryOut</h3>
        <div className="flex items-center justify-center">
          <img
            src="/home/coinstack.png"
            alt="Token Icon"
            className="mb-1 size-6"
          />
          <span className="ml-1 text-gray-700">:</span>
          <span className="ml-2 text-gray-700">2</span>
        </div>
      </div>
      <div className="mx-2 flex items-center justify-center text-2xl">+</div>
    </div>
  );
}
