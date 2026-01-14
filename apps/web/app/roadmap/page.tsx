"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface Phase {
  name: string;
  weeks: number;
  start_week: number;
  tasks: string[];
}

interface Roadmap {
  topic: string;
  total_weeks: number;
  daily_hours: number;
  theory_ratio: number;
  created_at: string;
  phases: Phase[];
}

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const topicFromUrl = searchParams.get("topic");

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: topicFromUrl || "",
    weeks: 12,
    daily_hours: 4,
    theory_ratio: 0.7,
  });

  useEffect(() => {
    if (topicFromUrl) {
      setShowForm(true);
    }
    loadRoadmap();
  }, [topicFromUrl]);

  const loadRoadmap = async () => {
    const res = await fetch(`${API_BASE}/roadmap/current`);
    const data = await res.json();
    if (data && data.topic) {
      setRoadmap(data);
      setShowForm(false);
    }
  };

  const generateRoadmap = async () => {
    await fetch(`${API_BASE}/roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    loadRoadmap();
  };

  const deleteRoadmap = async () => {
    if (confirm("确定要删除当前路线图吗？")) {
      await fetch(`${API_BASE}/roadmap/current`, { method: "DELETE" });
      setRoadmap(null);
      setShowForm(true);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>研究路线图</h1>
      <Link href="/" style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}>
        ← 返回首页
      </Link>

      {!roadmap && !showForm && (
        <div style={{ marginTop: 20 }}>
          <p>还没有生成路线图。</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "12px 24px",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              cursor: "pointer",
            }}
          >
            生成新的路线图
          </button>
        </div>
      )}

      {showForm && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
          <h2>生成路线图</h2>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>研究课题</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="输入研究课题名称"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              研究周期（周）
            </label>
            <input
              type="number"
              value={formData.weeks}
              onChange={(e) => setFormData({ ...formData, weeks: Number(e.target.value) })}
              min="4"
              max="52"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              每日工作时间（小时）
            </label>
            <input
              type="number"
              value={formData.daily_hours}
              onChange={(e) => setFormData({ ...formData, daily_hours: Number(e.target.value) })}
              min="1"
              max="12"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              理论研究比例：{Math.round(formData.theory_ratio * 100)}%
            </label>
            <input
              type="range"
              value={formData.theory_ratio}
              onChange={(e) => setFormData({ ...formData, theory_ratio: Number(e.target.value) })}
              min="0"
              max="1"
              step="0.1"
              style={{ width: "100%" }}
            />
          </div>

          <button
            onClick={generateRoadmap}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              cursor: "pointer",
            }}
          >
            生成路线图
          </button>
          {roadmap && (
            <button
              onClick={() => setShowForm(false)}
              style={{
                marginLeft: 8,
                padding: "12px 24px",
                borderRadius: 4,
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              取消
            </button>
          )}
        </div>
      )}

      {roadmap && !showForm && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h2 style={{ margin: 0 }}>{roadmap.topic}</h2>
              <p style={{ marginTop: 8, opacity: 0.7 }}>
                总周期：{roadmap.total_weeks} 周 | 每日 {roadmap.daily_hours} 小时 | 理论比例：
                {Math.round(roadmap.theory_ratio * 100)}%
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  marginRight: 8,
                }}
              >
                重新生成
              </button>
              <button
                onClick={deleteRoadmap}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "#d00",
                  cursor: "pointer",
                }}
              >
                删除
              </button>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            {roadmap.phases.map((phase, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 24,
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ margin: 0 }}>{phase.name}</h3>
                <p style={{ marginTop: 8, opacity: 0.7 }}>
                  第 {phase.start_week} - {phase.start_week + phase.weeks - 1} 周（共 {phase.weeks} 周）
                </p>
                <ul style={{ marginTop: 16, paddingLeft: 20 }}>
                  {phase.tasks.map((task, taskIdx) => (
                    <li key={taskIdx} style={{ marginBottom: 8 }}>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 16, backgroundColor: "#e0f0ff", borderRadius: 8 }}>
            <strong>提示：</strong>路线图已生成！现在可以去
            <Link href="/tasks" style={{ color: "#0070f3", marginLeft: 4, marginRight: 4 }}>
              今日任务
            </Link>
            页面开始执行计划。
          </div>
        </div>
      )}
    </div>
  );
}
