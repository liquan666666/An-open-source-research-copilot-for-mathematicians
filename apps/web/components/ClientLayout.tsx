"use client";

import { useEffect } from "react";
import TrialBanner from "./TrialBanner";
import { initializeTrial } from "../lib/subscription";
import { initializeNotifications } from "../lib/notifications";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化试用期
    initializeTrial();

    // 初始化通知系统
    initializeNotifications();
  }, []);

  return (
    <>
      <TrialBanner />
      {children}
    </>
  );
}
