"use client";

import { useEffect } from "react";
import TrialBanner from "./TrialBanner";
import { initializeTrial } from "../lib/subscription";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化试用期
    initializeTrial();
  }, []);

  return (
    <>
      <TrialBanner />
      {children}
    </>
  );
}
