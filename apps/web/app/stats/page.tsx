"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Paywall from "../../components/Paywall";

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalDays: 15,
    checkIns: 12,
    tasksCompleted: 45,
    papersRead: 23,
    interestsAdded: 5,
    roadmapsGenerated: 3,
    avgCompletion: 78
  });

  // 模拟每周数据
  const weeklyData = [
    { week: "第1周", tasks: 8, papers: 5, checkIns: 3 },
    { week: "第2周", tasks: 12, papers: 7, checkIns: 4 },
    { week: "第3周", tasks: 10, papers: 6, checkIns: 2 },
    { week: "当前周", tasks: 15, papers: 5, checkIns: 3 },
  ];

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
            使用统计 📊
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
            追踪您的研究进度和使用数据
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          {[
            { label: "使用天数", value: stats.totalDays, unit: "天", icon: "📅", color: "#667eea" },
            { label: "打卡次数", value: stats.checkIns, unit: "次", icon: "✅", color: "#43e97b" },
            { label: "完成任务", value: stats.tasksCompleted, unit: "个", icon: "📝", color: "#f5576c" },
            { label: "阅读论文", value: stats.papersRead, unit: "篇", icon: "📚", color: "#ffa500" },
            { label: "研究兴趣", value: stats.interestsAdded, unit: "项", icon: "🎯", color: "#764ba2" },
            { label: "生成路线", value: stats.roadmapsGenerated, unit: "次", icon: "🗺️", color: "#4facfe" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: stat.color
              }} />

              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "0.85rem", color: "#718096", marginBottom: "4px" }}>
                {stat.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "2rem", fontWeight: "800", color: "#2d3748" }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#718096" }}>
                  {stat.unit}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 完成率 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
            📈 平均完成率
          </h3>

          <div style={{ position: "relative" }}>
            <div style={{
              height: "60px",
              background: "#e9ecef",
              borderRadius: "30px",
              overflow: "hidden"
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.avgCompletion}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "20px"
                }}
              >
                <span style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "white",
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  {stats.avgCompletion}%
                </span>
              </motion.div>
            </div>
            <p style={{
              marginTop: "12px",
              fontSize: "0.9rem",
              color: "#718096",
              textAlign: "center"
            }}>
              您的任务完成率超过了 85% 的用户！继续保持！ 🎉
            </p>
          </div>
        </motion.div>

        {/* 每周趋势 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
            📊 每周趋势
          </h3>

          <div style={{ display: "grid", gap: "16px" }}>
            {weeklyData.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                style={{
                  padding: "20px",
                  background: "#f8f9fa",
                  borderRadius: "12px"
                }}
              >
                <div style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#2d3748",
                  marginBottom: "12px"
                }}>
                  {week.week}
                </div>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>📝</span>
                    <span style={{ fontSize: "0.85rem", color: "#718096" }}>
                      任务: <strong style={{ color: "#2d3748" }}>{week.tasks}</strong>
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>📚</span>
                    <span style={{ fontSize: "0.85rem", color: "#718096" }}>
                      论文: <strong style={{ color: "#2d3748" }}>{week.papers}</strong>
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>✅</span>
                    <span style={{ fontSize: "0.85rem", color: "#718096" }}>
                      打卡: <strong style={{ color: "#2d3748" }}>{week.checkIns}</strong>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 成就徽章 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
            🏆 成就徽章
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px"
          }}>
            {[
              { name: "早起鸟", icon: "🌅", desc: "连续7天打卡", unlocked: true },
              { name: "论文达人", icon: "📚", desc: "阅读20篇论文", unlocked: true },
              { name: "执行力", icon: "💪", desc: "完成50个任务", unlocked: false },
              { name: "专注", icon: "🎯", desc: "单周打卡7天", unlocked: false },
            ].map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: badge.unlocked ? 1.1 : 1 }}
                style={{
                  padding: "20px",
                  background: badge.unlocked
                    ? "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)"
                    : "#f8f9fa",
                  borderRadius: "16px",
                  textAlign: "center",
                  opacity: badge.unlocked ? 1 : 0.5,
                  border: badge.unlocked ? "2px solid #ffa500" : "1px solid #e9ecef"
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "8px" }}>
                  {badge.icon}
                </div>
                <div style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: badge.unlocked ? "white" : "#2d3748",
                  marginBottom: "4px"
                }}>
                  {badge.name}
                </div>
                <div style={{
                  fontSize: "0.75rem",
                  color: badge.unlocked ? "rgba(255,255,255,0.9)" : "#718096"
                }}>
                  {badge.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Paywall>
  );
}
