"use client";

import Image from "next/image";
import { api } from "~/trpc/react";
import { useTimer } from "react-timer-hook";

function MyTimer({ expiryTimestamp }: { expiryTimestamp: Date }) {
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn("onExpire called"),
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "50px" }}>
        <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:
        <span>{seconds}</span>
      </div>
      <p>{isRunning ? "Running" : "Not running"}</p>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button
        onClick={() => {
          // Restarts to 5 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 300);
          restart(time);
        }}
      >
        Restart
      </button>
    </div>
  );
}

export function Soal() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 600);

  const {
    data: soal,
    error,
    isLoading,
  } = api.question.getOneQuestions.useQuery({
    id: "789e262a-0f32-4b9e-9726-cf29258e456c",
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading question: {error.message}</p>;
  }

  return (
    <div className="w-full max-w-xs border">
      <MyTimer expiryTimestamp={time} />
      {soal ? (
        <p className="truncate">
          Content: {soal.content} <br />
          {soal.imageUrl && (
            <Image src={soal.imageUrl} width={200} height={300} alt="soal" />
          )}
          Score: {soal.score}{" "}
        </p>
      ) : (
        <p>You have no soals yet.</p>
      )}
    </div>
  );
}
