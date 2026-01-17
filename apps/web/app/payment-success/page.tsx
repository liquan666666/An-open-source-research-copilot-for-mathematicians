"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyCheckoutSession } from "../../lib/stripe";
import { activateSubscription } from "../../lib/subscription";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("缺少支付会话ID");
      setLoading(false);
      return;
    }

    // 验证支付会话
    verifyCheckoutSession(sessionId)
      .then((data) => {
        setSessionData(data);

        // 如果支付成功，激活订阅
        if (data.status === "paid") {
          const plan = data.plan as 'monthly' | 'yearly' | 'lifetime';
          activateSubscription(plan);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "验证支付失败");
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            marginBottom: "20px"
          }}
        />
        <p style={{ color: "#ffffff", fontSize: "1.2rem" }}>正在验证支付...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: "500px",
            width: "100%",
            padding: "40px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>😞</div>
          <h1 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#2d3748",
            marginBottom: "16px"
          }}>
            支付验证失败
          </h1>
          <p style={{ color: "#718096", marginBottom: "32px", fontSize: "1rem" }}>
            {error}
          </p>
          <Link href="/pricing" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}
            >
              返回定价页面
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "50px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 30px",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem"
          }}
        >
          ✓
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "2.2rem",
            fontWeight: "800",
            color: "#2d3748",
            marginBottom: "16px"
          }}
        >
          支付成功！
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: "1.1rem",
            color: "#718096",
            marginBottom: "32px",
            lineHeight: "1.6"
          }}
        >
          感谢您的订阅！您的账户已成功升级，现在可以畅享所有功能。
        </motion.p>

        {/* Payment Details */}
        {sessionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              padding: "24px",
              background: "#f8f9fa",
              borderRadius: "16px",
              marginBottom: "32px",
              textAlign: "left"
            }}
          >
            <h3 style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#2d3748",
              marginBottom: "16px"
            }}>
              订单详情
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {sessionData.customer_email && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#718096" }}>邮箱:</span>
                  <span style={{ color: "#2d3748", fontWeight: "500" }}>
                    {sessionData.customer_email}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#718096" }}>订阅计划:</span>
                <span style={{ color: "#2d3748", fontWeight: "500" }}>
                  {sessionData.plan === 'monthly' ? '月度订阅' :
                   sessionData.plan === 'yearly' ? '年度订阅' : '终身会员'}
                </span>
              </div>
              {sessionData.amount_total && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#718096" }}>支付金额:</span>
                  <span style={{
                    color: "#2d3748",
                    fontWeight: "700",
                    fontSize: "1.1rem"
                  }}>
                    ¥{(sessionData.amount_total / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: "16px", justifyContent: "center" }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}
            >
              开始使用
            </motion.button>
          </Link>
          <Link href="/account" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "14px 32px",
                background: "white",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              查看账户
            </motion.button>
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: "32px",
            fontSize: "0.9rem",
            color: "#a0aec0"
          }}
        >
          您的收据已发送至邮箱。如有任何问题，请联系客服。
        </motion.p>
      </motion.div>
    </div>
  );
}
