"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSubscriptionStatus, getPlanName, getPlanPrice, resetToTrial } from "../../lib/subscription";

export default function AccountPage() {
  const [status, setStatus] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const subscriptionStatus = getSubscriptionStatus();
    setStatus(subscriptionStatus);
  }, []);

  const handleCancelSubscription = () => {
    if (confirm("确定要取消订阅吗？\n\n取消后您仍可使用至当前订阅期结束，到期后将无法继续使用付费功能。")) {
      alert("订阅已取消。\n\n您可以继续使用至 " + (status?.expiryDate ? new Date(status.expiryDate).toLocaleDateString('zh-CN') : "订阅期结束"));
      setShowCancelDialog(false);
    }
  };

  const handleResetTrial = () => {
    if (confirm("⚠️ 仅用于演示测试\n\n确定要重置为30天试用期吗？")) {
      resetToTrial();
      window.location.reload();
    }
  };

  if (!status) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: "2rem" }}>⏳ 加载中...</div>
      </div>
    );
  }

  const isPaid = status.plan !== 'free_trial';
  const isActive = status.isActive;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "32px" }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "1rem",
            marginBottom: "20px",
            opacity: 0.9
          }}
        >
          <span>←</span> 返回首页
        </Link>

        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "12px"
          }}
        >
          我的账户 👤
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          管理您的订阅和账户设置
        </p>
      </motion.div>

      {/* 订阅状态卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "8px"
            }}>
              当前订阅
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#718096" }}>
              查看和管理您的订阅计划
            </p>
          </div>

          {isActive && (
            <div style={{
              padding: "8px 20px",
              borderRadius: "20px",
              background: status.plan === 'free_trial'
                ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: "700"
            }}>
              ✓ 已激活
            </div>
          )}
        </div>

        {/* 订阅详情 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "28px"
        }}>
          <div style={{
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "16px",
            borderLeft: "4px solid #667eea"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#718096", marginBottom: "4px" }}>
              订阅计划
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#2d3748" }}>
              {getPlanName(status.plan)}
            </div>
          </div>

          <div style={{
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "16px",
            borderLeft: "4px solid #43e97b"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#718096", marginBottom: "4px" }}>
              {status.plan === 'free_trial' ? '剩余天数' : status.plan === 'lifetime' ? '会员状态' : '续费周期'}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#2d3748" }}>
              {status.plan === 'lifetime'
                ? '终身有效 ♾️'
                : status.daysRemaining > 0
                  ? `${status.daysRemaining} 天`
                  : '已过期'}
            </div>
          </div>

          {status.expiryDate && status.plan !== 'lifetime' && (
            <div style={{
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "16px",
              borderLeft: "4px solid #f5576c"
            }}>
              <div style={{ fontSize: "0.85rem", color: "#718096", marginBottom: "4px" }}>
                到期时间
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#2d3748" }}>
                {new Date(status.expiryDate).toLocaleDateString('zh-CN')}
              </div>
            </div>
          )}

          <div style={{
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "16px",
            borderLeft: "4px solid #ffa500"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#718096", marginBottom: "4px" }}>
              价格
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#2d3748" }}>
              {getPlanPrice(status.plan)}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {status.plan === 'free_trial' && (
            <Link href="/pricing" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                }}
              >
                🎉 升级到付费计划
              </motion.button>
            </Link>
          )}

          {isPaid && status.plan !== 'lifetime' && (
            <>
              <Link href="/pricing" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(67, 233, 123, 0.3)"
                  }}
                >
                  ⬆️ 升级计划
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancelDialog(true)}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "14px",
                  background: "white",
                  color: "#f5576c",
                  border: "2px solid #f5576c",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ❌ 取消订阅
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* 订阅历史 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "20px"
        }}>
          📜 订阅历史
        </h3>

        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "4px" }}>
                {getPlanName(status.plan)}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                开始于 {new Date(status.startDate).toLocaleDateString('zh-CN')}
              </div>
            </div>
            <div style={{
              padding: "6px 16px",
              borderRadius: "20px",
              background: isActive ? "#43e97b" : "#e9ecef",
              color: isActive ? "white" : "#718096",
              fontSize: "0.85rem",
              fontWeight: "600"
            }}>
              {isActive ? "进行中" : "已过期"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 账户设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "20px"
        }}>
          ⚙️ 账户设置
        </h3>

        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "4px" }}>
                数据导出
              </div>
              <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                导出您的研究数据和兴趣列表
              </div>
            </div>
            <Link href="/export" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                导出数据
              </motion.button>
            </Link>
          </div>

          <div style={{
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "4px" }}>
                使用统计
              </div>
              <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                查看您的使用数据和研究进度
              </div>
            </div>
            <Link href="/stats" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 20px",
                  background: "#43e97b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                查看统计
              </motion.button>
            </Link>
          </div>

          {/* 测试功能 */}
          <div style={{
            padding: "20px",
            background: "#fff3cd",
            borderRadius: "12px",
            borderLeft: "4px solid #ffc107"
          }}>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: "#856404", marginBottom: "8px" }}>
              ⚠️ 开发者测试功能
            </div>
            <div style={{ fontSize: "0.85rem", color: "#856404", marginBottom: "12px" }}>
              仅用于演示和测试，点击下方按钮将重置为30天试用期
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResetTrial}
              style={{
                padding: "10px 20px",
                background: "#ffc107",
                color: "#856404",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🔄 重置为试用期
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 取消订阅对话框 */}
      {showCancelDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%"
            }}
          >
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2d3748", marginBottom: "16px" }}>
              确定要取消订阅吗？
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#718096", lineHeight: "1.6", marginBottom: "24px" }}>
              取消后您仍可使用至当前订阅期结束。到期后将无法继续使用付费功能，但您的数据会保留90天。
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelSubscription}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f5576c",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                确认取消
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancelDialog(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e9ecef",
                  color: "#718096",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                保留订阅
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
