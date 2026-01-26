"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { hasAccess, getSubscriptionStatus } from "../lib/subscription";

interface PaywallProps {
  children: React.ReactNode;
}

export default function Paywall({ children }: PaywallProps) {
  const [allowed, setAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const access = hasAccess();
    const subscriptionStatus = getSubscriptionStatus();

    setAllowed(access);
    setStatus(subscriptionStatus);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: "2rem" }}>⏳</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: "600px",
            width: "100%",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px",
            padding: "48px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)"
          }}
        >
          {/* 锁图标 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            style={{ fontSize: "5rem", marginBottom: "24px" }}
          >
            🔒
          </motion.div>

          {/* 标题 */}
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "800",
            color: "#2d3748",
            marginBottom: "16px"
          }}>
            免费试用期已结束
          </h2>

          {/* 描述 */}
          <p style={{
            fontSize: "1.1rem",
            color: "#718096",
            lineHeight: "1.6",
            marginBottom: "32px"
          }}>
            感谢您体验 MathResearchPilot！
            <br />
            订阅付费计划以继续使用所有功能。
          </p>

          {/* 订阅优势 */}
          <div style={{
            background: "#f8f9fa",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "32px",
            textAlign: "left"
          }}>
            <div style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#2d3748",
              marginBottom: "16px",
              textAlign: "center"
            }}>
              ✨ 付费会员专享
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                "无限访问所有研究工具",
                "AI驱动的课题推荐",
                "智能论文阅读助手",
                "自动生成研究路线图",
                "数据云端安全备份",
                "优先技术支持服务"
              ].map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "0.95rem",
                    color: "#4a5568"
                  }}
                >
                  <span style={{ color: "#43e97b", fontSize: "1.2rem" }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* 按钮组 */}
          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <Link href="/pricing" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                }}
              >
                🎉 查看订阅计划
              </motion.button>
            </Link>

            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  color: "#718096",
                  border: "2px solid #e9ecef",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                返回首页
              </motion.button>
            </Link>
          </div>

          {/* 底部提示 */}
          <div style={{
            marginTop: "24px",
            fontSize: "0.85rem",
            color: "#a0aec0"
          }}>
            💳 支持多种支付方式 · 随时可取消订阅
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
