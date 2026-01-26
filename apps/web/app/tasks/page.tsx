"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "阅读泛函分析第3章",
      description: "重点理解Banach不动点定理及其应用",
      completed: false,
      priority: "high",
      estimatedTime: "2小时"
    },
    {
      id: 2,
      title: "整理昨天的证明思路",
      description: "将手写笔记转录为LaTeX，检查逻辑漏洞",
      completed: false,
      priority: "high",
      estimatedTime: "1.5小时"
    },
    {
      id: 3,
      title: "数值实验：验证猜想",
      description: "用Python验证n<100时的特殊情况",
      completed: true,
      priority: "medium",
      estimatedTime: "1小时"
    },
    {
      id: 4,
      title: "查阅相关文献",
      description: "搜索近5年关于该主题的最新论文",
      completed: false,
      priority: "medium",
      estimatedTime: "2小时"
    },
    {
      id: 5,
      title: "每周组会准备",
      description: "准备5分钟的进展汇报PPT",
      completed: false,
      priority: "low",
      estimatedTime: "1小时"
    }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const priorityColors = {
    high: "#f5576c",
    medium: "#f093fb",
    low: "#4facfe"
  };

  const priorityLabels = {
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级"
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      {/* Header */}
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
          今日任务 ✅
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#2d3748", margin: 0 }}>
            今日进度
          </h3>
          <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#667eea" }}>
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: "12px",
          background: "#e9ecef",
          borderRadius: "6px",
          overflow: "hidden"
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
              borderRadius: "6px"
            }}
          />
        </div>
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              opacity: task.completed ? 0.6 : 1
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTask(task.id)}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
              {/* Checkbox */}
              <motion.div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  border: `2px solid ${task.completed ? '#43e97b' : '#cbd5e0'}`,
                  background: task.completed ? '#43e97b' : 'transparent',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}
                whileHover={{ scale: 1.1 }}
              >
                {task.completed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ color: "white", fontSize: "14px" }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>

              {/* Task Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <h4 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#2d3748",
                    margin: 0,
                    textDecoration: task.completed ? "line-through" : "none"
                  }}>
                    {task.title}
                  </h4>
                  <span style={{
                    fontSize: "0.85rem",
                    color: "#718096",
                    whiteSpace: "nowrap",
                    marginLeft: "12px"
                  }}>
                    ⏱️ {task.estimatedTime}
                  </span>
                </div>

                <p style={{
                  color: "#4a5568",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  margin: "0 0 12px 0"
                }}>
                  {task.description}
                </p>

                <span style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  background: `${priorityColors[task.priority]}15`,
                  color: priorityColors[task.priority]
                }}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Task Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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
          marginTop: "8px",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
        }}
      >
        + 添加新任务
      </motion.button>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          marginTop: "32px",
          padding: "20px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
          💡 使用提示
        </h4>
        <ul style={{ color: "#4a5568", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
          <li>点击任务可以标记为完成/未完成</li>
          <li>高优先级任务建议优先处理</li>
          <li>每天晚上回顾任务完成情况，前往「打卡监督」记录</li>
        </ul>
      </motion.div>
    </div>
  );
}
