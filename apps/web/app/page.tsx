"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { trackPageView } from "../lib/analytics";
import SmartRecommendations from "../components/SmartRecommendations";

export default function Home() {
  useEffect(() => {
    trackPageView('/');
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cards = [
    {
      title: "我的研究兴趣",
      desc: "自定义和管理您的研究方向与兴趣",
      icon: "🎯",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      href: "/interests",
    },
    {
      title: "课题推荐",
      desc: "根据研究方向/偏好推荐可做课题",
      icon: "💡",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      href: "/topics",
    },
    {
      title: "论文库",
      desc: "检索论文并提供下载链接",
      icon: "📚",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      href: "/papers",
    },
    {
      title: "论文阅读助手",
      desc: "智能提取论文知识点，辅助文献阅读",
      icon: "🤖",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      href: "/paper-assistant",
    },
    {
      title: "路线图",
      desc: "生成可执行研究路线（周/日粒度）",
      icon: "🗺️",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      href: "/roadmap",
    },
    {
      title: "今日任务",
      desc: "为今天分配任务并追踪",
      icon: "✅",
      color: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
      href: "/tasks",
    },
    {
      title: "打卡监督",
      desc: "每日提交完成情况与障碍",
      icon: "📊",
      color: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
      href: "/checkin",
    },
    {
      title: "会员订阅",
      desc: "查看订阅计划和管理您的会员",
      icon: "💎",
      color: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      href: "/pricing",
    },
    {
      title: "账户管理",
      desc: "管理订阅、查看统计和导出数据",
      icon: "👤",
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      href: "/account",
    },
    {
      title: "数据仪表板",
      desc: "智能推荐和全面的使用分析",
      icon: "📈",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      href: "/dashboard",
    },
    {
      title: "帮助中心",
      desc: "常见问题解答和使用指南",
      icon: "📖",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      href: "/help",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        style={{
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "16px",
            textShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          MathResearchPilot
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#ffffff",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.8",
            textShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          面向数学研究者的开源研究执行系统
          <br />
          推荐课题 · 检索论文 · 生成路线 · 监督完成
        </p>
      </motion.div>

      {/* Smart Recommendations */}
      <SmartRecommendations />

      <motion.div
        variants={containerVariants}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginTop: "40px",
        }}
      >
        {cards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </motion.div>

      <motion.div
        variants={itemVariants}
        style={{
          marginTop: "48px",
          padding: "24px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>💡</span>
          <p
            style={{
              margin: 0,
              fontSize: "1rem",
              color: "#4a5568",
              lineHeight: "1.6",
            }}
          >
            <strong style={{ color: "#2d3748" }}>快速开始：</strong>
            首先在「我的研究兴趣」中添加您的研究方向，然后访问「课题推荐」浏览推荐课题，使用「论文阅读助手」高效阅读文献并提取知识点，前往「路线图」生成详细的执行计划，最后通过「今日任务」和「打卡监督」追踪研究进度。
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Card({
  title,
  desc,
  icon,
  color,
  href,
}: {
  title: string;
  desc: string;
  icon: string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
          },
        },
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        padding: "28px",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "5px",
          background: color,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <div
        style={{
          fontSize: "3rem",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.4,
          }}
          style={{ display: "inline-block" }}
        >
          {icon}
        </motion.span>
      </div>
      <div
        style={{
          fontWeight: "700",
          fontSize: "1.4rem",
          marginBottom: "12px",
          color: "#2d3748",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "0.95rem",
          color: "#718096",
          lineHeight: "1.6",
          textAlign: "center",
        }}
      >
        {desc}
      </div>
    </motion.div>
    </Link>
  );
}


