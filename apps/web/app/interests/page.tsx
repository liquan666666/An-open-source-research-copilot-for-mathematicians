"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ResearchInterest {
  id: number;
  topic: string;
  description: string;
  level: "初学" | "进阶" | "专家";
  priority: number; // 1-5
}

export default function InterestsPage() {
  const [interests, setInterests] = useState<ResearchInterest[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 新兴趣表单状态
  const [newTopic, setNewTopic] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLevel, setNewLevel] = useState<"初学" | "进阶" | "专家">("初学");
  const [newPriority, setNewPriority] = useState(3);

  // 从localStorage加载数据
  useEffect(() => {
    const saved = localStorage.getItem("researchInterests");
    if (saved) {
      try {
        setInterests(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved interests:", e);
      }
    }
  }, []);

  // 保存到localStorage
  const saveInterests = (newInterests: ResearchInterest[]) => {
    setInterests(newInterests);
    localStorage.setItem("researchInterests", JSON.stringify(newInterests));
  };

  // 添加新兴趣
  const handleAddInterest = () => {
    if (!newTopic.trim()) {
      alert("请输入研究课题！");
      return;
    }

    const newInterest: ResearchInterest = {
      id: Date.now(),
      topic: newTopic,
      description: newDescription,
      level: newLevel,
      priority: newPriority
    };

    saveInterests([...interests, newInterest]);

    // 重置表单
    setNewTopic("");
    setNewDescription("");
    setNewLevel("初学");
    setNewPriority(3);
    setIsAdding(false);
  };

  // 删除兴趣
  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个研究兴趣吗？")) {
      saveInterests(interests.filter(i => i.id !== id));
    }
  };

  // 开始编辑
  const startEdit = (interest: ResearchInterest) => {
    setEditingId(interest.id);
    setNewTopic(interest.topic);
    setNewDescription(interest.description);
    setNewLevel(interest.level);
    setNewPriority(interest.priority);
  };

  // 保存编辑
  const saveEdit = () => {
    if (!newTopic.trim()) {
      alert("请输入研究课题！");
      return;
    }

    saveInterests(interests.map(i =>
      i.id === editingId
        ? { ...i, topic: newTopic, description: newDescription, level: newLevel, priority: newPriority }
        : i
    ));

    // 重置
    setEditingId(null);
    setNewTopic("");
    setNewDescription("");
    setNewLevel("初学");
    setNewPriority(3);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setNewTopic("");
    setNewDescription("");
    setNewLevel("初学");
    setNewPriority(3);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "初学": return "#43e97b";
      case "进阶": return "#667eea";
      case "专家": return "#f5576c";
      default: return "#667eea";
    }
  };

  const getPriorityStars = (priority: number) => {
    return "⭐".repeat(priority);
  };

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
          我的研究兴趣 🎯
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          管理和追踪您的研究方向与兴趣领域
        </p>
      </motion.div>

      {/* 添加按钮 */}
      {!isAdding && editingId === null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          style={{
            marginBottom: "24px",
            padding: "14px 28px",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(67, 233, 123, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          ➕ 添加新的研究兴趣
        </motion.button>
      )}

      {/* 添加/编辑表单 */}
      {(isAdding || editingId !== null) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            fontSize: "1.3rem",
            fontWeight: "700",
            color: "#2d3748",
            marginBottom: "20px"
          }}>
            {editingId ? "✏️ 编辑研究兴趣" : "➕ 添加研究兴趣"}
          </h3>

          {/* 课题名称 */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "#2d3748",
              marginBottom: "8px"
            }}>
              研究课题 *
            </label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="例如：深度学习在数学证明中的应用"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.95rem",
                border: "2px solid #e9ecef",
                borderRadius: "10px",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          {/* 描述 */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "#2d3748",
              marginBottom: "8px"
            }}>
              详细描述
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="描述您对这个方向的兴趣、目标和计划..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                fontSize: "0.95rem",
                border: "2px solid #e9ecef",
                borderRadius: "10px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.6"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          {/* 水平和优先级 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            {/* 研究水平 */}
            <div>
              <label style={{
                display: "block",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "8px"
              }}>
                研究水平
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["初学", "进阶", "专家"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setNewLevel(level)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: `2px solid ${newLevel === level ? getLevelColor(level) : "#e9ecef"}`,
                      background: newLevel === level ? getLevelColor(level) : "white",
                      color: newLevel === level ? "white" : "#4a5568",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label style={{
                display: "block",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "8px"
              }}>
                优先级：{getPriorityStars(newPriority)}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "4px",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#718096", marginTop: "4px" }}>
                <span>低</span>
                <span>高</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: "flex", gap: "12px" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={editingId ? saveEdit : handleAddInterest}
              style={{
                flex: 1,
                padding: "12px",
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
              {editingId ? "💾 保存修改" : "✅ 添加"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (editingId) {
                  cancelEdit();
                } else {
                  setIsAdding(false);
                  setNewTopic("");
                  setNewDescription("");
                }
              }}
              style={{
                flex: 1,
                padding: "12px",
                background: "white",
                color: "#718096",
                border: "2px solid #e9ecef",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              ❌ 取消
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 兴趣列表 */}
      {interests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            color: "#718096",
            fontSize: "1.1rem"
          }}
        >
          📝 还没有添加研究兴趣，点击上方按钮开始添加吧！
        </motion.div>
      ) : (
        <div>
          {interests
            .sort((a, b) => b.priority - a.priority)
            .map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#2d3748",
                    marginBottom: "8px"
                  }}>
                    {interest.topic}
                  </h3>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      background: getLevelColor(interest.level),
                      color: "white"
                    }}>
                      {interest.level}
                    </span>
                    <span style={{ fontSize: "1.1rem" }}>
                      {getPriorityStars(interest.priority)}
                    </span>
                  </div>
                </div>
              </div>

              {interest.description && (
                <p style={{
                  color: "#4a5568",
                  lineHeight: "1.6",
                  marginBottom: "16px",
                  fontSize: "0.95rem"
                }}>
                  {interest.description}
                </p>
              )}

              {/* 操作按钮 */}
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startEdit(interest)}
                  style={{
                    padding: "8px 16px",
                    background: "white",
                    color: "#667eea",
                    border: "2px solid #667eea",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ✏️ 编辑
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(interest.id)}
                  style={{
                    padding: "8px 16px",
                    background: "white",
                    color: "#f5576c",
                    border: "2px solid #f5576c",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  🗑️ 删除
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 使用提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
          💡 使用建议
        </h4>
        <ul style={{ color: "#4a5568", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
          <li>根据优先级排序，专注于最重要的研究方向</li>
          <li>定期更新研究水平，记录自己的成长进度</li>
          <li>在描述中记录具体的学习目标和计划</li>
          <li>数据保存在浏览器本地，清除缓存会导致数据丢失</li>
          <li>建议定期备份重要的研究兴趣列表</li>
        </ul>
      </motion.div>
    </div>
  );
}
