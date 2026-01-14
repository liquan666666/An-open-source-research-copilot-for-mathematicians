"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface Task {
  id: number;
  date: string;
  title: string;
  status: string;
  kind: string;
  details?: any;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskKind, setNewTaskKind] = useState("theory");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const res = await fetch(`${API_BASE}/tasks/today`);
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    await fetch(`${API_BASE}/tasks/today`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle,
        kind: newTaskKind,
        details: {},
      }),
    });

    setNewTaskTitle("");
    setShowAddForm(false);
    loadTasks();
  };

  const updateTaskStatus = async (id: number, status: string) => {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#f0f0f0";
      case "in_progress":
        return "#fff3cd";
      case "done":
        return "#d4edda";
      case "blocked":
        return "#f8d7da";
      default:
        return "#f0f0f0";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "待开始";
      case "in_progress":
        return "进行中";
      case "done":
        return "已完成";
      case "blocked":
        return "受阻";
      default:
        return status;
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>今日任务</h1>
      <Link href="/" style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}>
        ← 返回首页
      </Link>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span style={{ marginLeft: 16, opacity: 0.7 }}>
            共 {tasks.length} 个任务 | 已完成 {tasks.filter((t) => t.status === "done").length} 个
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            backgroundColor: "#0070f3",
            color: "white",
            cursor: "pointer",
          }}
        >
          + 添加任务
        </button>
      </div>

      {showAddForm && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            backgroundColor: "#f9f9f9",
          }}
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="任务标题"
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ddd",
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={newTaskKind}
              onChange={(e) => setNewTaskKind(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            >
              <option value="theory">理论研究</option>
              <option value="experiment">实验/计算</option>
              <option value="writing">论文写作</option>
              <option value="reading">文献阅读</option>
            </select>
            <button
              onClick={addTask}
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: "none",
                backgroundColor: "#0070f3",
                color: "white",
                cursor: "pointer",
              }}
            >
              添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {tasks.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>
            今天还没有任务，点击"+ 添加任务"开始吧！
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
                backgroundColor: getStatusColor(task.status),
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, textDecoration: task.status === "done" ? "line-through" : "none" }}>
                    {task.title}
                  </h3>
                  <div style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: "white",
                        marginRight: 8,
                      }}
                    >
                      {task.kind === "theory"
                        ? "理论"
                        : task.kind === "experiment"
                        ? "实验"
                        : task.kind === "writing"
                        ? "写作"
                        : "阅读"}
                    </span>
                    <span>{getStatusText(task.status)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                  {task.status === "todo" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "in_progress")}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 4,
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      开始
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <>
                      <button
                        onClick={() => updateTaskStatus(task.id, "done")}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 4,
                          border: "1px solid #28a745",
                          backgroundColor: "#28a745",
                          color: "white",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        完成
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, "blocked")}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 4,
                          border: "1px solid #dc3545",
                          backgroundColor: "white",
                          color: "#dc3545",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        受阻
                      </button>
                    </>
                  )}
                  {(task.status === "done" || task.status === "blocked") && (
                    <Link
                      href={`/checkins?task_id=${task.id}`}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 4,
                        border: "1px solid #0070f3",
                        backgroundColor: "white",
                        color: "#0070f3",
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      打卡
                    </Link>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: 14,
                      color: "#999",
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
