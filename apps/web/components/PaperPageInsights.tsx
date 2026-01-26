"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface PaperInsight {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  color: string;
}

export default function PaperPageInsights() {
  const [insights, setInsights] = useState<PaperInsight[]>([]);
  const [savedPapersCount, setSavedPapersCount] = useState(0);
  const [hasInterests, setHasInterests] = useState(false);

  useEffect(() => {
    fetchDataAndGenerateInsights();
  }, []);

  const fetchDataAndGenerateInsights = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // 未登录用户提示
        setInsights([
          {
            icon: "🔐",
            title: "登录后保存论文",
            message: "登录账号后，您可以保存感兴趣的论文，并使用 AI 助手进行分析。",
            actionText: "去登录",
            actionLink: "/auth/login",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          },
        ]);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${token}` };

      const [papersRes, interestsRes] = await Promise.all([
        fetch(`${apiUrl}/papers/saved`, { headers }).catch(() => null),
        fetch(`${apiUrl}/profile/interests`, { headers }).catch(() => null),
      ]);

      const papers = papersRes?.ok ? await papersRes.json() : [];
      const interests = interestsRes?.ok ? await interestsRes.json() : [];

      setSavedPapersCount(papers.length || 0);
      setHasInterests(interests.length > 0);

      generateInsights(papers.length || 0, interests.length > 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generateInsights = (papersCount: number, hasInterests: boolean) => {
    const newInsights: PaperInsight[] = [];

    // 1. 首次使用 - 没有保存任何论文
    if (papersCount === 0) {
      newInsights.push({
        icon: "🔍",
        title: "开始搜索论文",
        message: "输入关键词搜索 arXiv 或 SCI 期刊论文，找到感兴趣的论文后可以保存到个人库。",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });

      if (!hasInterests) {
        newInsights.push({
          icon: "🎯",
          title: "设置研究兴趣",
          message: "添加研究兴趣后，系统可以为您推荐相关论文。",
          actionText: "添加兴趣",
          actionLink: "/interests",
          color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        });
      }
    }

    // 2. 已保存少量论文
    else if (papersCount > 0 && papersCount < 5) {
      newInsights.push({
        icon: "📚",
        title: `已保存 ${papersCount} 篇论文`,
        message: "继续构建您的论文库，建议定期阅读和整理。",
        color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      });

      newInsights.push({
        icon: "🤖",
        title: "使用 AI 分析论文",
        message: "论文阅读助手可以帮您快速提取关键信息、总结要点和生成阅读笔记。",
        actionText: "试试 AI 助手",
        actionLink: "/paper-assistant",
        color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      });
    }

    // 3. 已保存中等数量论文
    else if (papersCount >= 5 && papersCount < 20) {
      newInsights.push({
        icon: "📖",
        title: "论文库逐渐丰富",
        message: `您已保存 ${papersCount} 篇论文。使用 AI 助手可以帮助您更高效地阅读和理解这些论文。`,
        actionText: "查看论文库",
        actionLink: "/papers/saved",
        color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      });

      newInsights.push({
        icon: "💡",
        title: "获取论文推荐",
        message: "基于您的阅读历史，AI 可以为您推荐相关的研究论文。",
        actionText: "查看推荐",
        actionLink: "/dashboard",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 4. 已保存大量论文
    else if (papersCount >= 20) {
      newInsights.push({
        icon: "🎓",
        title: "论文库很丰富！",
        message: `您已保存 ${papersCount} 篇论文，建立了扎实的文献基础。建议定期回顾和整理。`,
        color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      });

      newInsights.push({
        icon: "📊",
        title: "查看阅读统计",
        message: "查看您的论文阅读统计和知识领域分布。",
        actionText: "查看统计",
        actionLink: "/dashboard",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      });
    }

    // 5. 搜索技巧提示（随机显示）
    if (Math.random() > 0.5) {
      newInsights.push({
        icon: "💡",
        title: "搜索技巧",
        message: "使用英文关键词搜索效果更好。尝试组合多个关键词，如 \"deep learning mathematics\"。",
        color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      });
    }

    // 6. 数据源选择提示
    if (papersCount < 3) {
      newInsights.push({
        icon: "🌐",
        title: "选择合适的数据源",
        message: "arXiv 适合查找最新预印本，SCI 期刊适合查找已发表的高质量论文。",
        color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      });
    }

    // 最多显示 2 条
    setInsights(newInsights.slice(0, 2));
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "18px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: insight.color,
              }}
            />

            <div style={{ display: "flex", alignItems: "start", gap: "14px" }}>
              <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{insight.icon}</div>

              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: "#2d3748",
                    marginBottom: "6px",
                    margin: 0,
                  }}
                >
                  {insight.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#718096",
                    lineHeight: "1.5",
                    margin: 0,
                    marginBottom: insight.actionText ? "10px" : 0,
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
                        padding: "6px 14px",
                        background: insight.color,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
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
