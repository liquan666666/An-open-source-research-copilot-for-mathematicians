"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UserStats {
  hasInterests: boolean;
  interestCount: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  savedPapers: number;
  checkInStreak: number;
  totalCheckIns: number;
  userSinceDays: number;
}

interface Recommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  priority: number;
  color: string;
}

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchUserDataAndGenerateRecommendations();
  }, []);

  const fetchUserDataAndGenerateRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // 未登录用户的推荐
        setRecommendations(getGuestRecommendations());
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 并行获取所有需要的数据
      const [userRes, interestsRes, tasksStatsRes, papersRes, streakRes, overviewRes] =
        await Promise.all([
          fetch(`${apiUrl}/auth/me`, { headers }).catch(() => null),
          fetch(`${apiUrl}/profile/interests`, { headers }).catch(() => null),
          fetch(`${apiUrl}/tasks/stats`, { headers }).catch(() => null),
          fetch(`${apiUrl}/papers/saved`, { headers }).catch(() => null),
          fetch(`${apiUrl}/checkins/streak`, { headers }).catch(() => null),
          fetch(`${apiUrl}/stats/overview`, { headers }).catch(() => null),
        ]);

      const userData = userRes?.ok ? await userRes.json() : null;
      const interests = interestsRes?.ok ? await interestsRes.json() : [];
      const tasksStats = tasksStatsRes?.ok ? await tasksStatsRes.json() : {};
      const papers = papersRes?.ok ? await papersRes.json() : [];
      const streak = streakRes?.ok ? await streakRes.json() : {};
      const overview = overviewRes?.ok ? await overviewRes.json() : {};

      if (userData?.name) {
        setUserName(userData.name);
      }

      const stats: UserStats = {
        hasInterests: interests.length > 0,
        interestCount: interests.length || 0,
        totalTasks: tasksStats.total || 0,
        completedTasks: tasksStats.completed || 0,
        pendingTasks: tasksStats.pending || 0,
        savedPapers: papers.length || 0,
        checkInStreak: streak.current_streak || 0,
        totalCheckIns: streak.total_checkins || 0,
        userSinceDays: overview.user_since_days || 0,
      };

      const recs = generateSmartRecommendations(stats);
      setRecommendations(recs);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setRecommendations(getDefaultRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const generateSmartRecommendations = (stats: UserStats): Recommendation[] => {
    const recs: Recommendation[] = [];

    // 1. 新用户引导
    if (stats.userSinceDays <= 3 && !stats.hasInterests) {
      recs.push({
        id: "welcome",
        icon: "👋",
        title: "欢迎使用 MathResearchPilot！",
        description: "让我们从添加您的研究兴趣开始，这将帮助系统为您提供个性化推荐。",
        actionText: "添加研究兴趣",
        actionLink: "/interests",
        priority: 100,
        color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      });
    }

    // 2. 没有研究兴趣
    if (!stats.hasInterests) {
      recs.push({
        id: "no-interests",
        icon: "🎯",
        title: "尚未设置研究兴趣",
        description: "添加研究兴趣后，系统可以为您推荐相关课题和论文。",
        actionText: "设置研究兴趣",
        actionLink: "/interests",
        priority: 90,
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 3. 研究兴趣较少
    if (stats.interestCount > 0 && stats.interestCount < 3) {
      recs.push({
        id: "few-interests",
        icon: "🎯",
        title: "扩展研究方向",
        description: `您目前有 ${stats.interestCount} 个研究兴趣。添加更多兴趣可以获得更丰富的推荐。`,
        actionText: "添加更多兴趣",
        actionLink: "/interests",
        priority: 50,
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 4. 没有保存论文
    if (stats.savedPapers === 0 && stats.hasInterests) {
      recs.push({
        id: "no-papers",
        icon: "📚",
        title: "开始构建论文库",
        description: "搜索并保存相关论文，建立您的个人学术资料库。",
        actionText: "搜索论文",
        actionLink: "/papers",
        priority: 80,
        color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      });
    }

    // 5. 有论文但未使用 AI 助手
    if (stats.savedPapers > 0 && stats.savedPapers < 5) {
      recs.push({
        id: "use-ai-assistant",
        icon: "🤖",
        title: "使用 AI 论文助手",
        description: `您已保存 ${stats.savedPapers} 篇论文。使用 AI 助手快速提取关键信息和知识点。`,
        actionText: "试试论文助手",
        actionLink: "/paper-assistant",
        priority: 70,
        color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      });
    }

    // 6. 没有任务
    if (stats.totalTasks === 0 && stats.hasInterests) {
      recs.push({
        id: "no-tasks",
        icon: "✅",
        title: "创建研究任务",
        description: "将研究目标分解为可执行的任务，更好地追踪进度。",
        actionText: "创建任务",
        actionLink: "/tasks",
        priority: 75,
        color: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
      });
    }

    // 7. 有很多未完成任务
    if (stats.pendingTasks > 5) {
      recs.push({
        id: "many-pending-tasks",
        icon: "⚠️",
        title: "待办任务较多",
        description: `您有 ${stats.pendingTasks} 个待办任务。建议优先完成重要任务或分解大任务。`,
        actionText: "查看任务",
        actionLink: "/tasks",
        priority: 85,
        color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      });
    }

    // 8. 任务完成率低
    if (stats.totalTasks > 0) {
      const completionRate = (stats.completedTasks / stats.totalTasks) * 100;
      if (completionRate < 30 && stats.totalTasks >= 10) {
        recs.push({
          id: "low-completion",
          icon: "📊",
          title: "任务完成率偏低",
          description: `当前完成率 ${completionRate.toFixed(0)}%。尝试每天完成小目标，保持研究节奏。`,
          actionText: "查看今日任务",
          actionLink: "/tasks",
          priority: 65,
          color: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
        });
      }
    }

    // 9. 签到提醒
    if (stats.checkInStreak === 0 && stats.totalCheckIns === 0) {
      recs.push({
        id: "start-checkin",
        icon: "📊",
        title: "开始每日打卡",
        description: "每日打卡可以帮助您养成规律的研究习惯，追踪研究进度。",
        actionText: "今日打卡",
        actionLink: "/checkin",
        priority: 60,
        color: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
      });
    }

    // 10. 签到连续天数表扬
    if (stats.checkInStreak >= 7) {
      recs.push({
        id: "great-streak",
        icon: "🔥",
        title: `太棒了！连续打卡 ${stats.checkInStreak} 天`,
        description: "坚持就是胜利！继续保持研究节奏，您已经养成了良好的习惯。",
        actionText: "继续打卡",
        actionLink: "/checkin",
        priority: 55,
        color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      });
    }

    // 11. 没有路线图
    if (stats.hasInterests && stats.totalTasks === 0) {
      recs.push({
        id: "create-roadmap",
        icon: "🗺️",
        title: "生成研究路线图",
        description: "AI 可以根据您的研究兴趣生成详细的学习路线和执行计划。",
        actionText: "生成路线图",
        actionLink: "/roadmap",
        priority: 70,
        color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      });
    }

    // 12. 查看统计和进度
    if (stats.totalTasks > 10 || stats.savedPapers > 5 || stats.totalCheckIns > 10) {
      recs.push({
        id: "view-stats",
        icon: "📈",
        title: "查看研究统计",
        description: "您已经积累了丰富的研究数据，查看详细的统计分析和学习进度。",
        actionText: "查看统计",
        actionLink: "/dashboard",
        priority: 40,
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 13. AI 推荐
    if (stats.hasInterests && stats.savedPapers > 3) {
      recs.push({
        id: "ai-recommendations",
        icon: "🎯",
        title: "获取智能推荐",
        description: "基于您的研究兴趣和阅读历史，AI 为您推荐相关论文和任务。",
        actionText: "查看推荐",
        actionLink: "/dashboard",
        priority: 60,
        color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      });
    }

    // 按优先级排序，取前 3 个
    return recs.sort((a, b) => b.priority - a.priority).slice(0, 3);
  };

  const getGuestRecommendations = (): Recommendation[] => {
    return [
      {
        id: "register",
        icon: "🎓",
        title: "注册账号开始使用",
        description: "创建账号后，您可以使用所有功能：论文搜索、任务管理、AI 助手等。",
        actionText: "注册账号",
        actionLink: "/auth/register",
        priority: 100,
        color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      },
    ];
  };

  const getDefaultRecommendations = (): Recommendation[] => {
    return [
      {
        id: "explore",
        icon: "🚀",
        title: "探索功能",
        description: "浏览各个功能模块，了解 MathResearchPilot 能为您做什么。",
        actionText: "开始探索",
        actionLink: "/",
        priority: 50,
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
    ];
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>🤖</span>
          <p style={{ margin: 0, color: "#718096" }}>正在分析您的使用情况...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginBottom: "32px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>🤖</span>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#ffffff",
            margin: 0,
          }}
        >
          {userName ? `${userName}，` : ""}为您推荐
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -4 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Priority indicator */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: rec.color,
              }}
            />

            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  flexShrink: 0,
                }}
              >
                {rec.icon}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#2d3748",
                    marginBottom: "8px",
                    margin: 0,
                  }}
                >
                  {rec.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#718096",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                  }}
                >
                  {rec.description}
                </p>

                <Link href={rec.actionLink} style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "10px 20px",
                      background: rec.color,
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {rec.actionText} →
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
