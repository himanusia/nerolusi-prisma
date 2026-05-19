"use client";

import { useEffect, useState, useCallback } from "react";

interface CountdownTimerProps {
  endDate: Date | string;
  onExpire: () => void;
}

export function CountdownTimer({ endDate, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(endDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [endDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      if (!newTimeLeft) {
        clearInterval(timer);
        onExpire();
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    // Set initial value
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="h-5 w-5 text-amber-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        <div className="text-center">
          <p className="text-sm font-semibold text-amber-800">Waktu tersisa:</p>
          <p className="text-lg font-bold text-amber-900">
            {timeLeft.days > 0 && `${timeLeft.days}h `}
            {timeLeft.hours.toString().padStart(2, "0")}:
            {timeLeft.minutes.toString().padStart(2, "0")}:
            {timeLeft.seconds.toString().padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}
