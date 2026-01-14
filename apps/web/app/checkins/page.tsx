"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface CheckIn {
  id: number;
  task_id: number;
  task_title?: string;
  task_date?: string;
  minutes: number;
  note: string;
  status: string;
}

export default function CheckInsPage() {
  const searchParams = useSearchParams();
  const taskIdFromUrl = searchParams.get("task_id");

  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [showForm, setShowForm] = useState(!!taskIdFromUrl);
  const [formData, setFormData] = useState({
    task_id: taskIdFromUrl ? Number(taskIdFromUrl) : 0,
    minutes: 60,
    note: "",
    status: "completed",
  });

  useEffect(() => {
    loadCheckins();
  }, []);

  const loadCheckins = async () => {
    const res = await fetch(`${API_BASE}/checkins/recent?limit=30`);
    const data = await res.json();
    setCheckins(data);
  };

  const submitCheckIn = async () => {
    if (!formData.task_id || !formData.note.trim()) {
      alert("请填写完整信息");
      return;
    }

    await fetch(`${API_BASE}/checkins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    alert("打卡成功！");
    setFormData({ task_id: 0, minutes: 60, note: "", status: "completed" });
    setShowForm(false);
    loadCheckins();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return { text: "已完成", color: "#28a745" };
      case "partial":
        return { text: "部分完成", color: "#ffc107" };
      case "blocked":
        return { text: "受阻", color: "#dc3545" };
      default:
        return { text: status, color: "#6c757d" };
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>打卡监督</h1>
      <Link href="/" style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}>
        ← 返回首页
      </Link>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ opacity: 0.7 }}>记录每日任务完成情况，保持研究进度。</p>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            backgroundColor: "#0070f3",
            color: "white",
            cursor: "pointer",
          }}
        >
          {showForm ? "取消" : "+ 新建打卡"}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3 style={{ marginTop: 0 }}>新建打卡记录</h3>

          {!taskIdFromUrl && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>任务 ID</label>
              <input
                type="number"
                value={formData.task_id || ""}
                onChange={(e) => setFormData({ ...formData, task_id: Number(e.target.value) })}
                placeholder="输入任务 ID"
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                }}
              />
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                提示：在<Link href="/tasks" style={{ color: "#0070f3" }}>今日任务</Link>页面点击"打卡"会自动填充
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>工作时长（分钟）</label>
            <input
              type="number"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: Number(e.target.value) })}
              min="1"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>完成状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            >
              <option value="completed">已完成</option>
              <option value="partial">部分完成</option>
              <option value="blocked">遇到障碍</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>工作笔记</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="今天做了什么？遇到了什么问题？有什么收获？"
              rows={5}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ddd",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            onClick={submitCheckIn}
            style={{
              padding: "12px 24px",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            提交打卡
          </button>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h2>打卡记录</h2>
        {checkins.length === 0 ? (
          <p style={{ opacity: 0.6 }}>还没有打卡记录。</p>
        ) : (
          checkins.map((checkin) => {
            const badge = getStatusBadge(checkin.status);
            return (
              <div
                key={checkin.id}
                style={{
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  marginBottom: 12,
                  backgroundColor: "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{checkin.task_title || `任务 #${checkin.task_id}`}</h4>
                    <div style={{ marginTop: 4, fontSize: 14, opacity: 0.7 }}>
                      {checkin.task_date} · {Math.floor(checkin.minutes / 60)}小时
                      {checkin.minutes % 60}分钟
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 12,
                      backgroundColor: badge.color,
                      color: "white",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {badge.text}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {checkin.note}
                </div>
              </div>
            );
          })
        )}
      </div>

      {checkins.length > 0 && (
        <div style={{ marginTop: 30, padding: 20, backgroundColor: "#e0f0ff", borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>统计概览</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>总打卡次数</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{checkins.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>总工作时长</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {Math.floor(checkins.reduce((sum, c) => sum + c.minutes, 0) / 60)}h
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>完成率</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {Math.round(
                  (checkins.filter((c) => c.status === "completed").length / checkins.length) * 100
                )}
                %
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
