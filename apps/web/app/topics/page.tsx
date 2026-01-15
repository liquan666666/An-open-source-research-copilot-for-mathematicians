"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
}

export default function TopicsPage() {
  const router = useRouter();
  const [interestOverrides, setInterestOverrides] = useState<Record<number, number>>({});

  useEffect(() => {
    const savedOverrides = localStorage.getItem("topicInterestOverrides");
    if (savedOverrides) {
      setInterestOverrides(JSON.parse(savedOverrides));
    }
  }, []);

  const updateInterest = (topicId: number, value: number) => {
    setInterestOverrides((prev) => {
      const next = { ...prev, [topicId]: value };
      localStorage.setItem("topicInterestOverrides", JSON.stringify(next));
      return next;
    });
  };

  const clampInterest = (value: number) => Math.min(10, Math.max(1, value));

  const handleTopicSelect = (topic: Topic) => {
    // 将选择的课题存储到localStorage
    localStorage.setItem('selectedTopic', JSON.stringify(topic));
    // 跳转到路线图页面
    router.push('/roadmap');
  };

  const topics: Topic[] = [
    {
      id: 1,
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
      id: 2,
      title: "深度学习中的泛化理论研究",
      area: "统计学习理论 · 深度学习",
      difficulty: "较难",
      description: "研究过参数化神经网络的泛化能力，探索隐式正则化现象的数学本质。",
      keywords: ["泛化理论", "神经网络", "统计学习"],
      estimatedDuration: "5-6个月",
      papers: 28,
      interest: 9.0
    },
    {
      id: 3,
      title: "黎曼流形上的最优传输理论",
      area: "微分几何 · 最优传输",
      difficulty: "困难",
      description: "研究黎曼流形上Wasserstein距离的几何性质及其在形状分析中的应用。",
      keywords: ["黎曼几何", "最优传输", "Wasserstein距离"],
      estimatedDuration: "6-8个月",
      papers: 20,
      interest: 8.8
    },
    {
      id: 4,
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
      id: 5,
      title: "随机微分方程的数值求解新方法",
      area: "随机分析 · 数值计算",
      difficulty: "中等",
      description: "开发基于机器学习的随机微分方程高效数值求解算法，提升计算效率。",
      keywords: ["随机微分方程", "数值方法", "机器学习"],
      estimatedDuration: "4-5个月",
      papers: 19,
      interest: 8.3
    },
    {
      id: 6,
      title: "代数拓扑中的持久同调计算方法",
      area: "代数拓扑 · 拓扑数据分析",
      difficulty: "中等",
      description: "研究高维数据的拓扑特征提取，开发快速持久同调计算算法。",
      keywords: ["持久同调", "拓扑数据分析", "计算拓扑"],
      estimatedDuration: "4个月",
      papers: 22,
      interest: 8.1
    },
    {
      id: 7,
      title: "非线性偏微分方程的正则性理论",
      area: "偏微分方程 · 变分法",
      difficulty: "困难",
      description: "研究椭圆型和抛物型方程解的正则性，探索最优正则性条件。",
      keywords: ["PDE", "正则性", "变分法"],
      estimatedDuration: "6-7个月",
      papers: 17,
      interest: 7.9
    },
    {
      id: 8,
      title: "高维概率分布的采样算法收敛性分析",
      area: "概率论 · 统计学",
      difficulty: "中等",
      description: "研究Langevin动力学等采样算法在非凸情况下的收敛速度，改进现有界限。",
      keywords: ["概率论", "MCMC", "收敛分析"],
      estimatedDuration: "3个月",
      papers: 18,
      interest: 7.8
    },
    {
      id: 9,
      title: "谱图理论在网络科学中的应用",
      area: "图论 · 网络科学",
      difficulty: "中等",
      description: "利用图的谱性质分析复杂网络结构，研究社区检测和网络中心性问题。",
      keywords: ["谱图理论", "复杂网络", "社区检测"],
      estimatedDuration: "3-4个月",
      papers: 21,
      interest: 7.6
    },
    {
      id: 10,
      title: "模形式与椭圆曲线的算术性质",
      area: "数论 · 代数几何",
      difficulty: "困难",
      description: "研究模形式与椭圆曲线L函数之间的关系，探索BSD猜想的特殊情形。",
      keywords: ["数论", "模形式", "椭圆曲线"],
      estimatedDuration: "7-8个月",
      papers: 14,
      interest: 7.4
    },
    {
      id: 11,
      title: "算子代数中的K理论及其应用",
      area: "泛函分析 · 算子代数",
      difficulty: "困难",
      description: "研究C*-代数的K理论分类，探索在量子场论中的应用。",
      keywords: ["算子代数", "K理论", "量子场论"],
      estimatedDuration: "6-7个月",
      papers: 16,
      interest: 7.2
    },
    {
      id: 12,
      title: "凸优化在统计推断中的理论与应用",
      area: "凸优化 · 统计学",
      difficulty: "中等",
      description: "研究高维统计问题的凸松弛方法，分析估计量的统计性质。",
      keywords: ["凸优化", "高维统计", "稀疏估计"],
      estimatedDuration: "4-5个月",
      papers: 25,
      interest: 7.0
    }
  ];

  const scoredTopics = useMemo(
    () =>
      topics.map((topic) => ({
        ...topic,
        interest: interestOverrides[topic.id] ?? topic.interest
      })),
    [interestOverrides, topics]
  );

  // 按兴趣评分降序排序
  const sortedTopics = [...scoredTopics].sort((a, b) => b.interest - a.interest);

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#2d3748", marginBottom: "8px" }}>
          🎛️ 调整研究兴趣
        </h3>
        <p style={{ color: "#4a5568", margin: 0, lineHeight: "1.6" }}>
          通过下面每个课题的兴趣评分滑块，直接调整排序结果，系统会记住你的偏好。
        </p>
      </motion.div>

      {/* Topics */}
      {sortedTopics.map((topic, index) => (
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

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#2d3748" }}>
              🎚️ 兴趣评分调整
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.1}
              value={topic.interest}
              onChange={(event) => updateInterest(topic.id, clampInterest(Number(event.target.value)))}
              style={{ flex: 1, accentColor: "#667eea" }}
            />
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={topic.interest}
              onChange={(event) => updateInterest(topic.id, clampInterest(Number(event.target.value)))}
              style={{
                width: "80px",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "0.9rem",
                color: "#4a5568"
              }}
            />
          </div>

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
            onClick={() => handleTopicSelect(topic)}
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
