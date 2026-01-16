"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface CheckIn {
  date: string;
  completed: number;
  total: number;
  notes: string;
  challenges: string;
  mood: string;
}

export default function CheckInPage() {
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentChallenges, setCurrentChallenges] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");

  const moods = [
    { emoji: "😊", label: "顺利", value: "good" },
    { emoji: "😐", label: "一般", value: "okay" },
    { emoji: "😣", label: "困难", value: "hard" },
    { emoji: "😤", label: "挫折", value: "frustrated" }
  ];

  const history: CheckIn[] = [
    {
      date: "2026-01-13",
      completed: 4,
      total: 5,
      notes: "完成了泛函分析的学习，理解了Banach不动点定理的证明。数值实验验证了猜想的特殊情况。",
      challenges: "定理3.5的证明有些难理解，需要明天继续推敲。",
      mood: "good"
    },
    {
      date: "2026-01-12",
      completed: 3,
      total: 5,
      notes: "查阅了15篇相关文献，整理了核心观点。开始撰写文献综述部分。",
      challenges: "有些论文的数学记号不统一，需要仔细对比。时间管理需要改进。",
      mood: "okay"
    },
    {
      date: "2026-01-11",
      completed: 2,
      total: 4,
      notes: "参加了组会，导师提出了一些很有价值的建议。",
      challenges: "研究方向需要调整，之前的一些工作可能要重做。感觉有点沮丧但这是正常的。",
      mood: "frustrated"
    }
  ];

  const getMoodEmoji = (mood: string) => {
    const found = moods.find(m => m.value === mood);
    return found ? found.emoji : "😊";
  };

  const totalDays = history.length;
  const avgCompletion = history.reduce((sum, day) => sum + (day.completed / day.total), 0) / totalDays;
  const streak = 3; // 连续打卡天数

  return (
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
          打卡监督 📊
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          记录每日进展，养成良好的研究习惯
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)"
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>连续打卡</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>🔥 {streak} 天</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 20px rgba(240, 147, 251, 0.3)"
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>总打卡天数</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>📅 {totalDays} 天</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 20px rgba(67, 233, 123, 0.3)"
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>平均完成率</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>✨ {(avgCompletion * 100).toFixed(0)}%</div>
        </motion.div>
      </div>

      {/* Today's Check-in */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h3 style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "20px"
        }}>
          今日打卡 - {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </h3>

        {/* Mood Selection */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "1rem",
            fontWeight: "600",
            color: "#2d3748",
            marginBottom: "12px"
          }}>
            今天的研究状态如何？
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {moods.map((mood) => (
              <motion.div
                key={mood.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(mood.value)}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: selectedMood === mood.value
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#f8f9fa",
                  color: selectedMood === mood.value ? "white" : "#4a5568",
                  border: `2px solid ${selectedMood === mood.value ? "#667eea" : "#e9ecef"}`,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "4px" }}>{mood.emoji}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{mood.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontSize: "1rem",
            fontWeight: "600",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            今日完成内容
          </label>
          <textarea
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="记录今天完成了什么工作，有哪些收获..."
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "14px",
              fontSize: "0.95rem",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: "1.6"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
        </div>

        {/* Challenges */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "1rem",
            fontWeight: "600",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            遇到的困难与障碍
          </label>
          <textarea
            value={currentChallenges}
            onChange={(e) => setCurrentChallenges(e.target.value)}
            placeholder="记录今天遇到的问题，明天需要解决的事项..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "14px",
              fontSize: "0.95rem",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: "1.6"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
          }}
        >
          ✅ 提交今日打卡
        </motion.button>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: "16px"
        }}>
          打卡历史
        </h3>

        {history.map((item, index) => (
          <motion.div
            key={item.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "2rem" }}>{getMoodEmoji(item.mood)}</span>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748" }}>
                    {new Date(item.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#718096" }}>
                    完成 {item.completed}/{item.total} 个任务
                  </div>
                </div>
              </div>
              <div style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "600",
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white"
              }}>
                {((item.completed / item.total) * 100).toFixed(0)}%
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4a5568", marginBottom: "4px" }}>
                完成内容：
              </div>
              <div style={{ fontSize: "0.9rem", color: "#4a5568", lineHeight: "1.5" }}>
                {item.notes}
              </div>
            </div>

            {item.challenges && (
              <div style={{
                padding: "12px",
                background: "#fff3cd",
                borderRadius: "8px",
                borderLeft: "4px solid #ffc107"
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#856404", marginBottom: "4px" }}>
                  ⚠️ 遇到的困难：
                </div>
                <div style={{ fontSize: "0.9rem", color: "#856404", lineHeight: "1.5" }}>
                  {item.challenges}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{
          marginTop: "24px",
          padding: "24px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
          💡 打卡建议
        </h4>
        <ul style={{ color: "#4a5568", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
          <li>每天晚上抽出10分钟进行打卡，养成习惯</li>
          <li>如实记录遇到的困难，这有助于及时寻求帮助</li>
          <li>连续打卡可以激励自己保持研究动力</li>
          <li>定期回顾打卡历史，总结研究进展和模式</li>
        </ul>
      </motion.div>
    </div>
  );
}
