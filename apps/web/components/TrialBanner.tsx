"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSubscriptionStatus, getPlanName } from "../lib/subscription";

export default function TrialBanner() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const subscriptionStatus = getSubscriptionStatus();
    setStatus(subscriptionStatus);

    // 只在试用期且剩余天数小于等于7天时显示
    if (subscriptionStatus.plan === 'free_trial' && subscriptionStatus.daysRemaining <= 7) {
      setShow(true);
    }
  }, []);

  if (!show || !status) return null;

  const isExpired = status.daysRemaining === 0;
  const isUrgent = status.daysRemaining <= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "12px 20px",
          background: isExpired
            ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
            : isUrgent
            ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
        }}
      >
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ color: "white", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>
              {isExpired ? "⚠️" : isUrgent ? "⏰" : "💡"}
            </span>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>
                {isExpired
                  ? "免费试用期已结束"
                  : `免费试用期还剩 ${status.daysRemaining} 天`
                }
              </div>
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                {isExpired
                  ? "立即订阅以继续使用所有功能"
                  : "升级到付费计划，解锁全部功能"
                }
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/pricing" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 24px",
                  background: "white",
                  color: isExpired ? "#f5576c" : "#667eea",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
              >
                {isExpired ? "立即订阅" : "查看计划"}
              </motion.button>
            </Link>

            <button
              onClick={() => setShow(false)}
              style={{
                padding: "8px",
                background: "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
                opacity: 0.8
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
