"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ResearchInterest {
  id: number;
  topic: string;
  description: string;
  level: string;
  priority: number;
}

interface Topic {
  id: number;
  title: string;
  area: string;
  difficulty: string;
  description: string;
  keywords: string[];
  estimatedDuration: string;
  papers: number;
  interest: number;
  relatedInterests: string[];
}

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [interests, setInterests] = useState<ResearchInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const difficultyColors = {
    "简单": "#43e97b",
    "中等": "#4facfe",
    "较难": "#f093fb",
    "困难": "#f5576c"
  };

  useEffect(() => {
    // 从localStorage加载用户兴趣
    const savedInterests = localStorage.getItem("researchInterests");
    let userInterests: ResearchInterest[] = [];

    if (savedInterests) {
      try {
        userInterests = JSON.parse(savedInterests);
        setInterests(userInterests);
      } catch (e) {
        console.error("Failed to parse interests:", e);
      }
    }

    // 调用后端API获取推荐
    fetchRecommendations(userInterests);
  }, []);

  const fetchRecommendations = async (userInterests: ResearchInterest[]) => {
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/topics/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          interests: userInterests
        })
      });

      if (!response.ok) {
        throw new Error("获取推荐失败");
      }

      const data = await response.json();
      setTopics(data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err instanceof Error ? err.message : "获取推荐失败");
      // 显示默认推荐
      setTopics(getDefaultTopics());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTopics = (): Topic[] => {
    return [
      {
        id: 1,
        title: "拓扑空间中的不动点定理及其应用",
        area: "拓扑学 · 泛函分析",
        difficulty: "中等",
        description: "研究非紧拓扑空间上的不动点定理，探索其在微分方程解的存在性证明中的应用。",
        keywords: ["不动点定理", "拓扑空间", "微分方程"],
        estimatedDuration: "3-4个月",
        papers: 15,
        interest: 7.0,
        relatedInterests: ["通用推荐"]
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
        interest: 7.0,
        relatedInterests: ["通用推荐"]
      }
    ];
  };

  const selectTopic = (topic: Topic) => {
    // 保存选择的课题到localStorage
    localStorage.setItem("selectedTopic", JSON.stringify(topic));
    // 跳转到路线图页面
    router.push("/roadmap");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#ffffff" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: "3rem", marginBottom: "20px" }}
          >
            ⚙️
          </motion.div>
          <p style={{ fontSize: "1.2rem" }}>正在为您生成个性化推荐...</p>
        </div>
      </div>
    );
  }

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
          {interests.length > 0
            ? `基于您的 ${interests.length} 个研究兴趣，为您推荐以下课题`
            : "为您推荐以下热门研究课题"}
        </p>
      </motion.div>

      {/* 如果没有设置兴趣，提示用户 */}
      {interests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            background: "rgba(249, 168, 37, 0.15)",
            borderRadius: "12px",
            border: "1px solid rgba(249, 168, 37, 0.3)",
            color: "#ffffff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>💡</span>
            <div>
              <p style={{ margin: 0, fontWeight: "600" }}>提示：还没有设置研究兴趣</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", opacity: 0.9 }}>
                <Link href="/interests" style={{ color: "#ffa500", textDecoration: "underline" }}>
                  点击这里设置您的研究兴趣
                </Link>
                ，获取更精准的个性化推荐
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            background: "rgba(239, 68, 68, 0.15)",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ffffff"
          }}
        >
          ⚠️ {error} - 显示默认推荐
        </motion.div>
      )}

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

          {/* Related Interests */}
          {topic.relatedInterests && topic.relatedInterests.length > 0 && topic.relatedInterests[0] !== "通用推荐" && (
            <div style={{ marginBottom: "12px" }}>
              <span style={{
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                background: "rgba(102, 126, 234, 0.15)",
                color: "#667eea",
                fontWeight: "600"
              }}>
                🎯 匹配您的兴趣: {topic.relatedInterests.join(", ")}
              </span>
            </div>
          )}

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
            onClick={() => selectTopic(topic)}
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
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              width: "100%"
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
          <li>兴趣评分基于课题与您研究兴趣的匹配度、优先级等因素计算</li>
          <li>建议选择与自己基础知识和研究水平匹配的难度等级</li>
          <li>点击"选择此课题"后，系统将为您生成详细的个性化研究路线图</li>
          <li>可以在「论文库」中查找相关文献进行深入了解</li>
          {interests.length === 0 && (
            <li style={{ color: "#f5576c", fontWeight: "600" }}>
              💡 先设置研究兴趣，可获得更精准的课题推荐！
            </li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
