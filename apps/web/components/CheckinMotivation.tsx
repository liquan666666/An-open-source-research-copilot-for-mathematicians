"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface MotivationCard {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  color: string;
}

export default function CheckinMotivation() {
  const [motivation, setMotivation] = useState<MotivationCard | null>(null);
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    fetchStreakAndGenerateMotivation();
  }, []);

  const fetchStreakAndGenerateMotivation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMotivation({
          icon: "👋",
          title: "登录后开始打卡",
          message: "每日打卡可以帮助您养成规律的研究习惯，追踪研究进度。",
          actionText: "去登录",
          actionLink: "/auth/login",
          color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        });
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${token}` };

      const [streakRes, todayRes] = await Promise.all([
        fetch(`${apiUrl}/checkins/streak`, { headers }).catch(() => null),
        fetch(`${apiUrl}/checkins/today`, { headers }).catch(() => null),
      ]);

      const streak = streakRes?.ok ? await streakRes.json() : null;
      const today = todayRes?.ok ? await todayRes.json() : null;

      setStreakData(streak);
      generateMotivation(streak, today);
    } catch (error) {
      console.error("Error fetching checkin data:", error);
    }
  };

  const generateMotivation = (streak: any, today: any) => {
    const currentStreak = streak?.current_streak || 0;
    const totalCheckins = streak?.total_checkins || 0;
    const longestStreak = streak?.longest_streak || 0;
    const hasTodayCheckin = today !== null;

    let motivationCard: MotivationCard;

    // 1. 今天已打卡
    if (hasTodayCheckin) {
      if (currentStreak >= 30) {
        motivationCard = {
          icon: "👑",
          title: "传奇连续打卡！",
          message: `惊人的 ${currentStreak} 天连续打卡！您的毅力和坚持令人敬佩。`,
          actionText: "查看统计",
          actionLink: "/dashboard",
          color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
        };
      } else if (currentStreak >= 14) {
        motivationCard = {
          icon: "🏆",
          title: "连续两周打卡！",
          message: `太棒了！已经连续 ${currentStreak} 天打卡。坚持下去，您正在建立优秀的研究习惯。`,
          actionText: "查看进度",
          actionLink: "/dashboard",
          color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
        };
      } else if (currentStreak >= 7) {
        motivationCard = {
          icon: "🔥",
          title: "一周连续打卡！",
          message: `连续 ${currentStreak} 天打卡，做得很好！继续保持，21 天就能养成习惯。`,
          color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        };
      } else if (currentStreak >= 3) {
        motivationCard = {
          icon: "⭐",
          title: "保持得不错！",
          message: `已连续 ${currentStreak} 天打卡。继续坚持，建立稳定的研究节奏。`,
          color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        };
      } else {
        motivationCard = {
          icon: "✅",
          title: "今日已打卡",
          message: currentStreak > 0
            ? `太好了！您已连续 ${currentStreak} 天打卡。明天继续加油！`
            : "今天的打卡已完成，明天记得继续哦！",
          color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        };
      }
    }

    // 2. 今天未打卡
    else {
      if (currentStreak >= 7) {
        motivationCard = {
          icon: "⚡",
          title: `不要中断 ${currentStreak} 天连续记录！`,
          message: "您已经坚持得很好了，今天记得打卡，保持连续记录！",
          color: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
        };
      } else if (currentStreak >= 3) {
        motivationCard = {
          icon: "💪",
          title: "继续保持连续打卡",
          message: `已连续 ${currentStreak} 天，今天也不要断哦！`,
          color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        };
      } else if (totalCheckins === 0) {
        motivationCard = {
          icon: "🎯",
          title: "开始您的第一次打卡",
          message: "每日打卡可以帮助您追踪研究进度，养成规律的学习习惯。",
          color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        };
      } else if (totalCheckins > 0 && currentStreak === 0) {
        motivationCard = {
          icon: "🌟",
          title: "重新开始打卡",
          message: longestStreak > 0
            ? `您的最长连续记录是 ${longestStreak} 天，相信您可以超越！`
            : "开始新的连续打卡记录，建立稳定的研究节奏。",
          color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        };
      } else {
        motivationCard = {
          icon: "📅",
          title: "今天记得打卡",
          message: "记录今天的研究进度和遇到的问题，保持学习的连续性。",
          color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        };
      }
    }

    // 3. 里程碑成就
    if (totalCheckins === 50 && !hasTodayCheckin) {
      motivationCard = {
        icon: "🎊",
        title: "即将达成 50 次打卡！",
        message: `您已经打卡 ${totalCheckins} 次，距离 50 次里程碑只差一步！`,
        color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      };
    } else if (totalCheckins >= 100) {
      motivationCard = {
        icon: "🌟",
        title: "百日打卡成就！",
        message: `累计打卡 ${totalCheckins} 次，您已经是研究习惯养成大师！`,
        actionText: "查看成就",
        actionLink: "/dashboard",
        color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      };
    }

    setMotivation(motivationCard);
  };

  if (!motivation) {
    return (
      <div
        style={{
          padding: "20px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>⏳</span>
          <p style={{ margin: 0, color: "#718096" }}>加载打卡数据...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginBottom: "24px" }}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient bar */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: motivation.color,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{ fontSize: "3.5rem", flexShrink: 0 }}
          >
            {motivation.icon}
          </motion.div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "800",
                background: motivation.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "10px",
                margin: 0,
              }}
            >
              {motivation.title}
            </h3>
            <p
              style={{
                fontSize: "1rem",
                color: "#4a5568",
                lineHeight: "1.6",
                margin: 0,
                marginBottom: motivation.actionText ? "16px" : 0,
              }}
            >
              {motivation.message}
            </p>

            {motivation.actionText && motivation.actionLink && (
              <Link href={motivation.actionLink} style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "10px 24px",
                    background: motivation.color,
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {motivation.actionText} →
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Streak info */}
        {streakData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "0.8rem", color: "#718096", marginBottom: "4px" }}>
                当前连续
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2d3748" }}>
                {streakData.current_streak} 天
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#718096", marginBottom: "4px" }}>
                最长连续
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2d3748" }}>
                {streakData.longest_streak} 天
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#718096", marginBottom: "4px" }}>
                累计打卡
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2d3748" }}>
                {streakData.total_checkins} 次
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
