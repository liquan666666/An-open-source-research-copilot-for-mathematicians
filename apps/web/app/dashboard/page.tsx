"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Paywall from "../../components/Paywall";
import {
  getUserBehavior,
  getMostVisitedPages,
  getMostUsedFeatures,
  getActivityByHour,
  getRecentActivity,
  getUserEngagementScore,
  getBehaviorInsights,
  trackPageView
} from "../../lib/analytics";
import { getPersonalizedRecommendations, getFeatureUsageTips, getUnusedFeatures } from "../../lib/recommendations";

export default function DashboardPage() {
  const [behavior, setBehavior] = useState<any>(null);
  const [engagementScore, setEngagementScore] = useState(0);
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [unusedFeatures, setUnusedFeatures] = useState<any[]>([]);

  useEffect(() => {
    trackPageView('/dashboard');

    const data = getUserBehavior();
    setBehavior(data);
    setEngagementScore(getUserEngagementScore());
    setInsights(getBehaviorInsights());
    setRecommendations(getPersonalizedRecommendations());
    setTips(getFeatureUsageTips());
    setUnusedFeatures(getUnusedFeatures());
  }, []);

  if (!behavior) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "2rem" }}>⏳ 加载中...</div>
      </div>
    );
  }

  const mostVisited = getMostVisitedPages(5);
  const mostUsed = getMostUsedFeatures(5);
  const recentActivity = getRecentActivity(7);
  const hourlyActivity = getActivityByHour();

  // 计算活跃度等级
  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { label: "超级活跃", color: "#43e97b", icon: "🌟" };
    if (score >= 60) return { label: "非常活跃", color: "#667eea", icon: "⭐" };
    if (score >= 40) return { label: "活跃", color: "#ffa500", icon: "✨" };
    if (score >= 20) return { label: "一般", color: "#f5576c", icon: "💫" };
    return { label: "较少", color: "#718096", icon: "🌙" };
  };

  const engagementLevel = getEngagementLevel(engagementScore);

  return (
    <Paywall>
      <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "32px" }}
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
            数据仪表板 📊
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
            全面了解您的使用情况和研究进度
          </p>
        </motion.div>

        {/* 活跃度评分 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            background: `linear-gradient(135deg, ${engagementLevel.color} 0%, rgba(255,255,255,0.9) 100%)`,
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", marginBottom: "8px" }}>
                您的活跃度评分
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{ fontSize: "4rem", fontWeight: "800", color: "white" }}>
                  {engagementScore}
                </span>
                <div>
                  <div style={{ fontSize: "1.5rem", color: "white", fontWeight: "600" }}>
                    {engagementLevel.icon} {engagementLevel.label}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
                    总操作: {behavior.totalActions} 次
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", marginBottom: "4px" }}>
                最活跃时段
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "white" }}>
                {insights.mostActiveHour}:00
              </div>
            </div>
          </div>
        </motion.div>

        {/* 智能推荐 */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "28px",
              marginBottom: "24px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "20px"
            }}>
              💡 智能推荐
            </h3>

            <div style={{ display: "grid", gap: "12px" }}>
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{
                    padding: "16px",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    borderLeft: `4px solid ${
                      rec.type === 'upgrade' ? '#ffa500' :
                      rec.type === 'feature' ? '#667eea' :
                      rec.type === 'task' ? '#43e97b' : '#f5576c'
                    }`
                  }}
                >
                  <div style={{ fontSize: "2rem" }}>{rec.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "4px" }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                      {rec.description}
                    </div>
                  </div>
                  {rec.href && (
                    <Link href={rec.href} style={{ textDecoration: "none" }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: "8px 16px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {rec.action}
                      </motion.button>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 使用提示 */}
        {tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "rgba(255, 243, 205, 0.95)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              border: "1px solid #ffc107"
            }}
          >
            <h4 style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#856404",
              marginBottom: "12px"
            }}>
              💡 使用提示
            </h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#856404", lineHeight: "1.8" }}>
              {tips.map((tip, i) => (
                <li key={i} style={{ fontSize: "0.9rem" }}>{tip}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* 最常访问的页面 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "20px"
            }}>
              📊 最常访问的页面
            </h3>

            {mostVisited.map((item, index) => (
              <div
                key={item.page}
                style={{
                  padding: "12px 0",
                  borderBottom: index < mostVisited.length - 1 ? "1px solid #e9ecef" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                  {item.page}
                </span>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  background: "#667eea",
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: "600"
                }}>
                  {item.count} 次
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "20px"
            }}>
              ⭐ 最常使用的功能
            </h3>

            {mostUsed.length > 0 ? (
              mostUsed.map((item, index) => (
                <div
                  key={item.feature}
                  style={{
                    padding: "12px 0",
                    borderBottom: index < mostUsed.length - 1 ? "1px solid #e9ecef" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                    {item.feature}
                  </span>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: "#43e97b",
                    color: "white",
                    fontSize: "0.8rem",
                    fontWeight: "600"
                  }}>
                    {item.count} 次
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#718096", padding: "20px" }}>
                暂无功能使用记录
              </div>
            )}
          </motion.div>
        </div>

        {/* 最近7天活动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <h3 style={{
            fontSize: "1.3rem",
            fontWeight: "700",
            color: "#2d3748",
            marginBottom: "20px"
          }}>
            📈 最近7天活动
          </h3>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "200px" }}>
            {recentActivity.map((day) => {
              const maxCount = Math.max(...recentActivity.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;

              return (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    style={{
                      width: "100%",
                      background: day.count > 0
                        ? "linear-gradient(to top, #667eea 0%, #764ba2 100%)"
                        : "#e9ecef",
                      borderRadius: "8px 8px 0 0",
                      minHeight: "4px",
                      position: "relative"
                    }}
                  >
                    {day.count > 0 && (
                      <div style={{
                        position: "absolute",
                        top: "-25px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "#667eea",
                        whiteSpace: "nowrap"
                      }}>
                        {day.count}
                      </div>
                    )}
                  </motion.div>
                  <div style={{
                    fontSize: "0.7rem",
                    color: "#718096",
                    transform: "rotate(-45deg)",
                    whiteSpace: "nowrap",
                    marginTop: "8px"
                  }}>
                    {new Date(day.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 未使用的功能 */}
        {unusedFeatures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "20px"
            }}>
              🔍 发现更多功能
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
              {unusedFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  style={{ textDecoration: "none" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "16px",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      transition: "border-color 0.2s"
                    }}
                    onMouseEnter={(e: any) => e.target.style.borderColor = "#667eea"}
                    onMouseLeave={(e: any) => e.target.style.borderColor = "transparent"}
                  >
                    <div style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      color: "#2d3748",
                      marginBottom: "4px"
                    }}>
                      {feature.name}
                    </div>
                    <div style={{
                      fontSize: "0.8rem",
                      color: "#718096"
                    }}>
                      {feature.description}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Paywall>
  );
}
