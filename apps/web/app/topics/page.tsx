"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TopicsPage() {
  const topics = [
    {
      id: 1,
      title: "拓扑空间中的不动点定理及其应用",
      area: "拓扑学 · 泛函分析",
      difficulty: "中等",
      description: "研究非紧拓扑空间上的不动点定理，探索其在微分方程解的存在性证明中的应用。",
      keywords: ["不动点定理", "拓扑空间", "微分方程"],
      estimatedDuration: "3-4个月",
      papers: 15,
      interest: 8.5
    },
    {
      id: 2,
      title: "图神经网络在组合优化中的理论基础",
      area: "图论 · 机器学习理论",
      difficulty: "较难",
      description: "从数学角度分析图神经网络求解NP难问题的近似能力，建立理论保证。",
      keywords: ["图论", "神经网络", "组合优化"],
      estimatedDuration: "4-6个月",
      papers: 23,
      interest: 9.2
    },
    {
      id: 3,
      title: "高维概率分布的采样算法收敛性分析",
      area: "概率论 · 统计学",
      difficulty: "中等",
      description: "研究Langevin动力学等采样算法在非凸情况下的收敛速度，改进现有界限。",
      keywords: ["概率论", "MCMC", "收敛分析"],
      estimatedDuration: "3个月",
      papers: 18,
      interest: 7.8
    }
  ];

  const difficultyColors = {
    "简单": "#43e97b",
    "中等": "#4facfe",
    "较难": "#f093fb",
    "困难": "#f5576c"
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "40px" }}
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
          课题推荐 🎯
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          基于您的研究方向和兴趣，为您推荐以下课题
        </p>
      </motion.div>

      {/* Topics */}
      {topics.map((topic, index) => (
        <motion.div
          key={topic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.15 }}
          whileHover={{ scale: 1.02 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2d3748", margin: 0, flex: 1 }}>
              {topic.title}
            </h3>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "600",
              marginLeft: "16px",
              whiteSpace: "nowrap"
            }}>
              ⭐ {topic.interest}
            </div>
          </div>

          {/* Area & Difficulty */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "rgba(102, 126, 234, 0.1)",
              color: "#667eea"
            }}>
              📚 {topic.area}
            </span>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: `${difficultyColors[topic.difficulty as keyof typeof difficultyColors]}15`,
              color: difficultyColors[topic.difficulty as keyof typeof difficultyColors]
            }}>
              🎯 {topic.difficulty}
            </span>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "rgba(67, 233, 123, 0.1)",
              color: "#43e97b"
            }}>
              ⏱️ {topic.estimatedDuration}
            </span>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "rgba(79, 172, 254, 0.1)",
              color: "#4facfe"
            }}>
              📄 {topic.papers} 篇相关论文
            </span>
          </div>

          {/* Description */}
          <p style={{ color: "#4a5568", lineHeight: "1.7", marginBottom: "16px" }}>
            {topic.description}
          </p>

          {/* Keywords */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {topic.keywords.map((keyword, i) => (
              <span key={i} style={{
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                background: "#f8f9fa",
                color: "#718096",
                border: "1px solid #e9ecef"
              }}>
                #{keyword}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}
          >
            选择此课题并生成路线图 →
          </motion.button>
        </motion.div>
      ))}

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          marginTop: "32px",
          padding: "24px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
          💡 选题建议
        </h4>
        <ul style={{ color: "#4a5568", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
          <li>兴趣评分综合考虑了课题的创新性、可行性和学术价值</li>
          <li>建议选择与自己基础知识匹配的难度等级</li>
          <li>点击"选择此课题"后，系统将为您生成详细的研究路线图</li>
          <li>可以在「论文库」中查找相关文献进行深入了解</li>
        </ul>
      </motion.div>
    </div>
  );
}
