"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

      // 使用 FormData 格式（OAuth2 标准）
      const formBody = new URLSearchParams();
      formBody.append("username", formData.email);
      formBody.append("password", formData.password);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "登录失败");
      }

      // 保存 token
      localStorage.setItem("token", data.access_token);

      // 获取用户信息
      const userResponse = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // 跳转到首页
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请检查邮箱和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "12px",
            }}
          >
            欢迎回来 👋
          </motion.h1>
          <p style={{ fontSize: "1rem", color: "#ffffff", opacity: 0.9 }}>
            登录您的账号继续研究
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#2d3748",
                }}
              >
                邮箱
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "1rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#2d3748",
                }}
              >
                密码
              </label>
              <input
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "1rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "12px",
                  marginBottom: "20px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading
                  ? "none"
                  : "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "登录中..." : "登录"}
            </motion.button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "28px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#e9ecef",
              }}
            />
            <span style={{ fontSize: "0.85rem", color: "#718096" }}>或</span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#e9ecef",
              }}
            />
          </div>

          {/* Register Link */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#718096" }}>
              还没有账号？{" "}
              <Link
                href="/auth/register"
                style={{
                  color: "#667eea",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                立即注册
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: "center", marginTop: "24px" }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "0.9rem",
              opacity: 0.9,
            }}
          >
            <span>←</span> 返回首页
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
