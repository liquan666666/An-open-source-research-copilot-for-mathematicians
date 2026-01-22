"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || user.email || "用户");
        } catch (e) {
          setUserName("用户");
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    router.push("/auth/login");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>📐</span>
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MathResearchPilot
            </span>
          </motion.div>
        </Link>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isLoggedIn ? (
            <>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#4a5568",
                  paddingRight: "8px",
                }}
              >
                👋 {userName}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                style={{
                  padding: "8px 20px",
                  background: "white",
                  color: "#667eea",
                  border: "2px solid #667eea",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                退出登录
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 20px",
                    background: "white",
                    color: "#667eea",
                    border: "2px solid #667eea",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  登录
                </motion.button>
              </Link>
              <Link href="/auth/register" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  注册
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
