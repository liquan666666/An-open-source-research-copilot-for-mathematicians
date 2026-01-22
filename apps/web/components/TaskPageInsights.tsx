"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TaskInsight {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  color: string;
}

interface TaskPageInsightsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks?: number;
}

export default function TaskPageInsights({
  totalTasks,
  completedTasks,
  pendingTasks,
  highPriorityTasks = 0,
}: TaskPageInsightsProps) {
  const [insights, setInsights] = useState<TaskInsight[]>([]);
  const [apiStats, setApiStats] = useState<any>(null);

  useEffect(() => {
    // 尝试从 API 获取真实统计数据
    fetchTaskStats();
  }, []);

  useEffect(() => {
    // 根据本地任务状态和 API 数据生成洞察
    generateInsights();
  }, [totalTasks, completedTasks, pendingTasks, highPriorityTasks, apiStats]);

  const fetchTaskStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/tasks/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setApiStats(data);
      }
    } catch (error) {
      // 静默失败，使用本地数据
    }
  };

  const generateInsights = () => {
    const newInsights: TaskInsight[] = [];

    // 使用 API 数据优先，否则使用传入的 props
    const stats = apiStats || {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
    };

    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    // 1. 没有任务
    if (stats.total === 0) {
      newInsights.push({
        icon: "🎯",
        title: "开始创建任务",
        message: "将您的研究目标分解为具体的任务，更容易追踪和完成进度。",
        actionText: "了解如何使用",
        actionLink: "/help",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 2. 任务很少
    else if (stats.total > 0 && stats.total < 3) {
      newInsights.push({
        icon: "📝",
        title: "添加更多任务",
        message: `您目前有 ${stats.total} 个任务。建议将大目标分解为更小的可执行任务。`,
        color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      });
    }

    // 3. 完成率高 - 表扬
    else if (completionRate >= 70 && stats.total >= 5) {
      newInsights.push({
        icon: "🎉",
        title: "完成率很棒！",
        message: `您已完成 ${completionRate.toFixed(0)}% 的任务，继续保持这个节奏！`,
        color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      });
    }

    // 4. 完成率中等
    else if (completionRate >= 40 && completionRate < 70 && stats.total >= 5) {
      newInsights.push({
        icon: "💪",
        title: "稳步推进中",
        message: `已完成 ${completionRate.toFixed(0)}%。每天完成 1-2 个小任务可以保持良好的研究节奏。`,
        color: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
      });
    }

    // 5. 完成率低 - 建议
    else if (completionRate < 40 && stats.total >= 5) {
      newInsights.push({
        icon: "⚡",
        title: "需要加速了",
        message: `当前完成率 ${completionRate.toFixed(0)}%。建议先完成高优先级任务，或将大任务拆分为小步骤。`,
        color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      });
    }

    // 6. 待办任务很多
    if (stats.pending > 10) {
      newInsights.push({
        icon: "🔍",
        title: "待办任务较多",
        message: `您有 ${stats.pending} 个待办任务。建议重新评估优先级，专注于最重要的任务。`,
        color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      });
    }

    // 7. 高优先级任务提醒
    if (highPriorityTasks > 0 && stats.pending > 0) {
      newInsights.push({
        icon: "🚨",
        title: "关注高优先级任务",
        message: `您有 ${highPriorityTasks} 个高优先级任务待完成。建议优先处理这些任务。`,
        color: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
      });
    }

    // 8. 全部完成 - 超级表扬
    if (stats.total > 0 && stats.pending === 0) {
      newInsights.push({
        icon: "🏆",
        title: "太棒了！所有任务已完成",
        message: "您已完成所有任务！可以查看统计数据或创建新的任务目标。",
        actionText: "查看统计",
        actionLink: "/dashboard",
        color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      });
    }

    // 9. 使用路线图建议
    if (stats.total === 0 || (stats.total > 0 && stats.total < 5)) {
      newInsights.push({
        icon: "🗺️",
        title: "尝试生成路线图",
        message: "使用 AI 根据您的研究兴趣自动生成详细的任务路线图。",
        actionText: "生成路线图",
        actionLink: "/roadmap",
        color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      });
    }

    // 10. 每日任务建议
    if (stats.pending > 0 && stats.pending <= 5) {
      newInsights.push({
        icon: "☀️",
        title: "今日任务规划",
        message: `您有 ${stats.pending} 个待办任务。建议今天专注完成 1-2 个最重要的任务。`,
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 限制显示数量，最多显示 2 条
    setInsights(newInsights.slice(0, 2));
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginBottom: "24px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: insights.length === 1 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
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
            {/* Color bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: insight.color,
              }}
            />

            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ fontSize: "2rem", flexShrink: 0 }}>{insight.icon}</div>

              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#2d3748",
                    marginBottom: "8px",
                    margin: 0,
                  }}
                >
                  {insight.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#718096",
                    lineHeight: "1.6",
                    margin: 0,
                    marginBottom: insight.actionText ? "12px" : 0,
                  }}
                >
                  {insight.message}
                </p>

                {insight.actionText && insight.actionLink && (
                  <Link href={insight.actionLink} style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "8px 16px",
                        background: insight.color,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      {insight.actionText} →
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
