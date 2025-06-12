"use client";

import { useEffect } from "react";

export function useOnlineTimer() {
  useEffect(() => {
    const getTodayKey = () => {
      const today = new Date();
      return `online_hours_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    };
    const key = getTodayKey();
    let seconds = Number(localStorage.getItem(key) || 0);

    const interval = setInterval(() => {
      seconds += 1;
      localStorage.setItem(key, String(seconds));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
}