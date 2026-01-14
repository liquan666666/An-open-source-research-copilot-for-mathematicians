"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          color: "white",
          marginBottom: 50
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            textShadow: "0 2px 20px rgba(0,0,0,0.2)"
          }}>
            🎓 MathResearchPilot
          </h1>
          <p style={{
            fontSize: 18,
            marginTop: 16,
            opacity: 0.95,
            fontWeight: 300,
            maxWidth: 600,
            margin: "16px auto 0"
          }}>
            面向数学研究者的智能研究助手
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 40,
          }}
        >
          <FeatureCard
            icon="👤"
            title="用户资料"
            desc="设置研究方向和个人偏好"
            href="/profile"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <FeatureCard
            icon="💡"
            title="课题推荐"
            desc="基于AI的智能课题推荐系统"
            href="/topics"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <FeatureCard
            icon="📚"
            title="论文库"
            desc="全球学术论文检索与管理"
            href="/papers"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
          <FeatureCard
            icon="🗺️"
            title="研究路线图"
            desc="AI生成多阶段研究计划"
            href="/roadmap"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
          <FeatureCard
            icon="✅"
            title="今日任务"
            desc="每日任务追踪与管理"
            href="/tasks"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
          <FeatureCard
            icon="📊"
            title="打卡监督"
            desc="进度统计与效率分析"
            href="/checkins"
            gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
          />
        </div>

        {/* Info Section */}
        <div style={{
          marginTop: 50,
          padding: 30,
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: 22,
            fontWeight: 700,
            color: "#333"
          }}>
            🚀 快速开始
          </h3>
          <ol style={{
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.8,
            color: "#555"
          }}>
            <li><strong>设置资料</strong> → 配置研究领域和兴趣方向</li>
            <li><strong>获取推荐</strong> → AI为你推荐合适的研究课题</li>
            <li><strong>检索论文</strong> → 搜索全球学术数据库（支持中文）</li>
            <li><strong>生成路线</strong> → 自动规划研究时间表</li>
            <li><strong>执行任务</strong> → 每日任务管理与进度追踪</li>
          </ol>
        </div>

        {/* Stats Footer */}
        <div style={{
          marginTop: 30,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          flexWrap: "wrap"
        }}>
          <StatCard label="数据源" value="arXiv + Semantic Scholar" />
          <StatCard label="支持语言" value="中英文双语" />
          <StatCard label="论文排序" value="引用数/年份/相关性" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  href,
  gradient
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: 30,
        background: "white",
        borderRadius: 20,
        textDecoration: "none",
        color: "inherit",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
      }}
    >
      {/* Gradient accent bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: gradient
      }} />

      <div style={{
        fontSize: 40,
        marginBottom: 16,
        display: "inline-block"
      }}>
        {icon}
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: 20,
        marginBottom: 8,
        color: "#1a1a1a"
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 14,
        lineHeight: 1.6,
        color: "#666"
      }}>
        {desc}
      </div>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      textAlign: "center",
      color: "white"
    }}>
      <div style={{
        fontSize: 13,
        opacity: 0.8,
        marginBottom: 4,
        fontWeight: 500
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 16,
        fontWeight: 700,
        textShadow: "0 2px 10px rgba(0,0,0,0.2)"
      }}>
        {value}
      </div>
    </div>
  );
}


